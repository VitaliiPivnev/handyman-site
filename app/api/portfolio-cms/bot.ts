import { cities } from "../../data/site.ts";
import { getPortfolioCategory, portfolioServiceOptions } from "../../data/portfolio-categories.ts";
import type { Project } from "../../data/projects.ts";
import { changeProjectPublication, listPublishedProjects, listUnpublishedProjects, publishDraft } from "./publisher.ts";
import { beginUpdate, completeUpdate, getDraft, releaseUpdate, removeDraft, saveDraft, withOwnerLock } from "./store.ts";
import { contentTemplate, newDraft, validateImportedContent, type CmsDraft, type CmsStage } from "./types.ts";
import { answerCallback, downloadTelegramTextFile, mainMenu, sendMessage } from "./telegram.ts";
import { CmsRuntimeError } from "./errors.ts";

type TgPhoto = { file_id: string; file_unique_id: string; file_size?: number };
type TgMessage = { chat: { id: number }; from?: { id: number }; text?: string; photo?: TgPhoto[]; document?: { file_id: string; file_name?: string; mime_type?: string } };
type TgCallback = { id: string; from: { id: number }; data?: string; message?: { chat: { id: number } } };
export type TelegramUpdate = { update_id: number; message?: TgMessage; callback_query?: TgCallback };

const ownerId = () => String(process.env.TELEGRAM_CMS_OWNER_ID || "");
export const isAuthorizedTelegramUser = (userId: number | string) => Boolean(ownerId()) && String(userId) === ownerId();
const stageName: Record<CmsStage, string> = { before: "BEFORE", progress: "DURING", after: "AFTER" };
const escapeHtml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function counts(draft: CmsDraft) {
  const count = (stage: CmsStage) => draft.photos.filter((photo) => photo.stage === stage).length;
  return `Draft <code>${draft.id.slice(0, 8)}</code>\nBEFORE: ${count("before")}\nDURING: ${count("progress")}\nAFTER: ${count("after")}\nSelected: <b>${stageName[draft.selectedStage]}</b>`;
}

function draftMenu() {
  return [
    [
      { text: "BEFORE", callback_data: "stage:before" },
      { text: "DURING", callback_data: "stage:progress" },
      { text: "AFTER", callback_data: "stage:after" },
    ],
    [{ text: "🖼 Manage Photos", callback_data: "photos" }, { text: "📝 Description", callback_data: "description" }],
    [{ text: "🧰 Service & Category", callback_data: "services" }],
    [{ text: "📍 Location", callback_data: "location" }, { text: "📋 Copy Template", callback_data: "template" }],
    [{ text: "📥 Import JSON", callback_data: "import" }, { text: "👁 Preview", callback_data: "preview" }],
    [{ text: "💾 Save Draft", callback_data: "save" }, { text: "❌ Cancel", callback_data: "cancel" }],
    [{ text: "Main Menu", callback_data: "menu" }],
  ];
}

async function showDraft(chatId: number, draft: CmsDraft, note = "Send photos in the selected category, including Telegram albums.") {
  await sendMessage(chatId, `${note}\n\n${counts(draft)}`, draftMenu());
}

function preview(draft: CmsDraft): string {
  const content = draft.content;
  if (!content) return `${counts(draft)}\n\nNo imported project content yet.`;
  const grouped = (["before", "progress", "after"] as CmsStage[]).map((stage) => `${stageName[stage]}: ${draft.photos.filter((p) => p.stage === stage).length}`).join(" · ");
  const effectiveSlug = draft.editProjectId || content.slug;
  const correction = draft.categoryCorrection
    ? `\n\n⚠️ <b>Category ${draft.categoryCorrection.from ? "corrected" : "assigned"}:</b> ${draft.categoryCorrection.from ? `${escapeHtml(draft.categoryCorrection.from)} → ` : ""}${escapeHtml(draft.categoryCorrection.to)}`
    : "";
  return `<b>${escapeHtml(content.title)}</b>\n\n${escapeHtml(content.summary)}\n\n${escapeHtml(content.description)}\n\n<b>SEO title:</b> ${escapeHtml(content.seoTitle)}\n<b>Meta:</b> ${escapeHtml(content.metaDescription)}\n<b>URL:</b> /projects/${effectiveSlug}${draft.editProjectId ? " (preserved)" : ""}\n<b>Service:</b> ${content.serviceSlug}\n<b>Category:</b> ${escapeHtml(content.category)}${correction}\n<b>Location:</b> ${escapeHtml(content.location || draft.location || "Not supplied")}\n<b>Photos:</b> ${grouped}`;
}

