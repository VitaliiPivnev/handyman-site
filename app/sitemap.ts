import type { MetadataRoute } from "next";
import { baseUrl, cities, services } from "./data/site";
import { detailProjects } from "./data/projects";

/**
 * Indexable public pages with useful content. Thin city/service combinations
 * stay out of the sitemap until they are reviewed in Search Console.
 * Removing a page from a sitemap does not automatically deindex it.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const standard = [
    { path: "/", priority: 1 },
    ...services.map((service) => ({ path: `/services/${service.slug}`, priority: 0.85 })),
    ...cities.map((city) => ({ path: `/handyman/${city.slug}`, priority: 0.7 })),
    { path: "/projects", priority: 0.85 },
    { path: "/guides", priority: 0.65 },
    { path: "/guides/door-sticking-florida", priority: 0.6 },
    { path: "/guides/how-to-photograph-a-repair", priority: 0.6 },
  ];
  return [
    ...standard.map(({ path, priority }) => ({
      url: `${baseUrl}${path}`,
      changeFrequency: "monthly" as const,
      priority,
    })),
    ...detailProjects.map((project) => ({
      url: `${baseUrl}/projects/${project.id}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
      images: project.photos.map((photo) => `${baseUrl}${photo.src}`),
    })),
  ];
}
