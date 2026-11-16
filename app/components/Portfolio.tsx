import Link from "next/link";
import Image from "next/image";
import { projects } from "../data/projects";
import type { Project } from "../data/projects";

type Props = {
  serviceSlug?: string;
  category?: string;
  limit?: number;
  featuredOnly?: boolean;
  heading?: string;
  description?: string;
  showAllLink?: boolean;
};

const homeShowcaseOrder = [
  "wood-deck-build",
  "tv-wood-slat-feature-wall",
  "bedroom-lvp-floor",
  "modern-backyard-pergola",
  "painted-patio-deck",
  "garden-shed-exterior",
];

function ProjectCard({ project }: { project: Project }) {
  const content = (
    <>
      <div className="relative aspect-[4/3] overflow-hidden bg-neutral-200">
        <Image
          src={project.cover}
          alt={project.photos[0]?.alt || project.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.035]"
        />
      </div>
      <div className="p-[19px]">
        <p className="text-xs font-extrabold uppercase tracking-wide text-[#916812]">{project.category}</p>
        <h3 className="mt-2 text-xl font-bold text-[#131718]">{project.title}</h3>
        <p className="mt-2 text-sm leading-6 text-[#69727a]">{project.summary}</p>
        <p className="mt-4 text-sm font-semibold text-amber-800">
          {project.detailPage ? "View project photos & details →" : "Real completed work"}
        </p>
      </div>
    </>
  );

  if (!project.detailPage) {
    return (
      <article className="group overflow-hidden rounded-[18px] border border-[#ddd] bg-white shadow-[0_3px_15px_#00000008]">
        {content}
      </article>
    );
  }

  return (
    <Link
      href={`/projects/${project.id}`}
      className="group block overflow-hidden rounded-[18px] border border-[#ddd] bg-white shadow-[0_3px_15px_#00000008] transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-amber-600"
    >
      {content}
    </Link>
  );
}

export default function Portfolio({
  serviceSlug,
  category,
  limit = 6,
  featuredOnly = false,
  heading = "Recent Handyman Projects",
  description = "Real photos from completed jobs, including before, during and after views where available.",
  showAllLink = true,
}: Props) {
  let selected = projects.filter(
    (project) => (!serviceSlug || project.serviceSlug === serviceSlug) && (!category || project.category === category)
  );
  if (featuredOnly) {
    selected = selected
      .filter((project) => homeShowcaseOrder.includes(project.id))
      .sort((a, b) => homeShowcaseOrder.indexOf(a.id) - homeShowcaseOrder.indexOf(b.id));
  }
  selected = selected.slice(0, limit);

  if (selected.length === 0) return null;

  return (
    <section id={category ? undefined : "projects"} className="bg-[#f4f5f5] px-[5vw] py-[70px] text-[#131718]">
      <div className="mx-auto max-w-[1180px]">
        <p className="text-sm font-extrabold uppercase tracking-[0.1em] text-[#a67712]">Real completed work</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-[clamp(30px,4vw,47px)] font-extrabold tracking-[-0.045em]">{heading}</h2>
          {showAllLink && <Link href="/projects" className="font-bold text-amber-800 underline underline-offset-4">See all projects</Link>}
        </div>
        <p className="mt-3 max-w-[720px] leading-7 text-[#5f6570]">{description}</p>
        <div className="mt-[35px] grid gap-[22px] sm:grid-cols-2 lg:grid-cols-3">
          {selected.map((project) => <ProjectCard key={project.id} project={project} />)}
        </div>
      </div>
    </section>
  );
}
