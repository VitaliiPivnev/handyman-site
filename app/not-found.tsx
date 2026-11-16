import Link from "next/link";
import { business } from "./data/business";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-neutral-950 px-5 text-center text-white">
      <div className="max-w-xl">
        <p className="font-mono text-yellow-400">404</p>
        <h1 className="mt-3 text-4xl font-extrabold md:text-6xl">This page could not be found.</h1>
        <p className="mt-5 leading-7 text-white/70">The link may be outdated. Browse our services and real project photos, or contact us about your repair.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="rounded-xl bg-yellow-400 px-6 py-4 font-bold text-black">Back to home</Link>
          <a href={`tel:${business.phone}`} className="rounded-xl border border-white/30 px-6 py-4 font-bold">Call {business.displayPhone}</a>
        </div>
      </div>
    </main>
  );
}
