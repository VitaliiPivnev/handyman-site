import { business } from "../../../data/business";
import {
  cities,
  getCityName,
  getService,
  getServiceName,
  services,
} from "../../../data/site";
import EstimateForm from "../../../components/EstimateForm";

export function generateStaticParams() {
  return cities.flatMap((city) =>
    services.map((service) => ({
      city: city.slug,
      service: service.slug,
    }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string; service: string }>;
}) {
  const { city, service } = await params;

  const cityName = getCityName(city);
  const serviceName = getServiceName(service);

  return {
    title: `${serviceName} in ${cityName}, FL | Handyman Tampa`,
    description: `Professional ${serviceName.toLowerCase()} in ${cityName}, FL. Fast response, clean work, and free estimates in the Tampa Bay Area.`,
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ city: string; service: string }>;
}) {
  const { city, service } = await params;

  const cityName = getCityName(city);
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

          <a
            href={`tel:${business.phone}`}
            className="rounded-full bg-yellow-400 px-4 py-2 text-sm font-bold text-black"
          >
            Call Now
          </a>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-16 md:py-24">
        <p className="mb-4 inline-flex rounded-full border border-yellow-400/40 px-4 py-2 text-sm text-yellow-300">
          {cityName}, FL • Free estimates
        </p>

        <h1 className="max-w-4xl text-4xl font-extrabold leading-tight md:text-6xl">
          {serviceName} in {cityName}, FL
        </h1>

        <p className="mt-6 max-w-3xl text-lg leading-8 text-white/75">
          Professional {serviceName.toLowerCase()} services in {cityName}, Florida.
          We provide clean, reliable handyman work with fast communication and
          clear project-based pricing.
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
            <p className="font-semibold text-yellow-600">What we do</p>
            <h2 className="mt-2 text-3xl font-extrabold md:text-5xl">
              Local {serviceName} Service
            </h2>

            <p className="mt-6 text-lg leading-8 text-black/70">
              If you are looking for {serviceName.toLowerCase()} in {cityName},
              we can help with repairs, installation, replacement, adjustment,
              and other related handyman work. We focus on quality results,
              proper preparation, and a clean finish.
            </p>

            <p className="mt-4 leading-8 text-black/65">
              Every project is different, so the best way to get started is to
              send photos and a short description of what needs to be done. We
              will review the scope and provide the next step for your estimate.
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
          <p className="font-semibold text-yellow-400">Why homeowners call us</p>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <div className="rounded-2xl bg-white/10 p-6">
              <h3 className="text-xl font-bold">Clear Pricing</h3>
              <p className="mt-3 text-white/65">Project-based estimates before the work begins.</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-6">
              <h3 className="text-xl font-bold">Clean Work</h3>
              <p className="mt-3 text-white/65">Respectful work inside your home and clean job areas.</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-6">
              <h3 className="text-xl font-bold">Fast Response</h3>
              <p className="mt-3 text-white/65">Send photos by text and get a faster estimate.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-16 text-black">
        <div className="mx-auto max-w-4xl">
          <p className="font-semibold text-yellow-600">FAQ</p>
          <h2 className="mt-2 text-3xl font-extrabold">Questions About {serviceName}</h2>

          <div className="mt-8 space-y-4">
            <div className="rounded-2xl border border-black/10 p-6">
              <h3 className="font-bold">How much does {serviceName.toLowerCase()} cost in {cityName}?</h3>
              <p className="mt-2 text-black/65">Pricing depends on the size, condition, access, materials, and project details. Send photos for a more accurate estimate.</p>
            </div>
            <div className="rounded-2xl border border-black/10 p-6">
              <h3 className="font-bold">Can you provide materials?</h3>
              <p className="mt-2 text-black/65">Yes, materials can be provided when needed and billed separately. Receipts can be shared with the customer.</p>
            </div>
            <div className="rounded-2xl border border-black/10 p-6">
              <h3 className="font-bold">Do you serve nearby areas?</h3>
              <p className="mt-2 text-black/65">Yes, we serve {cityName} and surrounding Tampa Bay communities.</p>
            </div>
          </div>
        </div>
      </section>

      <EstimateForm />

      <section className="bg-yellow-400 px-5 py-16 text-black">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-extrabold md:text-5xl">
            Need {serviceName} in {cityName}?
          </h2>
          <p className="mt-4 text-lg">Call or text now and send photos of your project.</p>
          <a href={`tel:${business.phone}`} className="mt-8 inline-block rounded-xl bg-black px-8 py-4 text-lg font-bold text-white">
            Call Now
          </a>
        </div>
      </section>
    </main>
  );
}
