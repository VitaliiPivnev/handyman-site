import assert from "node:assert/strict";
import { test } from "node:test";
import { fetchThumbtackReviewSnapshot } from "../app/lib/thumbtack-reviews.ts";

const options = { businessId: "123", accessToken: "test", sourceProfileUrl: "https://example.test" };
const next = "https://api.thumbtack.com/v4/businesses/123/reviews?limit=10&offset=10";
const row = (id: string, text: string) => ({ reviewID: id, reviewText: text, rating: 5, reviewerName: "Fixture" });

test("follows every documented next link, deduplicates by ID and preserves unknown origin", async () => {
  const offsets: string[] = [];
  const snapshot = await fetchThumbtackReviewSnapshot({
    ...options,
    request: async (input) => {
      const offset = new URL(String(input)).searchParams.get("offset")!;
      offsets.push(offset);
      return offset === "0"
        ? Response.json({ data: [row("1", "First version")], pagination: { next } })
        : Response.json({ data: [row("1", "Edited"), row("2", "Review from Google")], pagination: {} });
    },
  });
  assert.deepEqual(offsets, ["0", "10"]);
  assert.deepEqual(snapshot.reviews.map(({ text, originalPlatform }) => ({ text, originalPlatform })), [
    { text: "Edited", originalPlatform: "unknown" },
    { text: "Review from Google", originalPlatform: "unknown" },
  ]);
});

test("rejects failed pages, pagination loops and unexpected hosts", async () => {
  for (const status of [401, 429, 503]) {
    let calls = 0;
    await assert.rejects(fetchThumbtackReviewSnapshot({
      ...options,
      request: async () => ++calls === 1
        ? Response.json({ data: [row("1", "Partial")], pagination: { next } })
        : new Response(null, { status }),
    }), new RegExp(String(status)));
    assert.equal(calls, 2);
  }
  for (const [link, message] of [[next, /did not terminate/], ["https://example.test/reviews", /Unexpected/]] as const) {
    await assert.rejects(fetchThumbtackReviewSnapshot({
      ...options,
      request: async () => Response.json({ data: [], pagination: { next: link } }),
    }), message);
  }
});

test("a complete refresh can return an empty snapshot after deletions", async () => {
  const result = await fetchThumbtackReviewSnapshot({
    ...options, request: async () => Response.json({ data: [], pagination: {} }),
  });
  assert.deepEqual(result.reviews, []);
  assert.ok(Date.parse(result.lastSyncedAt));
});
