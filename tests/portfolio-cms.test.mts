import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { readFile } from "node:fs/promises";
import sharp from "sharp";
import { isAuthorizedTelegramUser } from "../app/api/portfolio-cms/bot.ts";
import { buildEditedProject, optimizeImageBuffer, transitionProjectPublication } from "../app/api/portfolio-cms/publisher.ts";
import { beginUpdate, completeUpdate, releaseUpdate, withOwnerLock } from "../app/api/portfolio-cms/store.ts";
import { newDraft, sanitizeSlug, validateImportedContent } from "../app/api/portfolio-cms/types.ts";
import { validateAbsentSnapshot, validatePresentSnapshot } from "../.github/scripts/verify-portfolio-deployment.mjs";

const originalOwner = process.env.TELEGRAM_CMS_OWNER_ID;
const originalRedisUrl = process.env.UPSTASH_REDIS_REST_URL;
const originalRedisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const originalFetch = globalThis.fetch;
afterEach(() => {
  if (originalOwner === undefined) delete process.env.TELEGRAM_CMS_OWNER_ID;
  else process.env.TELEGRAM_CMS_OWNER_ID = originalOwner;
  if (originalRedisUrl === undefined) delete process.env.UPSTASH_REDIS_REST_URL;
  else process.env.UPSTASH_REDIS_REST_URL = originalRedisUrl;
  if (originalRedisToken === undefined) delete process.env.UPSTASH_REDIS_REST_TOKEN;
  else process.env.UPSTASH_REDIS_REST_TOKEN = originalRedisToken;
  globalThis.fetch = originalFetch;
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
  assert.equal(sanitizeSlug("  New Door / Tampa!  "), "new-door-tampa");
  assert.ok(sanitizeSlug("a very long project slug that must fit safely inside telegram callback data").length <= 48);
  const unknownPhoto = validateImportedContent({ ...validContent(), imageAlt: { wrong: "Unknown photo" } }, ["photo123"]);
  assert.equal(unknownPhoto.ok, false);
  const unsafe = validateImportedContent({ ...validContent(), description: "<script>alert(1)</script>".repeat(8) }, ["photo123"]);
  assert.equal(unsafe.ok, false);
  const badService = validateImportedContent({ ...validContent(), serviceSlug: "electrical-contracting" }, ["photo123"]);
  assert.equal(badService.ok, false);
});

function installRedisMock() {
  const values = new Map<string, string>();
  process.env.UPSTASH_REDIS_REST_URL = "https://redis.test";
  process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";
  globalThis.fetch = async (_input, init) => {
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
  return values;
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
  await assert.rejects(withOwnerLock("owner-1", async () => undefined), /workflow is busy/);
  releaseOperation();
  await held;
  await withOwnerLock("owner-1", async () => undefined);
});

const sampleProject = {
  id: "real-cabinet-project", title: "Real Cabinet Repair", category: "Cabinets", serviceSlug: "cabinet-repair",
  summary: "A documented cabinet repair project with real photographs.", cover: "/projects/real.webp",
  photos: [{ src: "/projects/real.webp", alt: "Repaired cabinet", stage: "after" as const }], featured: false, detailPage: true,
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
    title: "Updated Cabinet Door and Hardware Repair",
    slug: "attempted-new-url",
    serviceSlug: "cabinet-repair",
    category: "Cabinet Repairs",
    location: "Westchase",
    imageAlt: { "new-photo": "Cabinet after completed door and hardware repair", "existing-1": "Cabinet before the repair" },
  };
  const edited = buildEditedProject(sampleProject, draft, new Map([["new-photo", `public/projects/${sampleProject.id}-after-new-photo.webp`]]));
  assert.equal(edited.id, sampleProject.id);
  assert.equal(edited.title, draft.content!.title);
  assert.equal(edited.seoTitle, draft.content!.seoTitle);
  assert.equal(edited.category, "Cabinet Repairs");
  assert.equal(edited.location, "Westchase");
  assert.deepEqual(edited.photos.map((photo) => photo.stage), ["after", "before"]);
  assert.equal(edited.cover, `/projects/${sampleProject.id}-after-new-photo.webp`);
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
  const [route, store, publisher, projects, sitemap, workflow] = await Promise.all([
    readFile(new URL("../app/api/portfolio-cms/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/portfolio-cms/store.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/portfolio-cms/publisher.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/data/projects.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/sitemap.ts", import.meta.url), "utf8"),
    readFile(new URL("../.github/workflows/portfolio-cms-publish.yml", import.meta.url), "utf8"),
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
