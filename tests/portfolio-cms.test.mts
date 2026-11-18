import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { readFile } from "node:fs/promises";
import sharp from "sharp";
import { isAuthorizedTelegramUser } from "../app/api/portfolio-cms/bot.ts";
import { buildEditedProject, buildNewProject, optimizeImageBuffer, transitionProjectPublication } from "../app/api/portfolio-cms/publisher.ts";
import { beginUpdate, completeUpdate, releaseUpdate, withOwnerLock } from "../app/api/portfolio-cms/store.ts";
import { newDraft, sanitizeSlug, validateImportedContent } from "../app/api/portfolio-cms/types.ts";
import { validateAbsentSnapshot, validatePresentSnapshot } from "../.github/scripts/verify-portfolio-deployment.mjs";
import { safeCmsDiagnostic } from "../app/api/portfolio-cms/errors.ts";
import { GET as cmsHealth, POST as cmsWebhook } from "../app/api/portfolio-cms/route.ts";
import { portfolioCategoryByService, portfolioServiceOptions } from "../app/data/portfolio-categories.ts";
import { services } from "../app/data/site.ts";

const originalOwner = process.env.TELEGRAM_CMS_OWNER_ID;
const originalRedisUrl = process.env.UPSTASH_REDIS_REST_URL;
const originalRedisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const originalBotToken = process.env.TELEGRAM_CMS_BOT_TOKEN;
const originalWebhookSecret = process.env.TELEGRAM_CMS_WEBHOOK_SECRET;
const originalFetch = globalThis.fetch;
const originalConsoleError = console.error;
afterEach(() => {
  if (originalOwner === undefined) delete process.env.TELEGRAM_CMS_OWNER_ID;
  else process.env.TELEGRAM_CMS_OWNER_ID = originalOwner;
  if (originalRedisUrl === undefined) delete process.env.UPSTASH_REDIS_REST_URL;
  else process.env.UPSTASH_REDIS_REST_URL = originalRedisUrl;
  if (originalRedisToken === undefined) delete process.env.UPSTASH_REDIS_REST_TOKEN;
  else process.env.UPSTASH_REDIS_REST_TOKEN = originalRedisToken;
  if (originalBotToken === undefined) delete process.env.TELEGRAM_CMS_BOT_TOKEN;
  else process.env.TELEGRAM_CMS_BOT_TOKEN = originalBotToken;
  if (originalWebhookSecret === undefined) delete process.env.TELEGRAM_CMS_WEBHOOK_SECRET;
  else process.env.TELEGRAM_CMS_WEBHOOK_SECRET = originalWebhookSecret;
  globalThis.fetch = originalFetch;
  console.error = originalConsoleError;
});

const validContent = (photoId = "photo123") => ({
  version: 1,
  title: "Interior Door Alignment and Hardware Repair",
  summary: "Adjusted an interior door and its hardware so it closes and latches correctly.",
  description: "The existing interior door was inspected, aligned at the hinges and adjusted at the latch. The completed work is shown in the supplied project photographs.",
  seoTitle: "Interior Door Alignment Project | Handyman Tampa",
  metaDescription: "See real project photos from an interior door alignment and hardware adjustment completed as part of a residential handyman project.",
  slug: "interior-door-alignment-project",
  serviceSlug: "door-repair",
  category: "Doors & Carpentry",
  imageAlt: { [photoId]: "Interior door after hinge and latch alignment" },
});

test("CMS authorizes only the configured numeric Telegram owner ID", () => {
  process.env.TELEGRAM_CMS_OWNER_ID = "123456789";
  assert.equal(isAuthorizedTelegramUser(123456789), true);
  assert.equal(isAuthorizedTelegramUser("123456789"), true);
  assert.equal(isAuthorizedTelegramUser(987654321), false);
  assert.equal(isAuthorizedTelegramUser("username"), false);
});

test("new drafts are resumable, revisioned, and contain no public project data", () => {
  const draft = newDraft("fixed-id");
  assert.equal(draft.id, "fixed-id");
  assert.equal(draft.revision, 1);
  assert.equal(draft.status, "photos");
  assert.deepEqual(draft.photos, []);
  assert.equal(draft.selectedStage, "after");
});

