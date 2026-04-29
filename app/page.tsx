import Reviews from "./components/Reviews";
import { business } from "./data/business";
import EstimateForm from "./components/EstimateForm";

const services = [
  {
    title: "Door Repair & Installation",
    image: "/services/door-repair.png",
    slug: "door-repair",
  },
  {
    title: "Interior Painting",
    image: "/services/painting.png",
    slug: "interior-painting",
  },
  {
    title: "Drywall Repair",
    image: "/services/drywall.png",
    slug: "drywall-repair",
  },
  {
    title: "Flooring Installation",
    image: "/services/flooring.png",
    slug: "flooring-installation",
  },
  {
    title: "TV Mounting",
    image: "/services/tv-mounting.png",
    slug: "tv-mounting",
  },
  {
    title: "Furniture Assembly",
    image: "/services/furniture.png",
    slug: "furniture-assembly",
  },
  {
    title: "Plumbing Repairs",
    image: "/services/plumbing.png",
    slug: "plumbing-repairs",
  },
  {
    title: "Fence Repair",
    image: "/services/fence.png",
    slug: "fence-repair",
  },
  {
    title: "General Handyman Services",
    image: "/services/general.png",
    slug: "general-handyman-services",
  },
];

const locations = [
  { name: "Tampa", slug: "tampa" },
  { name: "Clearwater", slug: "clearwater" },
  { name: "St. Petersburg", slug: "st-petersburg" },
  { name: "Brandon", slug: "brandon" },
  { name: "Riverview", slug: "riverview" },
  { name: "Wesley Chapel", slug: "wesley-chapel" },
  { name: "Largo", slug: "largo" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-neutral-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <div className="text-xl font-bold tracking-tight">{business.name}</div>

          <nav className="hidden gap-6 text-sm text-white/80 md:flex">
            <a href="#services" className="hover:text-white">Services</a>
            <a href="#areas" className="hover:text-white">Areas</a>
            <a href="#contact" className="hover:text-white">Contact</a>
          </nav>

          <a
            href={`tel:${business.phone}`}
            className="rounded-full bg-yellow-400 px-4 py-2 text-sm font-semibold text-black"
          >
            Call Now
          </a>
        </div>
      </header>

      {/* HERO */}
      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-16 md:grid-cols-2 md:items-center md:py-24">
        <div>
          <p className="mb-4 inline-flex rounded-full border border-yellow-400/40 px-4 py-2 text-sm text-yellow-300">
            Local handyman service • Free estimates
          </p>

          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            Reliable Handyman <br /> in Tampa Bay Area
          </h1>
          <p className="mt-4 text-lg text-white/70">
            Same-day service • Free estimates • 5-star rated
          </p>

          <p className="mt-5 max-w-xl text-lg leading-8 text-white/75">
            Professional home repairs, installations, painting, drywall, flooring,
            and general handyman work with clean results and clear communication.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href={`tel:${business.phone}`}
              className="rounded-xl bg-yellow-400 px-6 py-4 text-center text-lg font-bold text-black"
            >
              Call {business.displayPhone}
            </a>

            <a
              href="sms:+13054650028"
              className="rounded-xl border border-white/20 px-6 py-4 text-center text-lg font-semibold text-white"
            >
              Text for Estimate
            </a>
          </div>
          <p className="mt-3 text-sm text-white/60">
          Usually responds within 9 minutes
          </p>
          <div className="mt-8 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-2xl bg-white/10 p-4">
              <div className="text-2xl font-bold">Clean</div>
              <div className="text-xs text-white/60">Work Area</div>
            </div>
            <div className="rounded-2xl bg-white/10 p-4">
              <div className="text-2xl font-bold">Fast</div>
              <div className="text-xs text-white/60">Response</div>
            </div>
            <div className="rounded-2xl bg-white/10 p-4">
              <div className="text-2xl font-bold">Local</div>
              <div className="text-xs text-white/60">{business.city}</div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl">
          <div className="rounded-2xl bg-neutral-900 p-6">
            <h2 className="text-2xl font-bold">Get a Free Estimate</h2>
            <p className="mt-2 text-white/65">
              Send photos and a short description of the project.
            </p>

            <div className="mt-6 space-y-3 text-white/80">
              <p>✅ Doors, drywall, painting, flooring</p>
              <p>✅ Small repairs and installations</p>
              <p>✅ Clear project-based pricing</p>
              <p>✅ Materials can be billed by receipt</p>
            </div>

            <a
              href="sms:+13054650028"
              className="mt-6 block rounded-xl bg-white px-5 py-4 text-center font-bold text-black"
            >
              Send Project Details
            </a>
          </div>
        </div>
      </section>

      {/* SERVICES */}
<section id="services" className="bg-white px-5 py-16 text-black">
  <div className="mx-auto max-w-7xl">
    <p className="text-center font-semibold text-yellow-600">What we do</p>

    <h2 className="mt-2 text-center text-3xl font-extrabold md:text-5xl">
      Handyman Services
    </h2>

    <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((service) => (
        <a
  key={service.title}
  href={`/services/${service.slug}`}
  className="group relative h-[320px] overflow-hidden rounded-2xl shadow-lg"
>
  <img
    src={service.image}
    alt={service.title}
    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
  />

  <div className="absolute inset-0 bg-black/35" />

  <div className="absolute bottom-0 p-6">
    <h3 className="text-xl font-bold text-white">
      {service.title}
    </h3>

    <p className="mt-2 text-sm leading-6 text-white/85">
      Professional, clean, and reliable service for your home project.
    </p>

    <p className="mt-4 text-sm font-bold text-yellow-400">
      Learn more →
    </p>
  </div>
</a>
      ))}
    </div>
  </div>
</section>

      {/* WHY */}
      <section className="px-5 py-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-extrabold md:text-5xl">
            Why Homeowners Choose Us
          </h2>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              ["Project-Based Pricing", "No confusing hourly surprises. Clear pricing for the job."],
              ["Clean Work", "We respect your home and leave the work area clean."],
              ["Reliable Communication", "Fast replies, clear updates, and honest expectations."],
            ].map(([title, text]) => (
              <div key={title} className="rounded-2xl bg-white/10 p-6">
                <h3 className="text-xl font-bold">{title}</h3>
                <p className="mt-3 text-white/65">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AREAS */}
      {/* AREAS */}
<section id="areas" className="bg-neutral-900 px-5 py-16">
  <div className="mx-auto max-w-7xl">
    <h2 className="text-3xl font-extrabold md:text-5xl">
      Choose Your Service Area
    </h2>

    <p className="mt-4 max-w-2xl text-white/65">
      Select your city to view handyman services available in your area.
    </p>

    <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {locations.map((location) => (
        <a
          key={location.slug}
          href={`/handyman/${location.slug}`}
          className="rounded-2xl border border-white/10 bg-white/10 px-5 py-4 font-semibold text-white transition hover:bg-yellow-400 hover:text-black"
        >
          {location.name}
        </a>
      ))}
    </div>

    <div className="mt-10 overflow-hidden rounded-2xl border border-white/10">
      <iframe
        src="https://maps.google.com/maps?hl=en&q=Tampa Bay Area Florida&t=&z=9&ie=UTF8&iwloc=B&output=embed"
        className="h-[400px] w-full"
        loading="lazy"
      ></iframe>
    </div>

    <p className="mt-6 text-sm text-white/60">
      Serving Tampa, Clearwater, St. Petersburg, Brandon, Riverview, Wesley Chapel, Largo and nearby areas.
    </p>
  </div>
</section>
            <Reviews />
            <EstimateForm />
      {/* CONTACT */}
      <section id="contact" className="bg-yellow-400 px-5 py-16 text-black">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-extrabold md:text-5xl">
            Ready to Start Your Project?
          </h2>
          <p className="mt-4 text-lg">
            Call or text today for a free estimate.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href={`tel:${business.phone}`}
              className="rounded-xl bg-black px-8 py-4 text-lg font-bold text-white"
            >
              Call Now
            </a>
            <a
              href="sms:+13054650028"
              className="rounded-xl border border-black px-8 py-4 text-lg font-bold"
            >
              Text Us
            </a>
          </div>
        </div>
      </section>

      {/* MOBILE STICKY BUTTON */}
      <div className="fixed bottom-0 left-0 right-0 z-50 grid grid-cols-2 gap-2 border-t border-white/10 bg-neutral-950 p-3 md:hidden">
        <a
          href={`tel:${business.phone}`}
          className="rounded-xl bg-yellow-400 py-3 text-center font-bold text-black"
        >
          Call
        </a>
        <a
          href="sms:+13054650028"
          className="rounded-xl bg-white py-3 text-center font-bold text-black"
        >
          Text
        </a>
      </div>
    </main>
  );
}