function editDraft(project: Project, wasPublished: boolean): CmsDraft {
  const draft = newDraft();
  draft.editProjectId = project.id;
  draft.editWasPublished = wasPublished;
  draft.status = "preview";
  draft.location = project.location;
  draft.selectedServiceSlug = project.serviceSlug;
  draft.photos = project.photos.map((photo, order) => ({ id: `existing-${order + 1}`, existingSrc: photo.src, stage: photo.stage, order }));
  draft.content = {
    version: 1,
    title: project.title,
    summary: project.summary,
    description: project.description || project.summary,
    seoTitle: project.seoTitle || `${project.title} | Handyman Tampa`,
    metaDescription: project.metaDescription || project.summary.slice(0, 160),
    slug: project.id,
    serviceSlug: project.serviceSlug,
    category: getPortfolioCategory(project.serviceSlug) || project.category,
    location: project.location,
    imageAlt: Object.fromEntries(project.photos.map((photo, index) => [`existing-${index + 1}`, photo.alt])),
  };
  if (draft.content.category !== project.category) draft.categoryCorrection = { from: project.category, to: draft.content.category, reason: "edit" };
  return draft;
}

async function importJson(chatId: number, userId: string, draft: CmsDraft, raw: string) {
  let parsed: unknown;
  try { parsed = JSON.parse(raw); } catch { await sendMessage(chatId, "❌ Invalid JSON. Check commas, quotes and braces, then paste it again."); return; }
  const validated = validateImportedContent(parsed, draft.photos.map((photo) => photo.id));
  if (!validated.ok) {
    await sendMessage(chatId, `❌ Content needs correction:\n• ${validated.errors.join("\n• ")}`);
    return;
  }
  draft.content = validated.value;
  draft.selectedServiceSlug = validated.value.serviceSlug;
  draft.categoryCorrection = validated.categoryCorrection ? { ...validated.categoryCorrection, reason: "import" } : undefined;
  if (validated.value.location) draft.location = validated.value.location;
  draft.status = "preview";
  draft.revision += 1;
  await saveDraft(userId, draft);
  await sendMessage(chatId, `${preview(draft)}\n\nReview everything before publishing.`, [
    [{ text: "✅ Publish", callback_data: "publish" }],
    [{ text: "✏️ Edit Text", callback_data: "import" }, { text: "🖼 Edit Photos", callback_data: "photos" }],
    [{ text: "🧰 Change Service", callback_data: "services" }, { text: "📍 Edit Location", callback_data: "location" }],
    [{ text: "💾 Save Draft", callback_data: "save" }],
    [{ text: "❌ Cancel", callback_data: "cancel" }],
  ]);
}

async function handleMessage(message: TgMessage, userId: string) {
  const chatId = message.chat.id;
  if (message.text === "/start" || message.text === "/menu") {
    await sendMessage(chatId, "Private Portfolio CMS", mainMenu); return;
  }
  const draft = await getDraft(userId);
  if (!draft) { await sendMessage(chatId, "No active draft. Choose New Project.", mainMenu); return; }
  if (message.photo?.length) {
    const photo = message.photo[message.photo.length - 1];
    if ((photo.file_size || 0) > 12 * 1024 * 1024) { await sendMessage(chatId, "That photo is too large. Please send a version under 12 MB."); return; }
    if (draft.photos.some((item) => item.telegramUniqueId === photo.file_unique_id)) { await sendMessage(chatId, "This photo is already in the draft."); return; }
    if (draft.photos.length >= 30) { await sendMessage(chatId, "A project can contain up to 30 photos."); return; }
    draft.photos.push({ id: crypto.randomUUID().slice(0, 8), telegramFileId: photo.file_id, telegramUniqueId: photo.file_unique_id, stage: draft.selectedStage, order: draft.photos.length });
    draft.revision += 1;
    await saveDraft(userId, draft);
    await showDraft(chatId, draft, `✅ Added one ${stageName[draft.selectedStage]} photo.`);
    return;
  }
  if (draft.status === "description" && message.text) {
    draft.shortDescription = message.text.trim().slice(0, 1000); draft.status = "photos"; draft.revision += 1;
    await saveDraft(userId, draft); await showDraft(chatId, draft, "Description saved."); return;
  }
  if (draft.status === "location" && message.text) {
    draft.location = message.text.trim().slice(0, 100);
    if (draft.content) draft.content.location = draft.location;
    draft.status = "photos"; draft.revision += 1;
    await saveDraft(userId, draft); await showDraft(chatId, draft, "Location saved. Only use a city you confirmed."); return;
  }
  if (draft.status === "content") {
    const raw = message.document && (message.document.mime_type === "application/json" || message.document.file_name?.endsWith(".json"))
      ? await downloadTelegramTextFile(message.document.file_id)
      : message.text;
    if (!raw) { await sendMessage(chatId, "Paste the JSON or upload a .json file."); return; }
    await importJson(chatId, userId, draft, raw); return;
  }
  await showDraft(chatId, draft, "Use the buttons below or send photos.");
}

