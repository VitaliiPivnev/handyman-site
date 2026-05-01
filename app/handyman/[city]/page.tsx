import EstimateForm from "../../components/EstimateForm";
import { business } from "../../data/business";
import { cities, getCityName, services } from "../../data/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city } = await params;
  const cityFormatted = getCityName(city);

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
  const city = cities.find((c) => c.slug === citySlug);

  if (!city) return null;

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
          Serving {city.name}, FL • Free estimates
        </p>

        <h1 className="max-w-4xl text-4xl font-extrabold leading-tight md:text-6xl">
          Handyman Services in {city.name}, FL
        </h1>

        <p className="mt-6 max-w-3xl text-lg leading-8 text-white/75">
          {city.description}
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
          <p className="font-semibold text-yellow-600">
            Services in {city.name}
          </p>
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
                    {service.description} Serving {city.name} and nearby areas.
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

      <section className="bg-neutral-950 px-5 py-16 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="font-semibold text-yellow-400">
              Local handyman help
            </p>
            <h2 className="mt-2 text-3xl font-extrabold md:text-5xl">
              Reliable Handyman in {city.name}, FL
            </h2>

            <p className="mt-6 leading-8 text-white/75">
              If you need a dependable handyman in {city.name}, we can help with
              home repairs, installations, drywall, doors, painting, flooring,
              TV mounting, furniture assembly, and other small-to-medium
              projects.
            </p>

            <p className="mt-4 leading-8 text-white/75">
              Send photos of the project, describe what needs to be done, and we
              will help you understand the best next step. We serve homeowners
              across {city.name} and the surrounding Tampa Bay area.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/10 p-6">
            <h3 className="text-2xl font-bold">
              Popular services in {city.name}
            </h3>

            <div className="mt-5 grid gap-3">
              {services.slice(0, 7).map((service) => (
                <a
                  key={service.slug}
                  href={`/handyman/${citySlug}/${service.slug}`}
                  className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 font-semibold text-white hover:border-yellow-400/60"
                >
                  {service.title} in {city.name} →
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-16 text-black">
        <div className="mx-auto max-w-7xl">
          <p className="font-semibold text-yellow-600">FAQ</p>
          <h2 className="mt-2 text-3xl font-extrabold md:text-5xl">
            Handyman Questions in {city.name}
          </h2>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-black/10 bg-neutral-50 p-6">
              <h3 className="text-xl font-bold">
                Do you offer free estimates?
              </h3>
              <p className="mt-3 text-black/65">
                Yes. Send photos and project details, and we can usually provide
                a quick estimate or schedule an in-person look if needed.
              </p>
            </div>

            <div className="rounded-2xl border border-black/10 bg-neutral-50 p-6">
              <h3 className="text-xl font-bold">Do you work hourly?</h3>
              <p className="mt-3 text-black/65">
                Most jobs are priced by project so you know the cost before work
                begins. Materials are separate when needed.
              </p>
            </div>

            <div className="rounded-2xl border border-black/10 bg-neutral-50 p-6">
              <h3 className="text-xl font-bold">What areas do you serve?</h3>
              <p className="mt-3 text-black/65">
                We serve {city.name} and nearby Tampa Bay communities including
                Tampa, Clearwater, St. Petersburg, Brandon, Riverview, and more.
              </p>
            </div>

            <div className="rounded-2xl border border-black/10 bg-neutral-50 p-6">
              <h3 className="text-xl font-bold">Can I send photos first?</h3>
              <p className="mt-3 text-black/65">
                Yes. Photos help us understand the scope faster and prepare a
                more accurate estimate.
              </p>
            </div>
          </div>
        </div>
      </section>

      <EstimateForm />

      <section className="bg-yellow-400 px-5 py-16 text-black">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-extrabold md:text-5xl">
            Need Handyman Help in {city.name}?
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