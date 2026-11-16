import type { Metadata } from "next";
import Link from "next/link";
import { projectCategories } from "../data/projects";
import Portfolio from "../components/Portfolio";

export const metadata: Metadata = {
  title: "Real Handyman Projects & Before-After Photos | Tampa Bay",
  description: "Browse real photos of decks, pergolas, LVP flooring, drywall repairs, fence work, TV mounting and other completed handyman projects.",
  alternates: { canonical: "/projects" },
  openGraph: { title: "Real Handyman Work | Project Gallery", description: "Photos from actual handyman projects, with before-and-after examples where available.", url: "/projects" },
};

export default function ProjectsPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <header className="border-b border-white/10 px-5 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="text-lg font-extrabold">Handyman Tampa</Link>
          <Link href="/#estimate" className="rounded-full bg-yellow-400 px-5 py-3 text-sm font-bold text-black">Request an estimate</Link>
        </div>
      </header>
      <section className="mx-auto max-w-7xl px-5 py-16">
        <p className="font-semibold text-yellow-300">Portfolio</p>
        <h1 className="mt-3 max-w-4xl text-4xl font-extrabold md:text-6xl">Real Projects. Real Work.</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-white/75">
          Every photo in this portfolio shows actual completed or in-progress work.
          Some projects include a full before-and-after sequence, while others show the finished installation.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          {projectCategories.map((category) => (
            <a key={category} href={`#${category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} className="rounded-full border border-white/30 px-4 py-2 text-sm font-semibold hover:border-yellow-300">
              {category}
            </a>
          ))}
        </div>
      </section>
      {projectCategories.map((category) => (
        <div id={category.toLowerCase().replace(/[^a-z0-9]+/g, "-")} key={category}>
          <Portfolio category={category} heading={category} showAllLink={false} limit={40} description="Photos of real completed work. Open a detailed project to see any earlier stages that were photographed." />
        </div>
      ))}
      <section className="px-5 py-16 text-center">
        <h2 className="text-3xl font-extrabold">Need something similar?</h2>
        <p className="mx-auto mt-3 max-w-2xl text-white/70">Share the project details and photos so we can discuss the scope and whether it&apos;s an appropriate handyman service.</p>
        <Link href="/#estimate" className="mt-7 inline-block rounded-xl bg-yellow-400 px-7 py-4 font-bold text-black">Request a free estimate</Link>
      </section>
    </main>
  );
}
