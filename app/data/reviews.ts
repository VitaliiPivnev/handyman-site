export const reviewSources = {
  google: { label: "Google", url: null as string | null },
  thumbtack: {
    label: "Thumbtack",
    url: "https://www.thumbtack.com/fl/tampa/handyman/vitalii-handypro/service/528569101242605578",
  },
};

export type ReviewPlatform = keyof typeof reviewSources;
export type ReviewFilter = "all" | ReviewPlatform;
export type CustomerReview = {
  reviewer: string;
  platform: ReviewPlatform;
  text: string;
  date?: string;
  rating?: 1 | 2 | 3 | 4 | 5;
  sourceUrl: string;
  sourceId?: string;
};

// Add records only after verifying the original and permission to republish it.
export const customerReviews: readonly CustomerReview[] = [];

export function filterReviews(reviews: readonly CustomerReview[], filter: ReviewFilter) {
  return reviews.filter((review) => filter === "all" || review.platform === filter);
}