test("structured import validates SEO, service, slug, photo IDs, and unsafe content", () => {
  const valid = validateImportedContent(validContent(), ["photo123"]);
  assert.equal(valid.ok, true);
  if (valid.ok) {
    assert.equal(valid.value.category, "Door Installation & Repair");
    assert.deepEqual(valid.categoryCorrection, { from: "Doors & Carpentry", to: "Door Installation & Repair" });
  }
  assert.equal(sanitizeSlug("  New Door / Tampa!  "), "new-door-tampa");
  assert.ok(sanitizeSlug("a very long project slug that must fit safely inside telegram callback data").length <= 48);
  const unknownPhoto = validateImportedContent({ ...validContent(), imageAlt: { wrong: "Unknown photo" } }, ["photo123"]);
  assert.equal(unknownPhoto.ok, false);
  const unsafe = validateImportedContent({ ...validContent(), description: "<script>alert(1)</script>".repeat(8) }, ["photo123"]);
  assert.equal(unsafe.ok, false);
  const badService = validateImportedContent({ ...validContent(), serviceSlug: "electrical-contracting" }, ["photo123"]);
  assert.equal(badService.ok, false);
});

test("every website service has one canonical customer-facing portfolio category", () => {
  assert.deepEqual(Object.keys(portfolioCategoryByService).sort(), services.map((service) => service.slug).sort());
  assert.equal(portfolioServiceOptions.length, services.length);
  assert.equal(portfolioCategoryByService["door-repair"], "Door Installation & Repair");
  assert.ok(portfolioServiceOptions.every((option) => option.category.length >= 8));
});

test("version 1 imports may omit category and storm door projects receive the canonical door category", () => {
  const stormDoor: Record<string, unknown> = { ...validContent() };
  delete stormDoor.category;
  const result = validateImportedContent({ ...stormDoor, title: "Storm Door Replacement Project" }, ["photo123"]);
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.value.serviceSlug, "door-repair");
  assert.equal(result.value.category, "Door Installation & Repair");
  assert.deepEqual(result.categoryCorrection, { from: undefined, to: "Door Installation & Repair" });
});

function installRedisMock() {
  const values = new Map<string, string>();
  const telegramMethods: string[] = [];
  process.env.UPSTASH_REDIS_REST_URL = "https://redis.test";
  process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";
  globalThis.fetch = async (input, init) => {
    const url = String(input);
    if (url.startsWith("https://api.telegram.org/")) {
      telegramMethods.push(url.split("/").at(-1) || "unknown");
      return new Response(JSON.stringify({ ok: true, result: {} }), { status: 200, headers: { "content-type": "application/json" } });
    }
    const command = JSON.parse(String(init?.body)) as Array<string | number>;
    const [name, key] = command;
    let result: unknown = null;
    if (name === "GET") result = values.get(String(key)) ?? null;
    if (name === "SET") {
      const nx = command.includes("NX");
      if (!nx || !values.has(String(key))) { values.set(String(key), String(command[2])); result = "OK"; }
    }
    if (name === "DEL") result = values.delete(String(key)) ? 1 : 0;
    if (name === "EVAL") {
      const redisKey = String(command[3]);
      const token = String(command[4]);
      if (values.get(redisKey) === token) {
        if (String(command[1]).includes("'done'")) values.set(redisKey, "done");
        else values.delete(redisKey);
        result = 1;
      } else result = 0;
    }
    return new Response(JSON.stringify({ result }), { status: 200, headers: { "content-type": "application/json" } });
  };
  return { values, telegramMethods };
}

test("failed Telegram updates are released for retry and completed updates are deduplicated", async () => {
  installRedisMock();
  const first = await beginUpdate(7001);
  assert.equal(first.status, "acquired");
  if (first.status !== "acquired") return;
  await releaseUpdate(7001, first.token);
  const retry = await beginUpdate(7001);
  assert.equal(retry.status, "acquired");
  if (retry.status !== "acquired") return;
  assert.equal(await completeUpdate(7001, retry.token), true);
  assert.deepEqual(await beginUpdate(7001), { status: "done" });
});

test("owner lock prevents concurrent Telegram album updates from overwriting a draft", async () => {
  installRedisMock();
  let releaseOperation!: () => void;
  const held = withOwnerLock("owner-1", () => new Promise<void>((resolve) => { releaseOperation = resolve; }));
  await new Promise((resolve) => setImmediate(resolve));
  await assert.rejects(withOwnerLock("owner-1", async () => undefined), /owner_lock_busy/);
  releaseOperation();
  await held;
  await withOwnerLock("owner-1", async () => undefined);
});

