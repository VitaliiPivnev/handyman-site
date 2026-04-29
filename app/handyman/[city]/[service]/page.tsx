import { business } from "../../../data/business";
import EstimateForm from "../../../components/EstimateForm";

const serviceNames: Record<string, string> = {
  "door-repair": "Door Repair & Installation",
  "drywall-repair": "Drywall Repair",
  "interior-painting": "Interior Painting",
  "flooring-installation": "Flooring Installation",
  "tv-mounting": "TV Mounting",
  "furniture-assembly": "Furniture Assembly",
  "plumbing-repairs": "Plumbing Repairs",
  "fence-repair": "Fence Repair",
  "general-handyman-services": "General Handyman Services",
};

const cities = [
  "tampa",
  "st-petersburg",
  "clearwater",
  "largo",
  "brandon",
  "riverview",
  "wesley-chapel",
];

export function generateStaticParams() {
  const services = Object.keys(serviceNames);

  return cities.flatMap((city) =>
    services.map((service) => ({
      city,
      service,
    }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string; service: string }>;
}) {
  const { city, service } = await params;

  const cityName =
    city === "st-petersburg"
      ? "St. Petersburg"
      : city.charAt(0).toUpperCase() + city.slice(1);

  const serviceName = serviceNames[service] || service;

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

  const cityName =
    city === "st-petersburg"
      ? "St. Petersburg"
      : city.charAt(0).toUpperCase() + city.slice(1);

  const serviceName = serviceNames[service] || service;

  return (
    <main className="min-h-screen bg-neutral-950 text-white px-5 py-16">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-4xl md:text-6xl font-extrabold">
          {serviceName} in {cityName}, FL
        </h1>

        <p className="mt-6 text-lg text-white/70">
          Professional {serviceName.toLowerCase()} services in {cityName}, Florida.
          Fast response, clean work, and fair project-based pricing.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-xl bg-white/5 p-6">
            <h2 className="text-xl font-bold">Why choose us</h2>
            <ul className="mt-4 list-disc pl-5 text-white/80 space-y-2">
              <li>Top-rated handyman</li>
              <li>Same-day availability</li>
              <li>Clean and professional work</li>
              <li>Transparent pricing</li>
            </ul>
          </div>

          <div className="rounded-xl bg-yellow-400 p-6 text-black">
            <h2 className="text-xl font-bold">Get a free estimate</h2>
            <p className="mt-2">
              Call or text now to get a fast quote for your project.
            </p>

            <a
              href={`tel:${business.phone}`}
              className="mt-4 inline-block rounded-lg bg-black px-6 py-3 font-bold text-white"
            >
              Call Now
            </a>
          </div>
        </div>

        <div className="mt-12">
          <EstimateForm />
        </div>
      </div>
    </main>
  );
}