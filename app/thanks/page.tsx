import { business } from "../data/business";

export default function ThanksPage() {
  return (
    <main className="min-h-screen bg-neutral-950 px-5 py-20 text-white">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-yellow-400 font-semibold">Request received</p>

        <h1 className="mt-3 text-4xl font-extrabold md:text-6xl">
          Thank you!
        </h1>

        <p className="mt-6 text-lg text-white/70">
          We received your estimate request and will contact you shortly.
        </p>

        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <a
            href={`tel:${business.phone}`}
            className="rounded-xl bg-yellow-400 px-6 py-4 font-bold text-black"
          >
            Call Now
          </a>

          <a
            href="/"
            className="rounded-xl border border-white/20 px-6 py-4 font-bold text-white"
          >
            Back to Home
          </a>
        </div>
      </div>
    </main>
  );
}