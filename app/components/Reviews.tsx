import Link from "next/link";
import { customerReviews, filterReviews, reviewSources } from "../data/reviews";
import ReviewCarousel from "./ReviewCarousel";
import TrackingLink from "./TrackingLink";

export function TrustStrip() {
  return (
    <section aria-labelledby="trust-heading" className="border-y border-white/15 bg-[#191c22] px-[5vw] py-5 text-white">
      <div className="mx-auto grid max-w-[1180px] gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
        <h2 id="trust-heading" className="text-lg font-extrabold">Trusted by Tampa Bay Homeowners</h2>
        <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/80">
          <li><Link className="underline underline-offset-4" href="/projects">Real completed projects</Link></li>
          <li>Project-based estimates</li>
          <li>Materials by receipt</li>
          <li>Direct communication with the owner</li>
        </ul>
        </div>
        <div className="grid min-w-0 grid-cols-2 gap-2">
          {Object.entries(reviewSources).map(([key, source]) => (
            <TrackingLink key={key} href={source.url} eventName="external_reviews" eventLabel={`${key}_reviews`}
              className="flex min-h-12 items-center gap-2 rounded-xl border border-white/25 px-3 py-2 text-sm font-bold hover:border-yellow-300 focus-visible:outline-yellow-300">
              <span aria-hidden="true" className={`grid size-7 shrink-0 place-items-center rounded-full bg-white ${key === "google" ? "text-blue-700" : "text-sky-700"}`}>{source.mark}</span>
              <span>{source.label} Reviews</span>
            </TrackingLink>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Reviews() {
  return (
    <section id="reviews" aria-labelledby="reviews-heading" className="bg-[#fffaf0] px-[5vw] py-9 text-neutral-950">
      <div className="mx-auto max-w-[1180px]">
        <h2 id="reviews-heading" className="mb-4 text-2xl font-extrabold md:text-4xl">What Our Customers Say</h2>
        <ReviewCarousel reviews={filterReviews(customerReviews, "all")} />
        <a href="#estimate" className="mt-5 inline-block font-semibold text-amber-900 underline underline-offset-4">Request a Free Estimate</a>
      </div>
    </section>
  );
}
