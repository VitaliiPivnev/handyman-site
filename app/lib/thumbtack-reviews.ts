const apiOrigin = "https://api.thumbtack.com";

export type SyncedReview = {
  id: string;
  originalPlatform: "google" | "thumbtack" | "unknown";
  reviewerName: string | null;
  rating: number | null;
  text: string | null;
  originalDate: string | null;
  originalReviewUrl?: string;
  sourceProfileUrl: string;
  lastSyncedAt: string;
};

const optionalText = (value: unknown) => typeof value === "string" ? value : null;

/** Candidate snapshot. Call on the server only after partner and display approval. */
export async function fetchThumbtackReviewSnapshot({
  businessId, accessToken, sourceProfileUrl, request = fetch,
}: {
  businessId: string;
  accessToken: string;
  sourceProfileUrl: string;
  request?: typeof fetch;
}): Promise<{ reviews: SyncedReview[]; lastSyncedAt: string }> {
  if (typeof window !== "undefined") throw new Error("Review sync is server-only");
  if (!/^[0-9]+$/.test(businessId) || !accessToken) throw new Error("Review sync credentials are missing or invalid");
  const path = `/v4/businesses/${businessId}/reviews`;
  const seen = new Set<string>();
  const records = new Map<string, Omit<SyncedReview, "lastSyncedAt">>();
  let next: string | null = `${apiOrigin}${path}?limit=10&offset=0`;
  while (next) {
    const url: URL = new URL(next, apiOrigin);
    if (url.origin !== apiOrigin || url.pathname !== path || url.username || url.password || url.hash) {
      throw new Error("Unexpected review pagination URL");
    }
    url.searchParams.sort();
    if (seen.has(url.href) || seen.size >= 1000) throw new Error("Review pagination did not terminate");
    seen.add(url.href);
    const response: Response = await request(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
      redirect: "error",
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new Error(`Thumbtack reviews HTTP ${response.status}`);
    const page: { data?: unknown; pagination?: { next?: unknown } } | null = await response.json();
    if (!Array.isArray(page?.data) || !page.pagination || (page.pagination.next != null && typeof page.pagination.next !== "string")) {
      throw new Error("Invalid review page");
    }
    for (const row of page.data) {
      if (typeof row?.reviewID !== "string" || !row.reviewID) throw new Error("Review missing stable ID");
      const id = `thumbtack-feed:${row.reviewID}`;
      records.set(id, {
        id,
        originalPlatform: "unknown",
        reviewerName: optionalText(row.reviewerName),
        text: optionalText(row.reviewText),
        rating: Number.isInteger(row.rating) && row.rating >= 1 && row.rating <= 5 ? row.rating : null,
        originalDate: optionalText(row.createTime),
        sourceProfileUrl,
      });
    }
    next = page.pagination.next || null;
  }
  const lastSyncedAt = new Date().toISOString();
  return { lastSyncedAt, reviews: [...records.values()].map((review) => ({ ...review, lastSyncedAt })) };
}
