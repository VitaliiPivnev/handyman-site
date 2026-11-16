import Link from "next/link";
import TrackingLink from "./TrackingLink";

const thumbtackUrl =
  "https://www.thumbtack.com/fl/tampa/handyman/vitalii-handypro/service/528569101242605578";

export default function Reviews() {
  return (
    <section id="reviews" className="bg-neutral-950 px-5 py-16 text-white">
      <div className="mx-auto max-w-7xl">
        <p className="font-semibold text-yellow-400">Independent platform reviews</p>
        <h2 className="mt-2 max-w-3xl text-3xl font-extrabold md:text-5xl">
          See What Customers Say on Thumbtack
        </h2>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-white/75">
          Read customer feedback, view project photos, and check the latest rating directly on our Thumbtack profile.
          We link to the original source rather than showing anonymous or unverified quotes.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <TrackingLink
            href={thumbtackUrl}
            target="_blank"
            rel="noopener noreferrer"
            eventName="external_reviews"
            eventLabel="thumbtack_reviews"
            className="rounded-xl bg-yellow-400 px-6 py-4 font-bold text-black hover:bg-yellow-300"
          >
            Read Reviews on Thumbtack
          </TrackingLink>
          <Link href="/#contact" className="rounded-xl border border-white/25 px-6 py-4 font-bold text-white">
            Request a Free Estimate
          </Link>
        </div>
      </div>
    </section>
  );
}
