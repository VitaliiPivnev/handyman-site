import { business } from "../../data/business";
import { cities, getService, getServiceName, services } from "../../data/site";
import EstimateForm from "../../components/EstimateForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ service: string }>;
}) {
  const { service } = await params;

  const name = getServiceName(service);

  return {
    title: `${name} Services in Tampa Bay | Handyman Tampa`,
    description: `Professional ${name.toLowerCase()} services in Tampa Bay Area. Fast, clean, and reliable work. Call today for a free estimate.`,
  };
}

export function generateStaticParams() {
  return services.map((service) => ({
    service: service.slug,
  }));
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ service: string }>;
}) {
  const { service } = await params;
  const serviceName = getServiceName(service);
  const serviceData = getService(service);
  const includes = serviceData?.includes || [
    "Home repair and installation",
    "Clean and professional work",
    "Project-based pricing",
    "Fast communication",
  ];

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-neutral-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <a href="/" className="flex items-center gap-3 hover:opacity-90 transition">
            <img src="/logo.png" alt="Tampa Handyman" className="h-9 w-auto object-contain" />
            <span className="text-lg md:text-xl font-extrabold tracking-wide text-white">
              Handyman Tampa
            </span>
          </a>

          <a href={`tel:${business.phone}`} className="rounded-full bg-yellow-400 px-4 py-2 text-sm font-bold text-black">
            Call Now
          </a>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-16 md:py-24">
        <p className="mb-4 inline-flex rounded-full border border-yellow-400/40 px-4 py-2 text-sm text-yellow-300">
          Tampa Bay Area • Free estimates
        </p>

        <h1 className="max-w-4xl text-4xl font-extrabold leading-tight md:text-6xl">
          {serviceName} Services in Tampa Bay
        </h1>

        <p className="mt-6 max-w-3xl text-lg leading-8 text-white/75">
          Professional {serviceName.toLowerCase()} services for homeowners across
          Tampa Bay. We provide clean workmanship, fast communication, and clear
          project-based estimates.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a href={`tel:${business.phone}`} className="rounded-xl bg-yellow-400 px-6 py-4 text-center text-lg font-bold text-black">
            Call {business.displayPhone}
          </a>
          <a href={`sms:${business.phone}`} className="rounded-xl border border-white/20 px-6 py-4 text-center text-lg font-semibold text-white">
            Text for Estimate
          </a>
        </div>
      </section>

      <section className="bg-white px-5 py-16 text-black">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.8fr]">
          <div>
            <p className="font-semibold text-yellow-600">Service details</p>
            <h2 className="mt-2 text-3xl font-extrabold md:text-5xl">
              About Our {serviceName}
            </h2>

            <p className="mt-6 text-lg leading-8 text-black/70">
              We provide {serviceName.toLowerCase()} for small repairs,
              installations, replacements, and home improvement projects. The
              goal is simple: clean results, reliable communication, and work
              done the right way.
            </p>

            <p className="mt-4 leading-8 text-black/65">
              Send photos and project details to get started. We can review the
              scope, explain what may be needed, and provide an estimate based on
              the actual project instead of confusing hourly pricing.
            </p>
          </div>

          <div className="rounded-3xl bg-neutral-100 p-6">
            <h3 className="text-2xl font-bold">This service can include:</h3>
            <ul className="mt-5 space-y-3">
              {includes.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="font-bold text-yellow-600">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="px-5 py-16">
        <div className="mx-auto max-w-7xl">
          <p className="font-semibold text-yellow-400">Service areas</p>
          <h2 className="mt-2 text-3xl font-extrabold md:text-5xl">
            {serviceName} Near You
          </h2>

          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {cities.map((city) => (
              <a
                key={city.slug}
                href={`/handyman/${city.slug}/${service}`}
                className="rounded-2xl border border-white/10 bg-white/10 p-5 font-bold hover:border-yellow-400/60"
              >
                {serviceName} in {city.name} →
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-16 text-black">
        <div className="mx-auto max-w-4xl">
          <p className="font-semibold text-yellow-600">FAQ</p>
          <h2 className="mt-2 text-3xl font-extrabold">Common Questions</h2>

          <div className="mt-8 space-y-4">
            <div className="rounded-2xl border border-black/10 p-6">
              <h3 className="font-bold">Do you offer free estimates?</h3>
              <p className="mt-2 text-black/65">Yes. Send photos and a short description, and we can usually provide the next step quickly.</p>
            </div>
            <div className="rounded-2xl border border-black/10 p-6">
              <h3 className="font-bold">Do you provide materials?</h3>
              <p className="mt-2 text-black/65">Materials can be provided when needed and billed separately. Receipts can be shared with the customer.</p>
            </div>
            <div className="rounded-2xl border border-black/10 p-6">
              <h3 className="font-bold">What areas do you serve?</h3>
              <p className="mt-2 text-black/65">We serve Tampa, Clearwater, St. Petersburg, Brandon, Riverview, Wesley Chapel, Largo, Lutz, Carrollwood, Westchase, and nearby areas.</p>
            </div>
          </div>
        </div>
      </section>

      <EstimateForm />

      <div className="fixed bottom-0 left-0 right-0 grid grid-cols-2 gap-2 p-3 bg-neutral-950 md:hidden">
        <a href={`tel:${business.phone}`} className="bg-yellow-400 text-black py-3 text-center font-bold rounded-xl">
          Call
        </a>
        <a href={`sms:${business.phone}`} className="bg-white text-black py-3 text-center font-bold rounded-xl">
          Text
        </a>
      </div>
    </main>
  );
}
