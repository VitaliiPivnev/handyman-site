import Link from "next/link";
import { customerReviews, reviewSources } from "../data/reviews";
import ReviewCarousel from "./ReviewCarousel";
import TrackingLink from "./TrackingLink";

export function TrustStrip() {
  return (
    <section aria-labelledby="trust-heading" className="border-y border-white/15 bg-[#191c22] px-[5vw] py-5 text-white">
      <div className="mx-auto flex max-w-[1180px] flex-wrap items-center gap-x-7 gap-y-3">
        <h2 id="trust-heading" className="text-lg font-extrabold">Trusted by Tampa Bay Homeowners</h2>
        <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/80">
          <li><Link className="underline underline-offset-4" href="/projects">Real completed projects</Link></li>
          <li>Project-based estimates</li>
          <li>Materials by receipt</li>
          {reviewSources.google.url && <li><TrackingLink href={reviewSources.google.url} eventName="external_reviews" eventLabel="google_reviews" className="font-semibold text-yellow-300 underline underline-offset-4">Google reviews</TrackingLink></li>}
          <li><TrackingLink href={reviewSources.thumbtack.url} eventName="external_reviews" eventLabel="thumbtack_reviews" className="font-semibold text-yellow-300 underline underline-offset-4">Thumbtack reviews</TrackingLink></li>
        </ul>
      </div>
    </section>
  );
}

export default function Reviews() {
  return (
    <section id="reviews" aria-labelledby="reviews-heading" className="bg-neutral-950 px-[5vw] py-9 text-white">
      <div className="mx-auto max-w-[1180px]">
        <h2 id="reviews-heading" className="mb-4 text-2xl font-extrabold md:text-4xl">What Our Customers Say</h2>
        <ReviewCarousel reviews={customerReviews} />
        <a href="#estimate" className="mt-5 inline-block font-semibold text-yellow-300 underline underline-offset-4">Request a Free Estimate</a>
      </div>
    </section>
  );
}
