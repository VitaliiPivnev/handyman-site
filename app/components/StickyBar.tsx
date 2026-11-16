import { business } from "../data/business";
import TrackingLink from "./TrackingLink";

/** Site-wide mobile CTA. Remove old per-page mobile CTA duplicates when updating those pages. */
export default function StickyBar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 grid grid-cols-2 gap-3 border-t border-white/10 bg-neutral-950 p-3 md:hidden">
      <TrackingLink href={`tel:${business.phone}`} eventName="click_to_call" eventLabel="sticky_mobile"
        className="rounded-xl bg-yellow-400 py-3 text-center font-bold text-black">Call Now</TrackingLink>
      <TrackingLink href={`sms:${business.phone}`} eventName="click_to_text" eventLabel="sticky_mobile"
        className="rounded-xl border border-white/40 py-3 text-center font-bold text-white">Text</TrackingLink>
    </div>
  );
}
