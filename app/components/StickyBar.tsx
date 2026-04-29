import { business } from "../data/business";

export default function StickyBar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 grid grid-cols-2 gap-3 border-t border-white/10 bg-neutral-950 p-3 md:hidden">
      <a
        href="tel:+13054650028"
        className="rounded-xl bg-yellow-400 py-3 text-center font-bold text-black"
      >
        Call Now
      </a>

      <a
        href="sms:+13054650028"
        className="rounded-xl border border-white/40 py-3 text-center font-bold text-white"
      >
        Text
      </a>
    </div>
  );
}