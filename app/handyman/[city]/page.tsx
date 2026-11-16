import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import EstimateForm from "../../components/EstimateForm";
import { business } from "../../data/business";
import { cities, getCityName, services } from "../../data/site";
import { detailProjects } from "../../data/projects";

const cityProjectExamples = [
  "bedroom-ceiling-drywall-repair",
  "driveway-gate-fence-repair",
  "bedroom-lvp-floor",
].map((id) => detailProjects.find((project) => project.id === id)!);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city } = await params;
  if (!cities.some((item) => item.slug === city)) notFound();
  const cityFormatted = getCityName(city);

  return {
    title: cities.find((item) => item.slug === city)?.seoTitle || `Handyman in ${cityFormatted}, FL | Handyman Tampa`,
    description: cities.find((item) => item.slug === city)?.metaDescription || `Reliable handyman services in ${cityFormatted}, FL. Doors, drywall, painting, flooring and more. Call for a free estimate.`,
    alternates: { canonical: `/handyman/${city}` },
  };
}

export function generateStaticParams() {
  return cities.map((city) => ({ city: city.slug }));
}

export default async function CityPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city: citySlug } = await params;
  const city = cities.find((c) => c.slug === citySlug);

  if (!city) notFound();

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-neutral-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Link href="/" className="flex min-w-0 items-center gap-3 transition hover:opacity-90">
            <Image
              src="/logo.png"
              alt="Tampa Handyman"
              width={54}
              height={36}
              className="hidden h-9 w-auto shrink-0 object-contain min-[430px]:block"
            />
            <span className="truncate text-base font-extrabold tracking-wide text-white md:text-xl">
              {business.name}
            </span>
          </Link>

          <nav className="hidden gap-6 text-sm text-white/80 md:flex">
            <Link href="/#services" className="hover:text-white transition">
              Services
            </Link>
            <Link href="/#areas" className="hover:text-white transition">
              Areas
            </Link>
            <Link href="/#contact" className="hover:text-white transition">
              Contact
            </Link>
          </nav>

          <a
            href={`tel:${business.phone}`}
            className="ml-3 shrink-0 rounded-full bg-yellow-400 px-4 py-2 text-sm font-semibold text-black transition hover:bg-yellow-300"
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
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                className="group relative h-[320px] overflow-hidden rounded-2xl shadow-lg"
              >
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-black/35 transition group-hover:bg-black/50" />

                <div className="absolute bottom-0 p-6">
                  <h3 className="text-xl font-bold text-white">
                    {service.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-white/85">
                    {service.description}
                  </p>

                  <p className="mt-4 text-sm font-bold text-yellow-400">
                    Learn more →
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-12 border-t border-black/10 pt-10">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="font-semibold text-yellow-700">Real completed work</p>
                <h2 className="mt-2 text-2xl font-extrabold md:text-3xl">Handyman Project Examples</h2>
              </div>
              <Link href="/projects" className="font-bold text-amber-800 underline underline-offset-4">
                View all real projects
              </Link>
            </div>
            <p className="mt-3 max-w-3xl text-black/65">
              Browse real project photos to see the type of work, finish details, and progress views available in our portfolio.
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {cityProjectExamples.map((project) => (
                <Link key={project.id} href={`/projects/${project.id}`}
                  className="rounded-2xl border border-black/10 bg-neutral-50 p-5 hover:border-yellow-600">
                  <h3 className="font-bold">{project.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-black/65">{project.summary}</p>
                  <p className="mt-3 text-sm font-bold text-amber-800">View real project photos →</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-12">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-3">
          <div className="rounded-2xl bg-white/10 p-6">
            <h3 className="text-xl font-bold">Start with the Scope</h3>
            <p className="mt-3 text-white/65">
              Photos, measurements, and product details help define what the project includes.
            </p>
          </div>

          <div className="rounded-2xl bg-white/10 p-6">
            <h3 className="text-xl font-bold">Review the Estimate</h3>
            <p className="mt-3 text-white/65">
              The project scope and any separately supplied materials are discussed before scheduling.
            </p>
          </div>

          <div className="rounded-2xl bg-white/10 p-6">
            <h3 className="text-xl font-bold">Confirm the Next Step</h3>
            <p className="mt-3 text-white/65">
              If the work is a good fit, timing and access details can be confirmed directly.
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
              Planning a Project in {city.name}?
            </h2>

            <p className="mt-6 leading-8 text-white/75">
              {city.localIntro || `If you need a dependable handyman in ${city.name}, we can help with home repairs, installations, drywall, doors, painting, flooring, TV mounting, furniture assembly, and other small-to-medium projects.`}
            </p>

            <p className="mt-4 leading-8 text-white/75">
              {city.estimateAdvice || `Send photos of the project, describe what needs to be done, and we will help you understand the best next step. We serve homeowners across ${city.name} and the surrounding Tampa Bay area.`}
            </p>
            {city.serviceFocus && (
              <ul className="mt-6 grid gap-3 text-white/80 sm:grid-cols-2">
                {city.serviceFocus.map((item) => <li key={item}>✓ {item}</li>)}
              </ul>
            )}
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/10 p-6">
            <h3 className="text-2xl font-bold">
              Popular services in {city.name}
            </h3>

            <div className="mt-5 grid gap-3">
              {services.slice(0, 7).map((service) => (
                <Link
                  key={service.slug}
                  href={`/services/${service.slug}`}
                  className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 font-semibold text-white hover:border-yellow-400/60"
                >
                  {service.title} <span className="text-white/60">— view details</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-14 text-black">
        <div className="mx-auto max-w-4xl">
          <p className="font-semibold text-yellow-600">FAQ</p>
          <h2 className="mt-2 text-3xl font-extrabold md:text-4xl">Before You Request an Estimate</h2>

          <div className="mt-8 divide-y divide-black/10 rounded-2xl border border-black/10 px-5 md:px-6">
            {[
              ["What should I include with my request?", "Send the project location, a short task description, useful photos, and measurements or product links when available."],
              ["Can several small repairs be reviewed together?", "Yes. Number the tasks and include a photo for each one so the full punch list can be reviewed as one request."],
              ["How are materials handled?", "Materials and customer-supplied products are discussed as part of the scope. When materials need to be purchased, that is addressed before the work is scheduled."],
              ["Can I ask about a project that may involve a permit or licensed trade?", "Yes. Send the project details and photos for an initial scope review. Some electrical, structural, roofing, gas, HVAC, plumbing or permit-related work may require a licensed trade professional before next steps can be confirmed."],
            ].map(([question, answer]) => (
              <details key={question} className="group py-5">
                <summary className="cursor-pointer list-none pr-8 text-lg font-bold marker:hidden">
                  {question}<span aria-hidden="true" className="float-right text-amber-700 group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 leading-7 text-black/65">{answer}</p>
              </details>
            ))}
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