test("authorized /start completes Redis claim, lock, Telegram response, and deduplication", async () => {
  const mock = installRedisMock();
  process.env.TELEGRAM_CMS_OWNER_ID = "123456789";
  process.env.TELEGRAM_CMS_BOT_TOKEN = "preview-bot-token";
  process.env.TELEGRAM_CMS_WEBHOOK_SECRET = "preview-webhook-secret";
  const request = () => new Request("https://preview.test/api/portfolio-cms", {
    method: "POST",
    headers: { "content-type": "application/json", "x-telegram-bot-api-secret-token": "preview-webhook-secret" },
    body: JSON.stringify({ update_id: 902, message: { chat: { id: 123456789 }, from: { id: 123456789 }, text: "/start" } }),
  });
  assert.equal((await cmsWebhook(request())).status, 200);
  assert.deepEqual(mock.telegramMethods, ["sendMessage"]);
  assert.equal(mock.values.get("portfolio-cms:update:902"), "done");
  assert.equal(mock.values.has("portfolio-cms:lock:123456789"), false);
  assert.equal((await cmsWebhook(request())).status, 200);
  assert.deepEqual(mock.telegramMethods, ["sendMessage"]);
});

test("Telegram service buttons update both service and canonical category in an existing draft", async () => {
  const mock = installRedisMock();
  process.env.TELEGRAM_CMS_OWNER_ID = "123456789";
  process.env.TELEGRAM_CMS_BOT_TOKEN = "preview-bot-token";
  process.env.TELEGRAM_CMS_WEBHOOK_SECRET = "preview-webhook-secret";
  const validated = validateImportedContent(validContent(), ["photo123"]);
  assert.equal(validated.ok, true);
  if (!validated.ok) return;
  const draft = newDraft("service-selector-draft");
  draft.photos = [{ id: "photo123", telegramFileId: "file-1", stage: "after", order: 0 }];
  draft.content = validated.value;
  mock.values.set("portfolio-cms:draft:123456789", JSON.stringify(draft));
  const response = await cmsWebhook(new Request("https://preview.test/api/portfolio-cms", {
    method: "POST",
    headers: { "content-type": "application/json", "x-telegram-bot-api-secret-token": "preview-webhook-secret" },
    body: JSON.stringify({
      update_id: 903,
      callback_query: { id: "callback-1", from: { id: 123456789 }, data: "svc:fence-repair", message: { chat: { id: 123456789 } } },
    }),
  }));
  assert.equal(response.status, 200);
  const stored = JSON.parse(mock.values.get("portfolio-cms:draft:123456789") || "null");
  assert.equal(stored.content.serviceSlug, "fence-repair");
  assert.equal(stored.content.category, "Fence & Gate Repair");
  assert.deepEqual(stored.categoryCorrection, { from: "Door Installation & Repair", to: "Fence & Gate Repair", reason: "service-selection" });
  assert.deepEqual(mock.telegramMethods, ["answerCallbackQuery", "sendMessage"]);
});

test("Preview readiness includes Redis and webhook configuration without exposing values", async () => {
  process.env.TELEGRAM_CMS_BOT_TOKEN = "private-bot-token";
  process.env.TELEGRAM_CMS_OWNER_ID = "123456789";
  process.env.TELEGRAM_CMS_WEBHOOK_SECRET = "private-webhook-secret";
  process.env.UPSTASH_REDIS_REST_URL = "https://redis.test";
  process.env.UPSTASH_REDIS_REST_TOKEN = "private-redis-token";
  const response = await cmsHealth();
  const body = await response.text();
  assert.equal(response.status, 200);
  assert.deepEqual(JSON.parse(body), { service: "portfolio-cms", configured: true });
  assert.doesNotMatch(body, /private-/);
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
  assert.equal((await (await cmsHealth()).json()).configured, false);
});

