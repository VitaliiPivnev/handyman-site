import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Why Interior Doors Stick in Florida | Tampa Handyman Tips",
  description: "Learn why a door sticks or won't latch in humid Florida weather, what to check, and when to request a professional door adjustment.",
  alternates: { canonical: "/guides/door-sticking-florida" },
};

export default function DoorGuide() {
  return <main className="min-h-screen bg-white px-5 py-16 text-neutral-950">
    <article className="mx-auto max-w-3xl text-lg leading-8">
      <Link href="/guides" className="text-base font-bold text-amber-800 underline">← All repair guides</Link>
      <p className="mt-8 text-sm font-bold uppercase tracking-wide text-amber-700">Doors • Tampa Bay homeowners</p>
      <h1 className="mt-2 text-4xl font-extrabold leading-tight md:text-5xl">Why Does My Interior Door Stick in Florida?</h1>
      <p className="mt-6 text-neutral-700">A door that worked fine last month may suddenly rub, scrape the frame, or refuse to latch. Florida humidity can be part of the story, but it is not the only possible cause.</p>
      <h2 className="mt-10 text-2xl font-bold">1. Look at where the door rubs</h2>
      <p className="mt-3">Close the door slowly and observe the top, latch side, and bottom clearance. A rubbing corner can point to alignment issues, while widespread tightness may suggest a change in the door or frame.</p>
      <h2 className="mt-8 text-2xl font-bold">2. Check loose hinges and fasteners</h2>
      <p className="mt-3">Repeated use can loosen hinge screws. Visible sagging or a strike plate that is slightly out of alignment may require adjustment. Avoid forcing the latch or overtightening damaged screws.</p>
      <h2 className="mt-8 text-2xl font-bold">3. Consider moisture and paint</h2>
      <p className="mt-3">Humidity can change the dimensions of some wood products. Paint buildup around the edge can also cause rubbing. Before sanding or trimming, understand whether the problem is temporary or the result of underlying movement.</p>
      <h2 className="mt-8 text-2xl font-bold">4. Know when to call a professional</h2>
      <p className="mt-3">If the door is dragging, hinges are pulling away, or the frame appears significantly shifted, a repair assessment is worthwhile. Door or opening damage that involves structural framing or a permitted exterior replacement needs an appropriately licensed contractor.</p>
      <h2 className="mt-8 text-2xl font-bold">What photos help with an estimate?</h2>
      <p className="mt-3">Take a full-height photo of the closed door, one close-up of the rubbing or latch area, and one photo of the hinges. Let us know whether the door is hollow-core or solid-core if you know.</p>
      <div className="mt-10 rounded-2xl bg-neutral-100 p-7">
        <h2 className="text-2xl font-bold">Need help adjusting a sticking door?</h2>
        <p className="mt-2 text-neutral-700">See our door repair service or send photos for a project estimate.</p>
        <Link href="/services/door-repair" className="mt-5 inline-block rounded-xl bg-neutral-950 px-6 py-3 text-base font-bold text-white">Door Repair in Tampa Bay</Link>
      </div>
    </article>
  </main>;
}
