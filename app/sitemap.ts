import type { MetadataRoute } from "next";
import { baseUrl, cities, services } from "./data/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...cities.map((city) => ({
      url: `${baseUrl}/handyman/${city.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
    ...services.map((service) => ({
      url: `${baseUrl}/services/${service.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...cities.flatMap((city) =>
      services.map((service) => ({
        url: `${baseUrl}/handyman/${city.slug}/${service.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.85,
      }))
    ),
  ];
}
