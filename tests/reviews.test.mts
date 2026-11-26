import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { customerReviews, filterReviews, reviewSources, type CustomerReview } from "../app/data/reviews.ts";

test("filters real records by source and keeps empty feeds empty", () => {
  const records = (["google", "thumbtack"] as const).map((platform): CustomerReview => ({
    id: platform, approved: true, sourceVerified: true, platform, reviewer: "Test fixture", text: "Test fixture", sourceUrl: "https://example.test",
  }));
  assert.deepEqual(filterReviews(records, "all"), records);
  assert.deepEqual(filterReviews(records, "google"), [records[0]]);
  assert.deepEqual(filterReviews(records, "thumbtack"), [records[1]]);
  assert.deepEqual(filterReviews([{ ...records[0], approved: false }, { ...records[1], sourceVerified: false }], "all"), []);
  assert.deepEqual(filterReviews(customerReviews, "all"), []);
  assert.equal(reviewSources.google.label, "Google");
  assert.equal(reviewSources.thumbtack.label, "Thumbtack");
  assert.equal(new URL(reviewSources.thumbtack.url).hostname, "www.thumbtack.com");
  assert.equal(new URL(reviewSources.google.url).searchParams.get("kgmid"), "/g/11ybpxtyc2");
  assert.equal(new URL(reviewSources.thumbtack.url).hash, "#reviews");
});

test("trust and review controls precede the portfolio with accessible fallback and no autoplay", async () => {
  const read = (path: string) => readFile(new URL(path, import.meta.url), "utf8");
  const [home, carousel, reviews] = await Promise.all([
    read("../app/page.tsx"), read("../app/components/ReviewCarousel.tsx"), read("../app/components/Reviews.tsx"),
  ]);
  assert.match(home, /<\/section>\s*<TrustStrip \/>\s*<Reviews \/>\s*<Portfolio/);
  assert.equal(home.match(/<Reviews \/>/g)?.length, 1);
  assert.match(carousel, /aria-pressed/);
  assert.match(carousel, /role="status"/);
  assert.match(carousel, /aria-label="Next review"/);
  assert.match(carousel, /snap-x.*overflow-x-auto/);
  assert.match(carousel, /source\.url &&/);
  assert.doesNotMatch(carousel, /setInterval|autoPlay/);
  assert.match(reviews, /href="#estimate"/);
});
