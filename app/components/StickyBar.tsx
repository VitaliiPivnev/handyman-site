export default function StickyBar() {
  return (
    <div className="fixed bottom-0 left-0 z-50 w-full bg-black/90 p-3 backdrop-blur md:hidden">
      <div className="flex gap-3">
        <a
          href="tel:+18130000000"
          className="flex-1 rounded-xl bg-yellow-400 py-3 text-center font-bold text-black"
        >
          Call Now
        </a>

        <a
          href="sms:+18130000000"
          className="flex-1 rounded-xl border border-white py-3 text-center font-bold text-white"
        >
          Text
        </a>
      </div>
    </div>
  );
}