test("webhook reports a safe Redis operation code and 503 for a retryable Preview failure", async () => {
  process.env.TELEGRAM_CMS_OWNER_ID = "123456789";
  process.env.TELEGRAM_CMS_BOT_TOKEN = "telegram-secret-value";
  process.env.TELEGRAM_CMS_WEBHOOK_SECRET = "webhook-secret-value";
  process.env.UPSTASH_REDIS_REST_URL = "https://redis.test";
  process.env.UPSTASH_REDIS_REST_TOKEN = "redis-secret-value";
  globalThis.fetch = async () => new Response("temporarily unavailable", { status: 503 });
  const logged: unknown[] = [];
  console.error = (...args: unknown[]) => { logged.push(args); };
  const response = await cmsWebhook(new Request("https://preview.test/api/portfolio-cms", {
    method: "POST",
    headers: { "content-type": "application/json", "x-telegram-bot-api-secret-token": "webhook-secret-value" },
    body: JSON.stringify({ update_id: 901, message: { chat: { id: 123456789 }, from: { id: 123456789 }, text: "/start private message" } }),
  }));
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { ok: false, code: "redis_http_error" });
  const serialized = JSON.stringify(logged);
  assert.match(serialized, /update_claim_read/);
  assert.match(serialized, /"dependencyStatus":503/);
  assert.doesNotMatch(serialized, /secret-value|\/start|123456789|private message/);
});

test("diagnostics classify Telegram failures without logging API descriptions or request data", () => {
  const diagnostic = safeCmsDiagnostic(new Error("token=secret and customer message"));
  const serialized = JSON.stringify(diagnostic);
  assert.match(serialized, /unexpected_error/);
  assert.doesNotMatch(serialized, /token=secret|customer message/);
});

const sampleProject = {
  id: "real-door-project", title: "Real Door Repair", category: "Doors & Carpentry", serviceSlug: "door-repair",
  summary: "A documented door repair project with real photographs.", cover: "/projects/real.webp",
  photos: [{ src: "/projects/real.webp", alt: "Repaired door", stage: "after" as const }], featured: false, detailPage: true,
};

test("unpublish and republish preserve the exact project and drive listing/sitemap membership", () => {
  const hidden = transitionProjectPublication([sampleProject], [], sampleProject.id, "unpublish");
  assert.deepEqual(hidden.published, []);
  assert.equal(hidden.unpublished[0], sampleProject);
  const restored = transitionProjectPublication(hidden.published, hidden.unpublished, sampleProject.id, "republish");
  assert.equal(restored.published[0], sampleProject);
  assert.deepEqual(restored.unpublished, []);
  assert.equal(restored.published[0].id, sampleProject.id);
});

test("in-place editing changes content, SEO, photos, order, category, and location but preserves the URL", () => {
  const draft = newDraft("edit-draft");
  draft.editProjectId = sampleProject.id;
  draft.editWasPublished = true;
  draft.location = "Westchase";
  draft.photos = [
    { id: "new-photo", telegramFileId: "telegram-file", stage: "after", order: 0 },
    { id: "existing-1", existingSrc: sampleProject.photos[0].src, stage: "before", order: 1 },
  ];
  draft.content = {
    ...validContent("new-photo"),
    version: 1 as const,
    title: "Updated Storm Door and Hardware Repair",
    slug: "attempted-new-url",
    serviceSlug: "door-repair",
    category: "Arbitrary Category",
    location: "Westchase",
    imageAlt: { "new-photo": "Storm door after completed hardware repair", "existing-1": "Storm door before the repair" },
  };
  const edited = buildEditedProject(sampleProject, draft, new Map([["new-photo", `public/projects/${sampleProject.id}-after-new-photo.webp`]]));
  assert.equal(edited.id, sampleProject.id);
  assert.equal(edited.title, draft.content!.title);
  assert.equal(edited.seoTitle, draft.content!.seoTitle);
  assert.equal(edited.category, "Door Installation & Repair");
  assert.equal(edited.location, "Westchase");
  assert.deepEqual(edited.photos.map((photo) => photo.stage), ["after", "before"]);
  assert.equal(edited.cover, `/projects/${sampleProject.id}-after-new-photo.webp`);
});

test("new CMS project creation always uses the canonical service category", () => {
  const validated = validateImportedContent(validContent(), ["photo123"]);
  assert.equal(validated.ok, true);
  if (!validated.ok) return;
  const project = buildNewProject(validated.value, [{ src: "/projects/storm-door.webp", alt: "Installed storm door", stage: "after" }]);
  assert.equal(project.serviceSlug, "door-repair");
  assert.equal(project.category, "Door Installation & Repair");
  assert.equal(project.cover, "/projects/storm-door.webp");
});

