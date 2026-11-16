import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { business } from "../../data/business";
import { cities, getService, services } from "../../data/site";
import { serviceDetails } from "../../data/service-details";
import EstimateForm from "../../components/EstimateForm";
import Portfolio from "../../components/Portfolio";
import TrackingLink from "../../components/TrackingLink";
import StructuredData from "../../components/StructuredData";
import { baseUrl } from "../../data/site";

type Params = { params: Promise<{ service: string }> };

export function generateStaticParams() {
  return services.map((service) => ({ service: service.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { service: slug } = await params;
  const service = getService(slug);
  if (!service) notFound();
  return {
    title: `${service.title} in Tampa Bay, FL | Handyman Tampa`,
    description: serviceDetails[slug]?.intro.slice(0, 155) || service.description,
    alternates: { canonical: `/services/${slug}` },
    openGraph: { title: `${service.title} in Tampa Bay`, description: service.description, url: `/services/${slug}` },
  };
}

export default async function ServicePage({ params }: Params) {
  const { service: slug } = await params;
  const service = getService(slug);
  if (!service) notFound();
  const detail = serviceDetails[slug];
  const linkedCities = ["tampa", "riverview", "lutz", "clearwater", "st-petersburg", "brandon"]
    .map((citySlug) => cities.find((city) => city.slug === citySlug))
    .filter((city): city is (typeof cities)[number] => Boolean(city));

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <StructuredData data={[
        {
          "@context": "https://schema.org", "@type": "Service", name: service.title,
          description: detail.intro, url: `${baseUrl}/services/${slug}`,
          areaServed: { "@type": "Place", name: "Tampa Bay, Florida" },
          provider: { "@type": "HomeAndConstructionBusiness", name: business.name, url: baseUrl, telephone: business.phone },
        },
        {
          "@context": "https://schema.org", "@type": "FAQPage",
          mainEntity: detail.faqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })),
        },
        {
          "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: `${baseUrl}/` },
            { "@type": "ListItem", position: 2, name: service.title, item: `${baseUrl}/services/${slug}` },
          ],
        },
      ]} />
      <header className="border-b border-white/10 px-5 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <Link href="/" className="font-extrabold">{business.name}</Link>
          <TrackingLink href={`tel:${business.phone}`} eventName="click_to_call" eventLabel={`service_${slug}_header`}
            className="rounded-full bg-yellow-400 px-4 py-2 text-sm font-bold text-black">Call Now</TrackingLink>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-16 md:py-24">
        <p className="font-semibold text-yellow-400">Handyman Services • Tampa Bay</p>
        <h1 className="mt-3 max-w-4xl text-4xl font-extrabold leading-tight md:text-6xl">{service.title} in Tampa Bay, FL</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-white/75">{detail.intro}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <TrackingLink href={`tel:${business.phone}`} eventName="click_to_call" eventLabel={`service_${slug}_hero`}
            className="rounded-xl bg-yellow-400 px-6 py-4 font-bold text-black">Call {business.displayPhone}</TrackingLink>
          <TrackingLink href={`sms:${business.phone}`} eventName="click_to_text" eventLabel={`service_${slug}_hero`}
            className="rounded-xl border border-white/30 px-6 py-4 font-bold">Text Project Photos</TrackingLink>
          <Link href="#estimate" className="rounded-xl border border-white/30 px-6 py-4 font-bold">Get a Free Estimate</Link>
        </div>
      </section>

      <section className="bg-white px-5 py-16 text-neutral-950">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.8fr]">
          <div>
            <p className="font-semibold text-amber-700">How we can help</p>
            <h2 className="mt-2 text-3xl font-extrabold">Common {service.title} Projects</h2>
            <p className="mt-5 text-lg leading-8 text-neutral-700">{detail.intro}</p>
            <p className="mt-4 rounded-xl bg-amber-50 p-5 text-neutral-800">
              <strong>For a faster estimate:</strong> {detail.estimateTip}
            </p>
          </div>
          <div className="rounded-2xl bg-neutral-100 p-6">
            <h3 className="text-xl font-bold">Typical Projects</h3>
            <ul className="mt-5 space-y-4">
              {detail.whatWeDo.map((task) => <li key={task} className="flex gap-3"><span aria-hidden="true" className="font-bold text-amber-700">✓</span>{task}</li>)}
            </ul>
            <p className="mt-6 text-sm text-neutral-600">Written project-based estimates. Materials are separate when required.</p>
          </div>
        </div>
      </section>

      <Portfolio serviceSlug={slug} limit={6} />

      <section className="px-5 py-16">
        <div className="mx-auto max-w-4xl">
          <p className="font-semibold text-yellow-400">Helpful answers</p>
          <h2 className="mt-2 text-3xl font-extrabold">Frequently Asked Questions</h2>
          <div className="mt-8 space-y-4">
            {detail.faqs.map((faq) => (
              <div key={faq.question} className="rounded-2xl border border-white/15 bg-white/5 p-6">
                <h3 className="text-lg font-bold">{faq.question}</h3>
                <p className="mt-2 leading-7 text-white/75">{faq.answer}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-sm text-white/60">
            <p>Explore our main handyman service-area pages:</p>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
              {linkedCities.map((city) => (
                <Link key={city.slug} className="underline underline-offset-4" href={`/handyman/${city.slug}`}>
                  Handyman in {city.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
      <EstimateForm />
    </main>
  );
}
