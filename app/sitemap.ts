import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://handymantampa.net";

  const cityPages = [
    "tampa",
    "clearwater",
    "st-petersburg",
    "brandon",
    "riverview",
    "wesley-chapel",
    "lutz",
    "carrollwood",
    "westchase",
  ];

  const servicePages = [
    "door-repair",
    "drywall-repair",
    "interior-painting",
    "flooring-installation",
    "tv-mounting",
    "furniture-assembly",
    "plumbing-repairs",
    "fence-repair",
  ];

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...cityPages.map((city) => ({
      url: `${baseUrl}/handyman/${city}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
    ...servicePages.map((service) => ({
      url: `${baseUrl}/services/${service}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}