async function handleCallback(callback: TgCallback, userId: string) {
  const chatId = callback.message?.chat.id;
  if (!chatId) return;
  const action = callback.data || "";
  await answerCallback(callback.id);
  if (action === "menu") { await sendMessage(chatId, "Private Portfolio CMS", mainMenu); return; }
  if (action === "new") {
    const existing = await getDraft(userId);
    if (existing) { await showDraft(chatId, existing, "An active draft already exists. Resume or cancel it before creating another."); return; }
    const draft = newDraft(); await saveDraft(userId, draft); await showDraft(chatId, draft); return;
  }
  if (action === "drafts") {
    const draft = await getDraft(userId);
    if (draft) await showDraft(chatId, draft, "Resumed saved draft.");
    else await sendMessage(chatId, "No saved draft.", mainMenu);
    return;
  }
  if (action === "published") {
    const [published, unpublished] = await Promise.all([listPublishedProjects(), listUnpublishedProjects()]);
    const rows = [
      ...published.slice(0, 20).map((p) => [{ text: `✏️ ${p.title.slice(0, 35)}`, callback_data: `manage:${p.id}` }]),
      ...unpublished.slice(0, 20).map((p) => [{ text: `↩️ ${p.title.slice(0, 35)}`, callback_data: `repub:${p.id}` }]),
      [{ text: "Main Menu", callback_data: "menu" }],
    ];
    await sendMessage(chatId, `<b>CMS projects</b>\nPublished: ${published.length}\nUnpublished: ${unpublished.length}\nSelect a project to manage it.`, rows);
    return;
  }
  if (action.startsWith("manage:")) {
    const id = action.slice(7);
    await sendMessage(chatId, `Manage <code>${escapeHtml(id)}</code>`, [
      [{ text: "Full in-place edit", callback_data: `edit:${id}` }],
      [{ text: "Unpublish (reversible)", callback_data: `askunpub:${id}` }],
      [{ text: "Permanently delete", callback_data: `askdel:${id}` }],
      [{ text: "Back", callback_data: "published" }],
    ]); return;
  }
  if (action.startsWith("edit:")) {
    const id = action.slice(5);
    const activeDraft = await getDraft(userId);
    if (activeDraft) { await showDraft(chatId, activeDraft, "Finish or cancel the current draft before editing another project."); return; }
    const [published, unpublished] = await Promise.all([listPublishedProjects(), listUnpublishedProjects()]);
    const project = published.find((item) => item.id === id) || unpublished.find((item) => item.id === id);
    if (!project) { await sendMessage(chatId, "Project no longer exists.", mainMenu); return; }
    const draft = editDraft(project, published.some((item) => item.id === id));
    await saveDraft(userId, draft);
    await showDraft(chatId, draft, "Editing existing project in place. Its slug and URL will remain unchanged. Import updated JSON and manage photos, category, order or location before saving.");
    return;
  }
  if (action.startsWith("askunpub:")) {
    const id = action.slice(9);
    await sendMessage(chatId, `Unpublish <code>${escapeHtml(id)}</code>? The public page and sitemap entry will be removed, but the project can be republished with the same URL.`, [[{ text: "Yes, unpublish", callback_data: `unpub:${id}` }], [{ text: "Cancel", callback_data: `manage:${id}` }]]); return;
  }
  if (action.startsWith("repub:")) {
    const id = action.slice(6);
    await sendMessage(chatId, `Republish <code>${escapeHtml(id)}</code> with its existing URL and content?`, [[{ text: "Yes, republish", callback_data: `confirmrepub:${id}` }], [{ text: "Cancel", callback_data: "published" }]]); return;
  }
  if (action.startsWith("askdel:")) {
    const id = action.slice(7);
    await sendMessage(chatId, `Permanently delete <code>${escapeHtml(id)}</code>, its CMS data and project images? This cannot be undone.`, [[{ text: "Yes, permanently delete", callback_data: `delete:${id}` }], [{ text: "Cancel", callback_data: `manage:${id}` }]]); return;
  }
  if (/^(unpub|confirmrepub|delete):/.test(action)) {
    const [operation, id] = action.split(":");
    const mapped = operation === "unpub" ? "unpublish" : operation === "confirmrepub" ? "republish" : "delete";
    try {
      const sha = await changeProjectPublication(id, mapped);
      await sendMessage(chatId, `✅ ${mapped} commit created: <code>${sha.slice(0, 12)}</code>. GitHub/Vercel will now rebuild the site.`, mainMenu);
    } catch (error) {
      await sendMessage(chatId, `❌ Project update failed: ${error instanceof Error ? escapeHtml(error.message) : "unknown error"}`, mainMenu);
    }
    return;
  }
  if (action === "help") {
    await sendMessage(chatId, "1. Create or resume a draft.\n2. Select BEFORE, DURING or AFTER, then upload photos.\n3. Add an optional description and confirmed city.\n4. Copy the JSON template into ChatGPT Plus.\n5. Import the completed JSON, preview it, and press Publish.\n\nOnly the configured numeric Telegram owner ID can use this bot.", mainMenu); return;
  }
  const draft = await getDraft(userId);
  if (!draft) { await sendMessage(chatId, "No active draft.", mainMenu); return; }
  if (action.startsWith("stage:")) {
    const stage = action.slice(6) as CmsStage;
    if (["before", "progress", "after"].includes(stage)) draft.selectedStage = stage;
    await saveDraft(userId, draft); await showDraft(chatId, draft, `Selected ${stageName[draft.selectedStage]}. Send photos now.`); return;
  }
  if (action === "description") { draft.status = "description"; await saveDraft(userId, draft); await sendMessage(chatId, "Send an optional short project description in Russian or English. It will not be translated automatically."); return; }
  if (action === "location") {
    draft.status = "location"; await saveDraft(userId, draft);
    await sendMessage(chatId, `Send the confirmed project city, or choose Skip. Existing service-area cities include:\n${cities.map((city) => city.name).join(", ")}`, [[{ text: "Skip", callback_data: "skip_location" }], [{ text: "Back", callback_data: "back" }]]); return;
  }
  if (action === "skip_location") { delete draft.location; if (draft.content) delete draft.content.location; draft.status = "photos"; draft.revision += 1; await saveDraft(userId, draft); await showDraft(chatId, draft, "Location omitted. The project will not claim a city."); return; }
  if (action === "services") {
    const rows = portfolioServiceOptions.map((option) => [{
      text: `${option.slug === (draft.content?.serviceSlug || draft.selectedServiceSlug) ? "✓ " : ""}${option.serviceTitle} — ${option.category}`,
      callback_data: `svc:${option.slug}`,
    }]);
    await sendMessage(chatId, "Choose the project service. Its portfolio category is assigned automatically.", [...rows, [{ text: "Back", callback_data: "back" }]]); return;
  }
  if (action.startsWith("svc:")) {
    const serviceSlug = action.slice(4);
    const category = getPortfolioCategory(serviceSlug);
    if (!category) { await sendMessage(chatId, "That service is no longer available. Choose another service."); return; }
    const previousCategory = draft.content?.category;
    draft.selectedServiceSlug = serviceSlug;
    if (draft.content) {
      draft.content.serviceSlug = serviceSlug;
      draft.content.category = category;
    }
    draft.categoryCorrection = previousCategory !== category ? { from: previousCategory, to: category, reason: "service-selection" } : undefined;
    draft.revision += 1;
    await saveDraft(userId, draft);
    await showDraft(chatId, draft, `Service selected. Portfolio category: ${category}.`); return;
  }
  if (action === "template") {
    const ids = draft.photos.map((photo) => `${photo.id} (${stageName[photo.stage]})`).join(", ") || "Upload photos first";
    const template = { ...contentTemplate, serviceSlug: draft.content?.serviceSlug || draft.selectedServiceSlug || contentTemplate.serviceSlug };
    await sendMessage(chatId, `<b>Photo IDs:</b> ${ids}\n\n<pre>${JSON.stringify(template, null, 2).replace(/</g, "&lt;")}</pre>\n\nCategory is assigned automatically from the selected service.`); return;
  }
  if (action === "import") { draft.status = "content"; await saveDraft(userId, draft); await sendMessage(chatId, "Paste the version 1 JSON object or upload it as a .json file. Reimporting will not remove your photos."); return; }
  if (action === "preview") { await sendMessage(chatId, preview(draft), draft.content ? [[{ text: "✅ Publish", callback_data: "publish" }], [{ text: "🧰 Change Service", callback_data: "services" }], [{ text: "Back", callback_data: "back" }]] : draftMenu()); return; }
  if (action === "photos") {
    const rows = draft.photos.map((photo) => [{ text: `${stageName[photo.stage]} ${photo.id} ↑`, callback_data: `up:${photo.id}` }, { text: "Move", callback_data: `move:${photo.id}` }, { text: "Delete", callback_data: `del:${photo.id}` }]);
    await sendMessage(chatId, `${counts(draft)}\nEach photo has a stable ID used by imported alt text.`, [...rows, [{ text: "Back", callback_data: "back" }]]); return;
  }
  if (/^(up|move|del):/.test(action)) {
    const [operation, id] = action.split(":"); const index = draft.photos.findIndex((photo) => photo.id === id);
    if (index < 0) { await sendMessage(chatId, "Photo no longer exists."); return; }
    if (operation === "del") draft.photos.splice(index, 1);
    if (operation === "move") draft.photos[index].stage = draft.photos[index].stage === "before" ? "progress" : draft.photos[index].stage === "progress" ? "after" : "before";
    if (operation === "up" && index > 0) [draft.photos[index - 1], draft.photos[index]] = [draft.photos[index], draft.photos[index - 1]];
    draft.photos.forEach((photo, order) => { photo.order = order; }); draft.revision += 1; await saveDraft(userId, draft); await showDraft(chatId, draft, "Photos updated."); return;
  }
  if (action === "back" || action === "save") { draft.status = draft.content ? "preview" : "photos"; await saveDraft(userId, draft); await showDraft(chatId, draft, action === "save" ? "Draft saved for 30 days." : "Draft menu."); return; }
  if (action === "cancel") { await sendMessage(chatId, "Delete this draft permanently?", [[{ text: "Yes, delete draft", callback_data: "confirm_cancel" }], [{ text: "Back", callback_data: "back" }]]); return; }
  if (action === "confirm_cancel") { await removeDraft(userId); await sendMessage(chatId, "Draft deleted.", mainMenu); return; }
  if (action === "publish") {
    if (!draft.content || !draft.photos.length) { await sendMessage(chatId, "Add at least one photo and valid imported content before publishing."); return; }
    const currentValidation = validateImportedContent(draft.content, draft.photos.map((photo) => photo.id));
    if (!currentValidation.ok) { await sendMessage(chatId, `Reimport content before publishing:\n• ${currentValidation.errors.join("\n• ")}`); return; }
    draft.content = currentValidation.value;
    const revision = draft.revision; draft.status = "publishing"; await saveDraft(userId, draft);
    await sendMessage(chatId, "Publishing started. Photos are being optimized and committed atomically. Do not edit this draft until the result arrives.");
    try {
      const result = await publishDraft(draft);
      const latest = await getDraft(userId);
      if (!latest || latest.revision !== revision) throw new Error("Draft changed while publication was running");
      await removeDraft(userId);
      await sendMessage(chatId, `✅ Git commit created: <code>${result.commitSha.slice(0, 12)}</code>\nDeployment verification is running. The final live URL will be sent only after GitHub Actions confirms it.`, mainMenu);
    } catch (error) {
      draft.status = "failed"; draft.error = error instanceof Error ? error.message : "Unknown publication error"; await saveDraft(userId, draft);
      await sendMessage(chatId, `❌ Publication failed: ${draft.error}\nThe draft and photo references were preserved. You can retry after correcting the issue.`, draftMenu());
    }
  }
}

export async function processTelegramUpdate(update: TelegramUpdate): Promise<void> {
  const user = update.message?.from?.id ?? update.callback_query?.from.id;
  const chatId = update.message?.chat.id ?? update.callback_query?.message?.chat.id;
  if (!user || !chatId) return;
  if (!isAuthorizedTelegramUser(user)) { await sendMessage(chatId, "This private CMS is not available for this account."); return; }
  const claim = await beginUpdate(update.update_id);
  if (claim.status !== "acquired") {
    if (claim.status === "done") return;
    throw new CmsRuntimeError("update_already_processing", "redis", "update_claim_acquire", true);
  }
  const claimToken = claim.token;
  try {
    await withOwnerLock(String(user), async () => {
      if (update.callback_query) await handleCallback(update.callback_query, String(user));
      else if (update.message) await handleMessage(update.message, String(user));
    });
    if (!(await completeUpdate(update.update_id, claimToken))) throw new CmsRuntimeError("update_claim_lost", "redis", "update_claim_complete", true);
  } catch (error) {
    await releaseUpdate(update.update_id, claimToken).catch(() => undefined);
    throw error;
  }
}
