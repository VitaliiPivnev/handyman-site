import { business } from "../../data/business";
import EstimateForm from "../../components/EstimateForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ service: string }>;
}) {
  const { service } = await params;

  const name = service.replace(/-/g, " ");

  return {
    title: `${name} Services | Fixora Handyman`,
    description: `Professional ${name} services in Tampa Bay Area. Fast, clean, and reliable work. Call today.`,
  };
}


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

export default async function ServicePage({
  params,
}: {
  params: Promise<{ service: string }>;
}) {
  const { service } = await params;
  const serviceName = serviceNames[service] || service;

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-neutral-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <a href="/" className="text-xl font-bold">{business.name}</a>

          <a
            href={`tel:${business.phone}`}
            className="rounded-full bg-yellow-400 px-4 py-2 text-sm font-bold text-black"
          >
            Call Now
          </a>
        </div>
      </header>

      {/* HERO */}
      <section className="mx-auto max-w-7xl px-5 py-16">
        <h1 className="text-4xl md:text-6xl font-extrabold">
          {serviceName} Services
        </h1>

        <p className="mt-5 max-w-3xl text-lg text-white/75">
          Professional {serviceName.toLowerCase()} services in the Tampa Bay Area.
          We deliver clean, reliable, and high-quality results for your home.
        </p>

        <div className="mt-8 flex gap-3">
          <a
            href={`tel:${business.phone}`}
            className="bg-yellow-400 text-black px-6 py-4 rounded-xl font-bold"
          >
            Call Now
          </a>

          <a
            href="sms:+13054650028"
            className="border border-white/20 px-6 py-4 rounded-xl"
          >
            Text for Estimate
          </a>
        </div>
      </section>

      {/* CONTENT */}
      <section className="bg-white text-black px-5 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold">
            About our {serviceName}
          </h2>

          <p className="mt-4 text-lg">
            We provide professional {serviceName.toLowerCase()} for homeowners
            across the Tampa Bay Area. Whether it’s a small repair or a full
            installation, we ensure quality workmanship and attention to detail.
          </p>

          <p className="mt-4">
            Contact us today to get a fast estimate and schedule your project.
          </p>
        </div>
      </section>

      {/* FORM */}
      <EstimateForm />

      {/* MOBILE BUTTON */}
      <div className="fixed bottom-0 left-0 right-0 grid grid-cols-2 gap-2 p-3 bg-neutral-950 md:hidden">
        <a
          href={`tel:${business.phone}`}
          className="bg-yellow-400 text-black py-3 text-center font-bold rounded-xl"
        >
          Call
        </a>
        <a
          href="sms:+13054650028"
          className="bg-white text-black py-3 text-center font-bold rounded-xl"
        >
          Text
        </a>
      </div>
    </main>
  );
}