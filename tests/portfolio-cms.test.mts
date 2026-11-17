import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { readFile } from "node:fs/promises";
import sharp from "sharp";
import { isAuthorizedTelegramUser } from "../app/api/portfolio-cms/bot.ts";
import { optimizeImageBuffer } from "../app/api/portfolio-cms/publisher.ts";
import { newDraft, sanitizeSlug, validateImportedContent } from "../app/api/portfolio-cms/types.ts";

const originalOwner = process.env.TELEGRAM_CMS_OWNER_ID;
afterEach(() => {
  if (originalOwner === undefined) delete process.env.TELEGRAM_CMS_OWNER_ID;
  else process.env.TELEGRAM_CMS_OWNER_ID = originalOwner;
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
  const unknownPhoto = validateImportedContent({ ...validContent(), imageAlt: { wrong: "Unknown photo" } }, ["photo123"]);
  assert.equal(unknownPhoto.ok, false);
  const unsafe = validateImportedContent({ ...validContent(), description: "<script>alert(1)</script>".repeat(8) }, ["photo123"]);
  assert.equal(unsafe.ok, false);
  const badService = validateImportedContent({ ...validContent(), serviceSlug: "electrical-contracting" }, ["photo123"]);
  assert.equal(badService.ok, false);
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
  assert.match(workflow, /Wait for Vercel production page/);
  assert.match(workflow, /Published and verified/);
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
});
