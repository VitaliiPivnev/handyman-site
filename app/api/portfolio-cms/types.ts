import { cities, services } from "../../data/site.ts";

export type CmsStage = "before" | "progress" | "after";
export type DraftPhoto = {
  id: string;
  telegramFileId: string;
  telegramUniqueId: string;
  stage: CmsStage;
  order: number;
};

export type ImportedContent = {
  version: 1;
  title: string;
  summary: string;
  description: string;
  seoTitle: string;
  metaDescription: string;
  slug: string;
  serviceSlug: string;
  category: string;
  keywords?: string[];
  location?: string;
  imageAlt: Record<string, string>;
};

export type CmsDraft = {
  id: string;
  revision: number;
  status: "photos" | "description" | "location" | "content" | "preview" | "publishing" | "failed";
  selectedStage: CmsStage;
  photos: DraftPhoto[];
  shortDescription?: string;
  location?: string;
  content?: ImportedContent;
  createdAt: string;
  updatedAt: string;
  error?: string;
};

export const contentTemplate = {
  version: 1,
  title: "Accurate project title",
  summary: "Short portfolio card description (80-220 characters)",
  description: "Useful natural American English description of work actually completed.",
  seoTitle: "Project title | Handyman Tampa",
  metaDescription: "Accurate meta description (80-160 characters).",
  slug: "readable-project-slug",
  serviceSlug: services[0].slug,
  category: "Doors & Carpentry",
  keywords: ["natural phrase"],
  location: "Only include when the owner explicitly confirmed it",
  imageAlt: { "PHOTO_ID_FROM_BOT": "Accurate description of the visible work" },
};

const clean = (value: unknown, max: number) => typeof value === "string" ? value.trim().slice(0, max) : "";
const hasUnsafeMarkup = (value: string) => /[<>]|javascript:|data:text\/html/i.test(value);

export function sanitizeSlug(value: string): string {
  return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 72);
}

export function validateImportedContent(input: unknown, photoIds: string[]): { ok: true; value: ImportedContent } | { ok: false; errors: string[] } {
  const errors: string[] = [];
  if (!input || typeof input !== "object" || Array.isArray(input)) return { ok: false, errors: ["Paste one JSON object."] };
  const raw = input as Record<string, unknown>;
  if (raw.version !== 1) errors.push("version must be 1.");
  const title = clean(raw.title, 100);
  const summary = clean(raw.summary, 260);
  const description = clean(raw.description, 3000);
  const seoTitle = clean(raw.seoTitle, 70);
  const metaDescription = clean(raw.metaDescription, 170);
  const slug = sanitizeSlug(clean(raw.slug, 100));
  const serviceSlug = clean(raw.serviceSlug, 80);
  const category = clean(raw.category, 80);
  const location = clean(raw.location, 100) || undefined;
  if (title.length < 8) errors.push("title must be at least 8 characters.");
  if (summary.length < 40) errors.push("summary must be at least 40 characters.");
  if (description.length < 80) errors.push("description must be at least 80 characters.");
  if (seoTitle.length < 20 || seoTitle.length > 65) errors.push("seoTitle must be 20-65 characters.");
  if (metaDescription.length < 70 || metaDescription.length > 160) errors.push("metaDescription must be 70-160 characters.");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) errors.push("slug must contain lowercase words and hyphens.");
  if (!services.some((service) => service.slug === serviceSlug)) errors.push("serviceSlug must match an existing service.");
  if (!category) errors.push("category is required.");
  if (location && !cities.some((city) => city.name.toLowerCase() === location.toLowerCase())) {
    // Manual cities are allowed, but must be simple text rather than a URL or markup.
    if (!/^[A-Za-z .'-]{2,100}$/.test(location)) errors.push("location must be a city name or omitted.");
  }
  const textFields = [title, summary, description, seoTitle, metaDescription, category, location || ""];
  if (textFields.some(hasUnsafeMarkup)) errors.push("HTML, scripts and unsafe URLs are not allowed.");
  const imageAlt = raw.imageAlt && typeof raw.imageAlt === "object" && !Array.isArray(raw.imageAlt)
    ? Object.fromEntries(Object.entries(raw.imageAlt as Record<string, unknown>).map(([id, alt]) => [id, clean(alt, 180)]))
    : {};
  for (const id of photoIds) if (!imageAlt[id] || imageAlt[id].length < 8) errors.push(`Missing useful imageAlt for ${id}.`);
  if (Object.keys(imageAlt).some((id) => !photoIds.includes(id))) errors.push("imageAlt contains an unknown photo ID.");
  if (Object.values(imageAlt).some(hasUnsafeMarkup)) errors.push("Image alt text contains unsafe markup.");
  const keywords = Array.isArray(raw.keywords) ? raw.keywords.map((item) => clean(item, 60)).filter(Boolean).slice(0, 8) : undefined;
  if (errors.length) return { ok: false, errors };
  return { ok: true, value: { version: 1, title, summary, description, seoTitle, metaDescription, slug, serviceSlug, category, keywords, location, imageAlt } };
}

export function newDraft(id = crypto.randomUUID()): CmsDraft {
  const now = new Date().toISOString();
  return { id, revision: 1, status: "photos", selectedStage: "after", photos: [], createdAt: now, updatedAt: now };
}
