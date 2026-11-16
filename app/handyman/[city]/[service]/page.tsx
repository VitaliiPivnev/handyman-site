import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { business } from "../../../data/business";
import {
  cityServiceCities,
  getCityName,
  getService,
  getServiceName,
  services,
} from "../../../data/site";
import EstimateForm from "../../../components/EstimateForm";

export function generateStaticParams() {
  return cityServiceCities.flatMap((city) =>
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
}): Promise<Metadata> {
  const { city, service } = await params;

  if (!cityServiceCities.some((item) => item.slug === city) || !getService(service)) notFound();

  const cityName = getCityName(city);
  const serviceName = getServiceName(service);

  return {
    title: `${serviceName} in ${cityName}, FL | Handyman Tampa`,
    description: `${serviceName} information for ${cityName}, FL, including common project scope, photos to send, and how to request an estimate.`,
    alternates: { canonical: `/handyman/${city}/${service}` },
    robots: {
      index: false,
      follow: true,
      googleBot: { index: false, follow: true },
    },
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
  if (!cityServiceCities.some((item) => item.slug === city) || !serviceData) notFound();
  const includes = serviceData?.includes || [
    "A clear description of the requested work",
    "Photos of the work area and existing condition",
    "Measurements or product details when available",
    "A review of whether the work fits handyman scope",
  ];

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-neutral-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition">
            <Image src="/logo.png" alt="Tampa Handyman" width={54} height={36} className="h-9 w-auto object-contain" />
            <span className="text-lg md:text-xl font-extrabold tracking-wide text-white">
              Handyman Tampa
            </span>
          </Link>

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
          Need help with {serviceName.toLowerCase()} in {cityName}? Send photos and a short description so the actual scope, materials, and next step can be reviewed.
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
            <p className="font-semibold text-yellow-600">Project details</p>
            <h2 className="mt-2 text-3xl font-extrabold md:text-5xl">
              What to Include in Your Request
            </h2>

            <p className="mt-6 text-lg leading-8 text-black/70">
              {serviceData.description} The list on this page is a starting point; the existing condition and exact task determine whether the project is a suitable fit.
            </p>

            <p className="mt-4 leading-8 text-black/65">
              Send one wide photo for context, close-ups of the problem area,
              and measurements or product information when they affect the work.
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
          <p className="font-semibold text-yellow-400">How to get started</p>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <div className="rounded-2xl bg-white/10 p-6">
              <h3 className="text-xl font-bold">Show the Full Area</h3>
              <p className="mt-3 text-white/65">A wide photo helps explain access, nearby finishes, and the overall condition.</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-6">
              <h3 className="text-xl font-bold">Add Useful Close-Ups</h3>
              <p className="mt-3 text-white/65">Include the damage, hardware, mounting points, texture, or connections involved.</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-6">
              <h3 className="text-xl font-bold">Confirm the Scope</h3>
              <p className="mt-3 text-white/65">Measurements and product links help identify materials and installation requirements.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-16 text-black">
        <div className="mx-auto max-w-4xl">
          <p className="font-semibold text-yellow-600">FAQ</p>
          <h2 className="mt-2 text-3xl font-extrabold">Questions Before You Send the Request</h2>

          <div className="mt-8 divide-y divide-black/10 rounded-2xl border border-black/10 px-5">
            {[
              ["What affects the estimate?", "The size, existing condition, access, preparation, materials, and finish details all affect the scope."],
              ["Should I send photos before scheduling?", "Yes. Include a wide view, close-ups, and measurements or product information when relevant."],
              ["What if I am not sure what the project involves?", "Send a description, photos, measurements and any product links you have. The scope can be reviewed first, including whether part of the project may require a permit or licensed trade work."],
            ].map(([question, answer]) => (
              <details key={question} className="group py-5">
                <summary className="cursor-pointer list-none font-bold marker:hidden">{question}<span aria-hidden="true" className="float-right text-yellow-700 group-open:rotate-45">+</span></summary>
                <p className="mt-2 text-black/65">{answer}</p>
              </details>
            ))}
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
