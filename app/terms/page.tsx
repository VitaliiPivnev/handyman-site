import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Use | Handyman Tampa",
  description: "Website terms for estimate requests, project information, and use of Handyman Tampa website content.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white px-5 py-16 text-black">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-extrabold">Terms of Use</h1>

        <p className="mt-4 text-sm text-black/60">Last updated: November 16, 2026</p>
        <p className="mt-6 leading-7">These terms apply to the use of this website and its estimate-request features.</p>

        <h2 className="mt-10 text-2xl font-bold">Project requests and estimates</h2>
        <p className="mt-3 leading-7">Website submissions are requests for review, not accepted work orders. Any estimate may change if the site conditions, measurements, materials, access, or requested scope differ from the information provided.</p>

        <h2 className="mt-8 text-2xl font-bold">Accurate information</h2>
        <p className="mt-3 leading-7">Please provide accurate contact and project information. Photos and product links should relate to the work being requested and should not include private information that is unnecessary for the estimate.</p>

        <h2 className="mt-8 text-2xl font-bold">Licensed and permit-related work</h2>
        <p className="mt-3 leading-7">Some electrical, structural, roofing, gas, HVAC, plumbing or other regulated projects may require permits or a licensed trade professional. You may still submit project details for an initial scope review, but a website request does not confirm that any work has been accepted.</p>

        <h2 className="mt-8 text-2xl font-bold">Website content</h2>
        <p className="mt-3 leading-7">Project photos and written content on this site may not be republished for commercial use without permission. The website is provided for general information and project inquiries.</p>

        <h2 className="mt-8 text-2xl font-bold">Contact</h2>
        <p className="mt-3 leading-7">Questions about these terms can be sent to <a className="font-semibold underline" href="mailto:pivnevbss@gmail.com">pivnevbss@gmail.com</a>.</p>
        <Link href="/" className="mt-10 inline-block font-semibold text-amber-800 underline">← Back to Handyman Tampa</Link>
      </div>
    </main>
  );
}
