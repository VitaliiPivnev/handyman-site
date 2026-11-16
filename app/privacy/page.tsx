import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Handyman Tampa",
  description: "How Handyman Tampa handles contact details, project descriptions, photos, analytics, and website security data.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white px-5 py-16 text-black">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-extrabold">Privacy Policy</h1>

        <p className="mt-4 text-sm text-black/60">Last updated: November 16, 2026</p>
        <p className="mt-6 leading-7">Handyman Tampa uses the information you provide to review your project request and respond to you.</p>

        <h2 className="mt-10 text-2xl font-bold">Information you may provide</h2>
        <p className="mt-3 leading-7">The estimate form may collect your name, phone number, email address, project location, project description, and photos you choose to upload.</p>

        <h2 className="mt-8 text-2xl font-bold">How the information is used</h2>
        <p className="mt-3 leading-7">Your details are used to understand the requested work, contact you about the project, prevent spam or duplicate submissions, and operate the website. Personal information is not sold.</p>

        <h2 className="mt-8 text-2xl font-bold">Website services</h2>
        <p className="mt-3 leading-7">The site uses hosting, security verification, rate limiting, analytics, and message-delivery services. These providers may process limited technical data needed to operate those features. Project requests are delivered through Telegram after server-side security checks.</p>

        <h2 className="mt-8 text-2xl font-bold">Your choices</h2>
        <p className="mt-3 leading-7">Only upload photos that are relevant to the project. Avoid including mail, documents, family photographs, or other private information in the background.</p>

        <h2 className="mt-8 text-2xl font-bold">Contact</h2>
        <p className="mt-3 leading-7">Questions about this policy can be sent to <a className="font-semibold underline" href="mailto:pivnevbss@gmail.com">pivnevbss@gmail.com</a>.</p>
        <Link href="/" className="mt-10 inline-block font-semibold text-amber-800 underline">← Back to Handyman Tampa</Link>
      </div>
    </main>
  );
}
