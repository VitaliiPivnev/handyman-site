import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { detailProjects } from "../../data/projects";
import { business } from "../../data/business";
import StructuredData from "../../components/StructuredData";
import { baseUrl } from "../../data/site";

type Params = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return detailProjects.map((project) => ({ id: project.id }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const project = detailProjects.find((item) => item.id === id);
  if (!project) notFound();
  return {
    title: `${project.title} | Real Handyman Project Photos`,
    description: project.summary.slice(0, 160),
    alternates: { canonical: `/projects/${project.id}` },
    openGraph: { title: `${project.title} | Handyman Tampa`, description: project.summary, url: `/projects/${project.id}`, images: [{ url: project.cover }] },
  };
}

const stageLabel: Record<string, string> = { before: "Before", progress: "During the work", after: "After" };

export default async function ProjectDetailPage({ params }: Params) {
  const { id } = await params;
  const project = detailProjects.find((item) => item.id === id);
  if (!project) notFound();
  const before = project.photos.find((photo) => photo.stage === "before");
  const after = project.photos.find((photo) => photo.stage === "after");
  const ordered = project.photos.filter((photo) => photo !== before && photo !== after);

  return (
    <main className="min-h-screen bg-white text-neutral-950">
      <StructuredData data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${baseUrl}/` },
          { "@type": "ListItem", position: 2, name: "Projects", item: `${baseUrl}/projects` },
          { "@type": "ListItem", position: 3, name: project.title, item: `${baseUrl}/projects/${project.id}` },
        ],
      }} />
      <header className="border-b border-neutral-200 bg-neutral-950 px-5 py-4 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <Link href="/" className="min-w-0 truncate text-lg font-extrabold">{business.name}</Link>
          <Link href="/#estimate" className="shrink-0 rounded-full bg-yellow-400 px-4 py-3 text-sm font-bold text-black sm:px-5">Estimate</Link>
        </div>
      </header>
      <section className="mx-auto max-w-7xl px-5 py-12 md:py-16">
        <nav className="text-sm text-neutral-600" aria-label="Breadcrumbs">
          <Link href="/" className="underline">Home</Link> / <Link href="/projects" className="underline">Projects</Link> / {project.title}
        </nav>
        <p className="mt-8 font-bold uppercase tracking-wide text-amber-700">{project.category} • Real project photographs</p>
        <h1 className="mt-3 max-w-4xl text-4xl font-extrabold md:text-6xl">{project.title}</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-neutral-700">{project.summary}</p>
      </section>
      {before && after ? (
        <section className="bg-neutral-100 px-5 py-14">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-3xl font-extrabold">Before &amp; After</h2>
            <p className="mt-3 max-w-2xl text-neutral-600">Photos show recorded stages of the work and may have been taken from different angles.</p>
            <div className="mt-7 grid gap-5 md:grid-cols-2">
              {[before, after].map((photo) => (
                <figure key={photo.src} className="overflow-hidden rounded-2xl bg-white shadow-sm">
                  <div className="relative aspect-[4/3] bg-neutral-200"><Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-contain" /></div>
                  <figcaption className="p-4"><span className="font-bold text-amber-800">{stageLabel[photo.stage]}:</span> {photo.caption || photo.alt}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      ) : null}
      {ordered.length ? (
        <section className="mx-auto max-w-7xl px-5 py-14">
          <h2 className="text-3xl font-extrabold">Project Progress</h2>
          <div className="mt-7 grid gap-6 md:grid-cols-2">
            {ordered.map((photo) => (
              <figure key={photo.src} className="overflow-hidden rounded-2xl border border-neutral-200">
                <div className="relative aspect-[4/3] bg-neutral-100"><Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-contain" /></div>
                <figcaption className="px-4 py-4 text-neutral-700"><span className="font-semibold">{stageLabel[photo.stage]}:</span> {photo.caption || photo.alt}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      ) : null}
      <section className="bg-neutral-950 px-5 py-16 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-extrabold">Need help with a similar project?</h2>
          <p className="mx-auto mt-4 max-w-2xl leading-7 text-white/70">Send us pictures of your space and the work you&apos;re considering. We&apos;ll review the scope and let you know if it fits our service offerings. Licensed or permit-required work may need another contractor.</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/#estimate" className="rounded-xl bg-yellow-400 px-6 py-4 font-bold text-black">Request an estimate</Link>
            <Link href={`/services/${project.serviceSlug}`} className="rounded-xl border border-white/30 px-6 py-4 font-bold">Related handyman service</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
