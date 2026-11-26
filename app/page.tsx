import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { business } from "./data/business";
import { cities, services } from "./data/site";
import { projects } from "./data/projects";
import Portfolio from "./components/Portfolio";
import Reviews, { TrustStrip } from "./components/Reviews";
import EstimateForm from "./components/EstimateForm";
import TrackingLink from "./components/TrackingLink";
import BusinessJsonLd from "./components/BusinessJsonLd";

export const metadata: Metadata = {
  title: "Handyman Tampa, FL | Home Repair in Tampa Bay",
  description:
    "Handyman services in Tampa Bay near Westchase and ZIP 33626. Drywall, doors, painting, flooring, mounting, fence repair and home projects. Send photos for an estimate.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Handyman Tampa, Westchase & Tampa Bay",
    description: "Home repairs, installation, painting and flooring. Send project photos for a free estimate.",
    url: "/",
    type: "website",
  },
};

const comparisonProjects = [
  { id: "wood-deck-build", heading: "Wood Deck: Framing to Finished", firstLabel: "During", secondLabel: "After" },
  { id: "bedroom-lvp-floor", heading: "Bedroom Flooring: Before & After", firstLabel: "Before", secondLabel: "After" },
  { id: "tv-wood-slat-feature-wall", heading: "TV Wall: Before & After", firstLabel: "Before", secondLabel: "After" },
].map((item) => {
  const project = projects.find((candidate) => candidate.id === item.id)!;
  const first = project.photos.find((photo) => photo.stage === "before") || project.photos.find((photo) => photo.stage === "progress")!;
  const second = project.photos.find((photo) => photo.stage === "after")!;
  return { ...item, first, second };
});

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0e1013] text-[#f5f5f5]">
      <BusinessJsonLd />
      <header className="sticky top-0 z-40 border-b border-[#2b2c30] bg-[#0e1013]/95 px-[5vw] py-5 backdrop-blur">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4">
          <Link href="/" className="min-w-0 truncate text-[22px] font-extrabold tracking-tight max-[520px]:text-base">{business.name}</Link>
          <nav aria-label="Main menu" className="hidden items-center gap-6 text-sm text-white/75 md:flex">
            <Link href="#services" className="hover:text-white">Services</Link>
            {projects.length > 0 && <Link href="/projects" className="hover:text-white">Projects</Link>}
            <Link href="#areas" className="hover:text-white">Areas</Link>
            <Link href="/guides" className="hover:text-white">Helpful Guides</Link>
          </nav>
          <TrackingLink href="#estimate" eventName="estimate_cta" eventLabel="home_header"
            className="shrink-0 rounded-[14px] bg-[#ffd43b] px-[23px] py-[13px] text-sm font-extrabold text-[#151515] hover:bg-yellow-300 max-[520px]:px-3 max-[520px]:py-[11px] max-[520px]:text-xs">
            <span className="max-[420px]:hidden">Request an </span>Estimate
          </TrackingLink>
        </div>
      </header>

      <section className="mx-auto grid max-w-[1280px] gap-10 px-[5vw] py-[50px] md:gap-[55px] md:py-[80px] lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pb-[85px]">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.1em] text-[#ffd43b]">
              Tampa Bay • Home repairs & improvements
            </p>
            <h1 className="mt-[15px] max-w-4xl text-[clamp(42px,5vw,69px)] font-extrabold leading-[1.06] tracking-[-0.06em]">
              Handyman Services in Tampa, Westchase &amp; Tampa Bay
            </h1>
            <p className="mt-5 max-w-[600px] text-lg leading-[1.75] text-[#bec2ca]">
              Serving projects near Westchase and ZIP 33626, with availability across Tampa Bay.
              Get help with drywall, doors, painting, flooring, TV mounting, fence repairs and practical household projects.
            </p>
            <div className="mt-7 flex flex-col gap-[13px] sm:flex-row">
              <Link href="#estimate" className="rounded-[14px] bg-[#ffd43b] px-[23px] py-[13px] text-center font-extrabold text-[#151515] hover:bg-yellow-300">
                Get a Free Project Estimate
              </Link>
              <TrackingLink href={`sms:${business.phone}`} eventName="click_to_text" eventLabel="home_hero"
                className="rounded-[14px] border border-[#696c74] px-[23px] py-[13px] text-center font-bold hover:bg-white/10">
                Text Project Photos
              </TrackingLink>
            </div>
          </div>
          <aside className="overflow-hidden rounded-[20px] border border-[#393b42] bg-[#1c2028]">
            <Link href="/projects/wood-deck-build" className="group block">
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <Image src="/projects/wood-deck-build-card.webp" alt="Completed wooden deck with steps and black railing panels" fill priority sizes="(max-width: 1024px) 90vw, 44vw" className="object-cover transition-transform group-hover:scale-[1.025]" />
              </div>
              <p className="px-5 py-4 font-semibold text-[#f8cf48]">See a real completed project →</p>
            </Link>
          </aside>
      </section>

      <TrustStrip />
      <Reviews />
      <Portfolio
        featuredOnly
        limit={6}
        heading="See Our Projects"
        description="Examples of actual handyman jobs, including wood decks, TV accent walls, flooring, pergolas and exterior improvements."
      />

      <section className="mx-auto max-w-[1200px] px-[5vw] py-[70px]">
        <p className="text-sm font-extrabold uppercase tracking-[0.1em] text-[#ffd43b]">Photo sequences</p>
        <h2 className="mt-2 text-[clamp(30px,4vw,47px)] font-extrabold tracking-[-0.045em]">Before, During &amp; After</h2>
        <p className="mt-3 max-w-[720px] text-lg leading-[1.75] text-[#bec2ca]">Selected projects with real progress photographs. Open a project for captions and the complete available sequence.</p>
        <div className="mt-[35px] space-y-6">
          {comparisonProjects.map((item) => (
            <article key={item.id} className="rounded-[20px] border border-[#383b40] bg-[#191c22] p-5 md:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-[22px] font-bold">{item.heading}</h3>
                <Link href={`/projects/${item.id}`} className="text-sm font-bold text-[#efcd59] underline underline-offset-4">View project</Link>
              </div>
              <div className="mt-[15px] grid gap-5 md:grid-cols-2">
                {[[item.first, item.firstLabel], [item.second, item.secondLabel]].map(([photo, label]) => {
                  const image = photo as typeof item.first;
                  return (
                    <figure key={image.src}>
                      <div className="relative h-[260px] overflow-hidden rounded-xl bg-[#0c0f13] sm:h-[320px]">
                        <Image src={image.src} alt={image.alt} fill sizes="(max-width: 768px) 90vw, 45vw" className="object-contain" />
                      </div>
                      <figcaption className="px-0.5 py-2 font-bold text-[#efcd59]">{label as string}</figcaption>
                    </figure>
                  );
                })}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="services" className="bg-white px-5 py-16 text-neutral-950">
        <div className="mx-auto max-w-7xl">
          <p className="font-semibold text-amber-700">Local handyman services</p>
          <h2 className="mt-2 text-3xl font-extrabold md:text-5xl">What Can We Help You Fix?</h2>
          <p className="mt-4 max-w-3xl text-lg text-neutral-700">
            Select your project for useful scope details, real work examples, what to photograph, and how to request an estimate.
          </p>
          <div className="mt-5 flex flex-wrap gap-3 text-sm font-bold">
            {["drywall-repair", "fence-repair", "door-repair", "general-handyman-services"].map((slug) => {
              const service = services.find((item) => item.slug === slug)!;
              return <Link key={slug} href={`/services/${slug}`} className="rounded-full border border-amber-700/30 px-4 py-2 text-amber-900 hover:border-amber-700">{service.title}</Link>;
            })}
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, index) => (
              <Link key={service.slug} href={`/services/${service.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 transition hover:-translate-y-1 hover:border-amber-500 hover:shadow-lg">
                <div className="relative aspect-[16/9] overflow-hidden bg-neutral-200">
                  <Image src={service.image} alt={`Example of ${service.title.toLowerCase()}`} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition-transform group-hover:scale-[1.03]" />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <p className="font-mono text-xs text-amber-700">{String(index + 1).padStart(2, "0")} / HOME SERVICES</p>
                  <h3 className="mt-3 text-xl font-bold group-hover:text-amber-800">{service.title}</h3>
                  <p className="mt-3 flex-1 leading-7 text-neutral-700">{service.description}</p>
                  <p className="mt-5 font-bold text-amber-800">View service details →</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-neutral-900 px-5 py-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-extrabold md:text-5xl">How to Get Started</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              ["01", "Share your project", "Send the task details, photos, and approximate location."],
              ["02", "Review the scope", "We'll discuss the work, materials, and a project-based estimate."],
              ["03", "Schedule the work", "Agree on timing and the next steps before work starts."],
            ].map(([number, title, detail]) => (
              <div key={number} className="rounded-2xl border border-white/15 bg-white/5 p-7">
                <p className="font-mono text-3xl font-bold text-yellow-400">{number}</p>
                <h3 className="mt-5 text-xl font-bold">{title}</h3>
                <p className="mt-3 leading-7 text-white/70">{detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="areas" className="bg-neutral-950 px-5 py-16">
        <div className="mx-auto max-w-7xl">
          <p className="font-semibold text-yellow-400">Where we work</p>
          <h2 className="mt-2 text-3xl font-extrabold md:text-5xl">Serving Tampa Bay Communities</h2>
          <p className="mt-4 max-w-3xl text-white/70">Westchase, Citrus Park, Town &apos;n&apos; Country, Oldsmar and Odessa are closest to our regular service route. Other Tampa Bay locations depend on the project scope and schedule.</p>
          <div className="mt-9 flex flex-wrap gap-3">
            {cities.map((city) => (
              <Link key={city.slug} href={`/handyman/${city.slug}`}
                className="rounded-full border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold hover:border-yellow-400 hover:text-yellow-300">
                {city.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-neutral-100 px-5 py-14 text-neutral-950">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-semibold text-amber-700">Homeowner tips</p>
              <h2 className="mt-2 text-3xl font-extrabold">Helpful Repair Guides</h2>
            </div>
            <Link href="/guides" className="font-bold underline underline-offset-4">Explore guides</Link>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {[
              { title: "Why Interior Doors Stick in Florida", href: "/guides/door-sticking-florida", desc: "Common causes, simple checks, and signs that a door needs more than a quick adjustment." },
              { title: "How to Photograph a Repair for a Faster Estimate", href: "/guides/how-to-photograph-a-repair", desc: "Get a more useful project estimate with a few well-chosen photos and measurements." },
            ].map((guide) => (
              <Link key={guide.href} href={guide.href} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/10 hover:ring-amber-500">
                <h3 className="text-xl font-bold">{guide.title}</h3>
                <p className="mt-3 leading-7 text-neutral-700">{guide.desc}</p>
                <p className="mt-4 font-bold text-amber-800">Read guide →</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <EstimateForm />
      <section id="contact" className="bg-yellow-400 px-5 py-14 text-neutral-950">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-extrabold md:text-5xl">Have a Project in Mind?</h2>
          <p className="mt-4 text-lg">Call, text, or send project photos. We&apos;ll help you figure out the next step.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <TrackingLink href={`tel:${business.phone}`} eventName="click_to_call" eventLabel="home_footer"
              className="rounded-xl bg-neutral-950 px-7 py-4 font-bold text-white">Call Now</TrackingLink>
            <TrackingLink href={`sms:${business.phone}`} eventName="click_to_text" eventLabel="home_footer"
              className="rounded-xl border border-neutral-950 px-7 py-4 font-bold">Text Us</TrackingLink>
          </div>
        </div>
      </section>
    </main>
  );
}
