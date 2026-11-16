import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How to Take Photos for a Handyman Estimate | Tampa Bay",
  description: "A quick photo checklist for drywall, doors, TV mounting, flooring, and handyman projects so you can request a clearer fixed-price estimate.",
  alternates: { canonical: "/guides/how-to-photograph-a-repair" },
};

export default function PhotoGuide() {
  return <main className="min-h-screen bg-white px-5 py-16 text-neutral-950">
    <article className="mx-auto max-w-3xl text-lg leading-8">
      <Link href="/guides" className="text-base font-bold text-amber-800 underline">← All repair guides</Link>
      <p className="mt-8 text-sm font-bold uppercase tracking-wide text-amber-700">Estimates • Home improvement</p>
      <h1 className="mt-2 text-4xl font-extrabold leading-tight md:text-5xl">How to Take Photos for a Faster Handyman Estimate</h1>
      <p className="mt-6 text-neutral-700">A few clear photos can make the first conversation much more useful. They often help clarify the scope, materials, and whether an in-person visit is necessary.</p>
      <h2 className="mt-10 text-2xl font-bold">Start with a wide photo</h2>
      <p className="mt-3">Stand far enough back to show the surrounding wall, floor, door, or work area. This gives context and helps explain access and nearby finishes.</p>
      <h2 className="mt-8 text-2xl font-bold">Add one or two close-ups</h2>
      <p className="mt-3">Photograph the actual damage or installation points. For a drywall hole, include its approximate dimensions. For a door, show hinges and the rubbing edge.</p>
      <h2 className="mt-8 text-2xl font-bold">Include materials and product information</h2>
      <p className="mt-3">If you already bought an item, a product link or model number can be more helpful than a photo of its unopened box. Assembly manuals are especially useful for complicated furniture.</p>
      <h2 className="mt-8 text-2xl font-bold">Measure what you can</h2>
      <p className="mt-3">For floors, provide approximate square footage. For curtains or shelves, include the intended mounting height and width. For a TV mount, share the TV size, mount model, and wall type if known.</p>
      <h2 className="mt-8 text-2xl font-bold">Keep personal information out of photos</h2>
      <p className="mt-3">Avoid including personal documents, mail, children&apos;s photos, or other private details in project photos. A clear view of the work area is enough.</p>
      <div className="mt-10 rounded-2xl bg-neutral-100 p-7">
        <h2 className="text-2xl font-bold">Ready to request a project estimate?</h2>
        <p className="mt-2 text-neutral-700">Tell us what needs to be done and attach up to three useful photos.</p>
        <Link href="/#estimate" className="mt-5 inline-block rounded-xl bg-neutral-950 px-6 py-3 text-base font-bold text-white">Request Free Estimate</Link>
      </div>
    </article>
  </main>;
}
