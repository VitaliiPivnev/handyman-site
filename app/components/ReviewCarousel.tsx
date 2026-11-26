"use client";

import { useRef, useState } from "react";
import { filterReviews, reviewSources, type CustomerReview, type ReviewFilter } from "../data/reviews";
import TrackingLink from "./TrackingLink";

const filters = ["all", "google", "thumbtack"] as const;
const control = "min-h-11 rounded-xl border border-white/30 px-3 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-yellow-300";

export default function ReviewCarousel({ reviews }: { reviews: readonly CustomerReview[] }) {
  const [filter, setFilter] = useState<ReviewFilter>("all");
  const track = useRef<HTMLUListElement>(null);
  const visible = filterReviews(reviews, filter);
  const sources = filter === "all" ? Object.entries(reviewSources) : [[filter, reviewSources[filter]]] as const;

  function move(direction: number) {
    const list = track.current;
    const card = list?.firstElementChild;
    if (!list || !card) return;
    const gap = parseFloat(getComputedStyle(list).columnGap) || 0;
    list.scrollBy({ left: direction * (card.getBoundingClientRect().width + gap) });
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="group" aria-label="Filter reviews by platform" className="flex flex-wrap gap-2">
          {filters.map((item) => (
            <button key={item} type="button" aria-pressed={filter === item} aria-controls="customer-review-results"
              className={`${control} ${filter === item ? "bg-yellow-300 text-black" : ""}`}
              onClick={() => setFilter(item)}>
              {item === "all" ? "All Reviews" : reviewSources[item].label}
            </button>
          ))}
        </div>
        {visible.length > 1 && (
          <div className="flex gap-2">
            <button type="button" className={control} aria-label="Previous review" onClick={() => move(-1)}>←</button>
            <button type="button" className={control} aria-label="Next review" onClick={() => move(1)}>→</button>
          </div>
        )}
      </div>
      <div id="customer-review-results" className="mt-4">
        <p role="status" className={visible.length ? "sr-only" : "text-white/80"}>
          {visible.length ? `${visible.length} reviews shown` : filter === "google" && !reviewSources.google.url
            ? "A direct Google review link is currently unavailable."
            : "Read original customer reviews on the platform profile."}
        </p>
        {visible.length > 0 && (
          <ul key={filter} ref={track} aria-label="Customer reviews" tabIndex={0}
            className="grid snap-x snap-mandatory auto-cols-[100%] grid-flow-col gap-4 overflow-x-auto pb-3 motion-safe:scroll-smooth md:auto-cols-[calc((100%_-_1rem)/2)] xl:auto-cols-[calc((100%_-_2rem)/3)]">
            {visible.map((review, index) => (
              <li key={review.sourceId || `${review.platform}-${index}`} className="snap-start break-words rounded-2xl border border-white/15 bg-[#191c22] p-5">
                <article>
                  <h3 className="font-bold">{review.reviewer}</h3>
                  {review.date && <time className="text-sm text-white/75" dateTime={review.date}>{review.date}</time>}
                  {review.rating && <p className="text-yellow-300"><span aria-hidden="true">{"★".repeat(review.rating)}</span><span className="sr-only">{review.rating} out of 5 stars</span></p>}
                  {review.text.length > 260 ? (
                    <details className="group mt-3">
                      <summary className="cursor-pointer"><span className="block group-open:hidden">{review.text.slice(0, 260)}…</span><span className="font-semibold underline">Read more / less</span></summary>
                      <blockquote className="mt-2 whitespace-pre-line">{review.text}</blockquote>
                    </details>
                  ) : <blockquote className="mt-3 whitespace-pre-line">{review.text}</blockquote>}
                  <TrackingLink href={review.sourceUrl} eventName="external_reviews" eventLabel={`${review.platform}_reviews`}
                    className="mt-4 inline-block font-semibold text-yellow-300 underline">{reviewSources[review.platform].label} · Original review source</TrackingLink>
                </article>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-2 flex flex-wrap gap-4">
          {sources.map(([key, source]) => source.url && (
            <TrackingLink key={key} href={source.url} eventName="external_reviews" eventLabel={`${key}_reviews`}
              className="inline-block py-2 font-semibold text-yellow-300 underline underline-offset-4">Read Reviews on {source.label}</TrackingLink>
          ))}
        </div>
      </div>
    </>
  );
}
