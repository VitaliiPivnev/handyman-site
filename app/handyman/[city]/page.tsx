import EstimateForm from "../../components/EstimateForm";
import { business } from "../../data/business";

const cityNames: Record<string, string> = {
  tampa: "Tampa",
  "st-petersburg": "St. Petersburg",
  clearwater: "Clearwater",
  brandon: "Brandon",
  riverview: "Riverview",
  "wesley-chapel": "Wesley Chapel",
  lutz: "Lutz",
  carrollwood: "Carrollwood",
  westchase: "Westchase",
};

const services = [
  {
    title: "Door Repair & Installation",
    slug: "door-repair",
    image: "/services/door-repair.png",
    description: "Door repair and installation for interior and exterior doors.",
  },
  {
    title: "Drywall Repair",
    slug: "drywall-repair",
    image: "/services/drywall.png",
    description: "Drywall repair, patching, cracks, holes, and texture matching.",
  },
  {
    title: "Interior Painting",
    slug: "interior-painting",
    image: "/services/painting.png",
    description: "Interior painting for walls, ceilings, trim, and touch-ups.",
  },
  {
    title: "Flooring Installation",
    slug: "flooring-installation",
    image: "/services/flooring.png",
    description: "Laminate, vinyl plank, and flooring installation services.",
  },
  {
    title: "TV Mounting",
    slug: "tv-mounting",
    image: "/services/tv-mounting.png",
    description: "Secure TV mounting with clean setup and wire management.",
  },
  {
    title: "Furniture Assembly",
    slug: "furniture-assembly",
    image: "/services/furniture.png",
    description: "Furniture assembly for IKEA, Amazon, cabinets, beds, and more.",
  },
  {
    title: "Plumbing Repairs",
    slug: "plumbing-repairs",
    image: "/services/plumbing.png",
    description: "Small plumbing repairs, faucets, leaks, toilets, and drains.",
  },
  {
    title: "Fence Repair",
    slug: "fence-repair",
    image: "/services/fence.png",
    description: "Fence repair, wood panels, posts, gates, and small installs.",
  },
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city } = await params;

  const cityFormatted =
    city === "st-petersburg"
      ? "St. Petersburg"
      : city.charAt(0).toUpperCase() + city.slice(1);

  return {
    title: `Handyman in ${cityFormatted}, FL | Handyman Tampa`,
    description: `Reliable handyman services in ${cityFormatted}, FL. Doors, drywall, painting, flooring and more. Call for a free estimate.`,
  };
}

export default async function CityPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city: citySlug } = await params;
  const city = cityNames[citySlug] || citySlug;

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-neutral-950/90 backdrop-blur">
  <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
    <a href="/" className="flex items-center gap-3 hover:opacity-90 transition">
      <img
        src="/logo.png"
        alt="Tampa Handyman"
        className="h-9 w-auto object-contain"
      />
      <span className="text-lg md:text-xl font-extrabold tracking-wide text-white">
        {business.name}
      </span>
    </a>

    <nav className="hidden gap-6 text-sm text-white/80 md:flex">
      <a href="/#services" className="hover:text-white transition">
        Services
      </a>
      <a href="/#areas" className="hover:text-white transition">
        Areas
      </a>
      <a href="/#contact" className="hover:text-white transition">
        Contact
      </a>
    </nav>

    <a
      href={`tel:${business.phone}`}
      className="rounded-full bg-yellow-400 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-300 transition"
    >
      Call Now
    </a>
  </div>
</header>

      <section className="mx-auto max-w-7xl px-5 py-16 md:py-24">
        <p className="mb-4 inline-flex rounded-full border border-yellow-400/40 px-4 py-2 text-sm text-yellow-300">
          Serving {city}, FL • Free estimates
        </p>

        <h1 className="max-w-4xl text-4xl font-extrabold leading-tight md:text-6xl">
          Handyman Services in {city}, FL
        </h1>

        <p className="mt-6 max-w-3xl text-lg leading-8 text-white/75">
          Looking for a reliable handyman in {city}? We help homeowners with
          professional repairs, installations, painting, drywall, flooring, and
          general home improvement projects.
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
      </section>

      <section className="bg-white px-5 py-16 text-black">
        <div className="mx-auto max-w-7xl">
          <p className="font-semibold text-yellow-600">Services in {city}</p>
          <h2 className="mt-2 text-3xl font-extrabold md:text-5xl">
            Home Repair & Installation Services
          </h2>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service) => (
              <a
                key={service.slug}
                href={`/handyman/${citySlug}/${service.slug}`}
                className="group relative h-[320px] overflow-hidden rounded-2xl shadow-lg"
              >
                <img
                  src={service.image}
                  alt={service.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-black/35 transition group-hover:bg-black/50" />

                <div className="absolute bottom-0 p-6">
                  <h3 className="text-xl font-bold text-white">
                    {service.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-white/85">
                    {service.description} Serving {city} and nearby areas.
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

      <section className="px-5 py-16">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-3">
          <div className="rounded-2xl bg-white/10 p-6">
            <h3 className="text-xl font-bold">Project-Based Pricing</h3>
            <p className="mt-3 text-white/65">
              Clear pricing for the project instead of confusing hourly work.
            </p>
          </div>

          <div className="rounded-2xl bg-white/10 p-6">
            <h3 className="text-xl font-bold">Clean Work</h3>
            <p className="mt-3 text-white/65">
              We respect your home and keep the work area clean.
            </p>
          </div>

          <div className="rounded-2xl bg-white/10 p-6">
            <h3 className="text-xl font-bold">Fast Communication</h3>
            <p className="mt-3 text-white/65">
              Send photos and project details for a quick estimate.
            </p>
          </div>
        </div>
      </section>
      <EstimateForm />
      <section className="bg-yellow-400 px-5 py-16 text-black">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-extrabold md:text-5xl">
            Need Handyman Help in {city}?
          </h2>
          <p className="mt-4 text-lg">
            Call or text today and send photos of your project.
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

      {/* SEO TEXT BLOCK */}
<section className="bg-neutral-950 px-5 py-16 text-white">
  <div className="mx-auto max-w-4xl text-white/80">
    <h2 className="text-2xl font-bold text-white">
      Handyman Services in {city}, FL
    </h2>

    <p className="mt-4">
      Looking for a reliable handyman in {city}, Florida? We provide
      professional home repair and installation services throughout the Tampa Bay Area.
      Whether you need help with drywall, painting, door repair, flooring, or general
      handyman work — we deliver clean, high-quality results with fast response times.
    </p>

    <p className="mt-4">
      Our services in {city}, FL include interior painting, TV mounting,
      furniture assembly, plumbing repairs, fence repair, and more. Every project
      is completed with attention to detail and transparent pricing — no hourly surprises.
    </p>

    <p className="mt-4">
      We proudly serve homeowners in {city} and nearby areas. Contact us today
      for a free estimate and get your project done right the first time.
    </p>
  </div>
</section>

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