test("deployment verification requires exact content, canonical, and sitemap state", () => {
  const expectedUrl = "https://handymantampa.net/projects/real-cabinet-project";
  const project = { ...sampleProject, metaDescription: "See the documented cabinet repair and its completed project photos." };
  const html = `<title>${project.title}</title><meta name="description" content="${project.metaDescription}"><link rel="canonical" href="${expectedUrl}">`;
  const sitemap = `<url><loc>${expectedUrl}</loc></url>`;
  assert.deepEqual(validatePresentSnapshot({ html, sitemap, project, expectedUrl }), []);
  assert.ok(validatePresentSnapshot({ html: "<h1>Wrong project</h1>", sitemap, project, expectedUrl }).length >= 2);
  assert.deepEqual(validateAbsentSnapshot({ status: 404, sitemap: "<urlset></urlset>", expectedUrl }), []);
  assert.ok(validateAbsentSnapshot({ status: 200, sitemap, expectedUrl }).length === 2);
});

test("image processing produces metadata-free WebP without enlargement", async () => {
  const source = await sharp({ create: { width: 320, height: 180, channels: 3, background: "#d4a017" } })
    .jpeg().withMetadata({ orientation: 6 }).toBuffer();
  const output = await optimizeImageBuffer(source);
  const metadata = await sharp(output).metadata();
  assert.equal(metadata.format, "webp");
  assert.ok((metadata.width || 0) <= 320);
  assert.ok((metadata.height || 0) <= 320);
  assert.equal(metadata.exif, undefined);
  assert.equal(metadata.icc, undefined);
});

test("webhook, update replay protection, atomic Git publishing, and sitemap integration remain wired", async () => {
  const [route, store, publisher, projects, sitemap, workflow, bot, portfolio, projectsPage] = await Promise.all([
    readFile(new URL("../app/api/portfolio-cms/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/portfolio-cms/store.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/portfolio-cms/publisher.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/data/projects.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/sitemap.ts", import.meta.url), "utf8"),
    readFile(new URL("../.github/workflows/portfolio-cms-publish.yml", import.meta.url), "utf8"),
    readFile(new URL("../app/api/portfolio-cms/bot.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/components/Portfolio.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/projects/page.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(route, /x-telegram-bot-api-secret-token/);
  assert.match(route, /TELEGRAM_CMS_WEBHOOK_SECRET/);
  assert.match(store, /portfolio-cms:update:/);
  assert.match(store, /"NX"/);
  assert.match(store, /DRAFT_TTL = 30/);
  assert.match(publisher, /base_tree/);
  assert.match(publisher, /force: false/);
  assert.match(publisher, /Duplicate photographs were detected/);
  assert.match(publisher, /changeProjectPublication/);
  assert.match(publisher, /"unpublish" \| "republish" \| "delete"/);
  assert.match(publisher, /sha: null/);
  assert.match(projects, /legacyProjects/);
  assert.match(projects, /cmsProjects/);
  assert.match(sitemap, /detailProjects\.map/);
  assert.match(workflow, /verify-portfolio-deployment\.mjs/);
  assert.match(workflow, /app\/data\/cms-unpublished-projects\.json/);
  assert.match(workflow, /publish\|edit\|republish\|unpublish\|delete/);
  assert.match(bot, /callback_data: "services"/);
  assert.match(bot, /callback_data: `svc:\$\{option\.slug\}`/);
  assert.match(bot, /Category.*corrected/);
  assert.match(portfolio, /project\.serviceSlug === serviceSlug/);
  assert.match(portfolio, /project\.category === category/);
  assert.match(projectsPage, /projectCategories\.map/);
  assert.match(projects, /const legacyProjects/);
  assert.match(projects, /"category": "Decks & Pergolas"/);
});

test("publication requires explicit callback approval and preserves a failed draft", async () => {
  const bot = await readFile(new URL("../app/api/portfolio-cms/bot.ts", import.meta.url), "utf8");
  assert.match(bot, /callback_data: "publish"/);
  assert.match(bot, /if \(action === "publish"\)/);
  assert.match(bot, /draft\.status = "publishing"/);
  assert.match(bot, /draft\.status = "failed"/);
  assert.match(bot, /await saveDraft\(userId, draft\)/);
  assert.match(bot, /await removeDraft\(userId\)/);
  assert.match(bot, /Permanently delete/);
  assert.match(bot, /Unpublish \(reversible\)/);
  assert.match(bot, /Yes, unpublish/);
  assert.match(bot, /Full in-place edit/);
  assert.match(bot, /editProjectId/);
});
