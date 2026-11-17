import { cities } from "../../data/site.ts";
import { changeProjectPublication, listPublishedProjects, listUnpublishedProjects, publishDraft } from "./publisher.ts";
import { claimUpdate, getDraft, removeDraft, saveDraft } from "./store.ts";
import { contentTemplate, newDraft, validateImportedContent, type CmsDraft, type CmsStage } from "./types.ts";
import { answerCallback, downloadTelegramTextFile, mainMenu, sendMessage } from "./telegram.ts";

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
  return `<b>${escapeHtml(content.title)}</b>\n\n${escapeHtml(content.summary)}\n\n${escapeHtml(content.description)}\n\n<b>SEO title:</b> ${escapeHtml(content.seoTitle)}\n<b>Meta:</b> ${escapeHtml(content.metaDescription)}\n<b>URL:</b> /projects/${content.slug}\n<b>Service:</b> ${content.serviceSlug}\n<b>Location:</b> ${escapeHtml(content.location || draft.location || "Not supplied")}\n<b>Photos:</b> ${grouped}`;
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
  if (validated.value.location) draft.location = validated.value.location;
  draft.status = "preview";
  draft.revision += 1;
  await saveDraft(userId, draft);
  await sendMessage(chatId, `${preview(draft)}\n\nReview everything before publishing.`, [
    [{ text: "✅ Publish", callback_data: "publish" }],
    [{ text: "✏️ Edit Text", callback_data: "import" }, { text: "🖼 Edit Photos", callback_data: "photos" }],
    [{ text: "📍 Edit Location", callback_data: "location" }, { text: "💾 Save Draft", callback_data: "save" }],
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
    draft.location = message.text.trim().slice(0, 100); draft.status = "photos"; draft.revision += 1;
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
      [{ text: "Unpublish (reversible)", callback_data: `unpub:${id}` }],
      [{ text: "Permanently delete", callback_data: `askdel:${id}` }],
      [{ text: "Back", callback_data: "published" }],
    ]); return;
  }
  if (action.startsWith("askdel:")) {
    const id = action.slice(7);
    await sendMessage(chatId, `Permanently delete <code>${escapeHtml(id)}</code>, its CMS data and project images? This cannot be undone.`, [[{ text: "Yes, permanently delete", callback_data: `delete:${id}` }], [{ text: "Cancel", callback_data: `manage:${id}` }]]); return;
  }
  if (/^(unpub|repub|delete):/.test(action)) {
    const [operation, id] = action.split(":");
    const mapped = operation === "unpub" ? "unpublish" : operation === "repub" ? "republish" : "delete";
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
  if (action === "skip_location") { delete draft.location; draft.status = "photos"; await saveDraft(userId, draft); await showDraft(chatId, draft, "Location omitted. The project will not claim a city."); return; }
  if (action === "template") {
    const ids = draft.photos.map((photo) => `${photo.id} (${stageName[photo.stage]})`).join(", ") || "Upload photos first";
    await sendMessage(chatId, `<b>Photo IDs:</b> ${ids}\n\n<pre>${JSON.stringify(contentTemplate, null, 2).replace(/</g, "&lt;")}</pre>`); return;
  }
  if (action === "import") { draft.status = "content"; await saveDraft(userId, draft); await sendMessage(chatId, "Paste the version 1 JSON object or upload it as a .json file. Reimporting will not remove your photos."); return; }
  if (action === "preview") { await sendMessage(chatId, preview(draft), draft.content ? [[{ text: "✅ Publish", callback_data: "publish" }], [{ text: "Back", callback_data: "back" }]] : draftMenu()); return; }
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
  if (!(await claimUpdate(update.update_id))) return;
  if (update.callback_query) await handleCallback(update.callback_query, String(user));
  else if (update.message) await handleMessage(update.message, String(user));
}
