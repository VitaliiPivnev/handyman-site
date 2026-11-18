import { services } from "./site.ts";

/** Canonical customer-facing categories for Telegram CMS projects only. */
export const portfolioCategoryByService = {
  "door-repair": "Door Installation & Repair",
  "drywall-repair": "Drywall & Ceiling Repair",
  "interior-painting": "Interior Painting & Finishing",
  "flooring-installation": "Flooring Installation & Repair",
  "tv-mounting": "TV Mounting & Media Installation",
  "furniture-assembly": "Furniture Assembly",
  "plumbing-repairs": "Plumbing Fixture Replacement",
  "fence-repair": "Fence & Gate Repair",
  "deck-repair": "Deck Repair & Maintenance",
  "exterior-painting": "Exterior Painting & Trim",
  "general-handyman-services": "General Handyman Services",
} as const;

export type PortfolioServiceSlug = keyof typeof portfolioCategoryByService;

export function isPortfolioServiceSlug(value: string): value is PortfolioServiceSlug {
  return Object.hasOwn(portfolioCategoryByService, value);
}

export function getPortfolioCategory(serviceSlug: string): string | undefined {
  return isPortfolioServiceSlug(serviceSlug) ? portfolioCategoryByService[serviceSlug] : undefined;
}

export const portfolioServiceOptions = services.map((service) => {
  const category = getPortfolioCategory(service.slug);
  if (!category) throw new Error(`Missing portfolio category mapping for ${service.slug}`);
  return { slug: service.slug, serviceTitle: service.title, category };
});
