import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Handyman Repair Guides for Tampa Bay Homeowners",
  description: "Practical home maintenance tips from a Tampa Bay handyman: sticking doors, repair photos, and planning repairs.",
  alternates: { canonical: "/guides" },
};

const guides = [
  { href: "/guides/door-sticking-florida", title: "Why Interior Doors Stick in Florida", summary: "Humidity, hardware, and alignment: where to look before replacing a door." },
  { href: "/guides/how-to-photograph-a-repair", title: "How to Photograph a Repair for a Faster Estimate", summary: "A simple photo checklist that helps explain your project and reduces back-and-forth." },
];

export default function GuidesPage() {
  return <main className="min-h-screen bg-white px-5 py-16 text-neutral-950">
    <div className="mx-auto max-w-4xl">
      <Link href="/" className="font-semibold text-amber-800 underline">← Handyman Tampa</Link>
      <h1 className="mt-6 text-4xl font-extrabold md:text-5xl">Helpful Home Repair Guides</h1>
      <p className="mt-5 text-lg leading-8 text-neutral-700">Practical advice for planning handyman projects around Tampa Bay.</p>
      <div className="mt-10 grid gap-5">
        {guides.map((guide) => <Link href={guide.href} key={guide.href} className="rounded-2xl border border-neutral-200 p-7 hover:border-amber-600">
          <h2 className="text-2xl font-bold">{guide.title}</h2>
          <p className="mt-3 leading-7 text-neutral-700">{guide.summary}</p>
          <p className="mt-4 font-bold text-amber-800">Read more →</p>
        </Link>)}
      </div>
    </div>
  </main>;
}
