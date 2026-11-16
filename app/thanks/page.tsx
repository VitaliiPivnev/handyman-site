import Link from "next/link";
import { business } from "../data/business";
import type { Metadata } from "next";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function ThanksPage({
  searchParams,
}: {
  searchParams: Promise<{ lead?: string; test?: string }>;
}) {
  const { test } = await searchParams;
  const isTest = test === "1";
  return (
    <main className="min-h-screen bg-neutral-950 px-5 py-20 text-white">
      <div className="mx-auto max-w-3xl text-center">
        <p className="font-semibold text-yellow-400">Estimate request</p>
        <h1 className="mt-3 text-4xl font-extrabold md:text-6xl">{isTest ? "Preview test accepted" : "Thank you!"}</h1>
        <p className="mt-6 text-lg text-white/70">
          {isTest
            ? "This was a safe test. No Telegram message was sent and no lead conversion was recorded."
            : "If you just submitted the form, your request was sent and we will contact you."}
        </p>
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <a href={`tel:${business.phone}`} className="rounded-xl bg-yellow-400 px-6 py-4 font-bold text-black">Call Now</a>
          <a href={`sms:${business.phone}`} className="rounded-xl border border-white/20 px-6 py-4 font-bold text-white">Text Us</a>
          <Link href="/" className="rounded-xl border border-white/20 px-6 py-4 font-bold text-white">Back to Home</Link>
        </div>
      </div>
    </main>
  );
}
