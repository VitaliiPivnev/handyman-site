import assert from "node:assert/strict";
import { test } from "node:test";
import { readFile } from "node:fs/promises";
import { cities, cityServiceCities, services } from "../app/data/site.ts";
import { detailProjects } from "../app/data/projects.ts";
import { serviceDetails } from "../app/data/service-details.ts";

const readSource = (path: string) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("all 187 city-service combinations remain generated but are noindex, follow", async () => {
  assert.equal(cityServiceCities.length, 17);
  assert.equal(services.length, 11);
  assert.equal(cityServiceCities.length * services.length, 187);

  const source = await readSource("app/handyman/[city]/[service]/page.tsx");
  assert.match(source, /cityServiceCities\.flatMap\(\(city\) =>/);
  assert.match(source, /services\.map\(\(service\) =>/);
  assert.match(source, /cityServiceCities\.some/);
  assert.match(source, /robots:\s*{[\s\S]*?index: false,[\s\S]*?follow: true/);
  assert.match(source, /googleBot:\s*{\s*index: false,\s*follow: true\s*}/);
  assert.match(source, /canonical: `\/handyman\/\$\{city}\/(?:\$\{service}|\$\{service\})/);
});

test("city pages link to primary service hubs, not city-service combinations", async () => {
  const source = await readSource("app/handyman/[city]/page.tsx");
  assert.match(source, /href={`\/services\/\$\{service\.slug\}`}/);
  assert.doesNotMatch(source, /href={`\/handyman\/\$\{citySlug\}\/\$\{service\.slug\}`}/);
  assert.match(source, /href="\/projects"/);
  assert.match(source, /href={`\/projects\/\$\{project\.id\}`}/);
});

test("sitemap includes only primary indexable route groups and real detail projects", async () => {
  const source = await readSource("app/sitemap.ts");
  assert.match(source, /\.\.\.services\.map/);
  assert.match(source, /\.\.\.cities\.map/);
  assert.match(source, /detailProjects\.map/);
  assert.match(source, /path: "\/projects"/);
  assert.match(source, /path: "\/guides"/);
  assert.doesNotMatch(source, /handyman\/\$\{city[^}]*}\/[\s\S]*service/);

  const expectedCount = 1 + services.length + cities.length + 1 + 3 + detailProjects.length;
  assert.equal(expectedCount, 59);
});

test("Phase 2 adds only three distinct city hubs without adding city-service combinations", () => {
  assert.equal(cities.length, 20);
  for (const slug of ["citrus-park", "town-n-country", "seminole"]) {
    const city = cities.find((item) => item.slug === slug);
    assert.ok(city, `${slug} must exist as an indexable city hub`);
    assert.ok(city.metaDescription && city.localIntro && city.estimateAdvice);
    assert.ok(city.serviceFocus && city.serviceFocus.length >= 3);
    assert.equal(cityServiceCities.some((item) => item.slug === slug), false);
  }
});

test("priority city hubs have useful unique metadata and planning content", () => {
  const prioritySlugs = [
    "westchase", "citrus-park", "town-n-country", "oldsmar", "odessa",
    "clearwater", "largo", "safety-harbor", "palm-harbor", "dunedin", "st-petersburg", "seminole",
  ];
  const descriptions = new Set<string>();
  for (const slug of prioritySlugs) {
    const city = cities.find((item) => item.slug === slug);
    assert.ok(city?.metaDescription, `${slug} needs a meta description`);
    assert.ok(city.localIntro && city.localIntro.length >= 100, `${slug} needs a substantive local intro`);
    assert.ok(city.estimateAdvice && city.estimateAdvice.length >= 90, `${slug} needs useful estimate guidance`);
    descriptions.add(city.metaDescription);
  }
  assert.equal(descriptions.size, prioritySlugs.length);
});

test("homepage targets Tampa and Westchase while linking priority services", async () => {
  const source = await readSource("app/page.tsx");
  assert.match(source, /Handyman Tampa, FL \| Home Repair in Tampa Bay/);
  assert.match(source, /Handyman Services in Tampa, Westchase/);
  assert.match(source, /ZIP 33626/);
  for (const slug of ["drywall-repair", "fence-repair", "door-repair", "general-handyman-services"]) {
    assert.match(source, new RegExp(`"${slug}"`));
  }
});

test("drywall and fence service hubs contain expanded scope and real portfolio support", async () => {
  for (const slug of ["drywall-repair", "fence-repair"]) {
    const detail = serviceDetails[slug];
    assert.ok(detail.scopeDetails && detail.scopeDetails.length >= 3);
    assert.ok(detail.whatWeDo.length >= 4);
    assert.ok(detail.faqs.length >= 4);
    assert.ok(detailProjects.some((project) => project.serviceSlug === slug));
  }
  const source = await readSource("app/services/[service]/page.tsx");
  assert.match(source, /detail\.scopeDetails/);
  assert.match(source, /Drywall Repair Tampa, FL \| Walls & Ceilings/);
  assert.match(source, /Fence & Gate Repair Tampa, FL \| Panels & Hardware/);
  assert.match(source, /Real Drywall & Ceiling Repair Projects/);
  assert.match(source, /Real Fence & Gate Projects/);
});

test("primary pages retain self-referencing canonical metadata and stay indexable", async () => {
  const [home, city, service, projects, project, guides, doorGuide, photoGuide] = await Promise.all([
    readSource("app/page.tsx"),
    readSource("app/handyman/[city]/page.tsx"),
    readSource("app/services/[service]/page.tsx"),
    readSource("app/projects/page.tsx"),
    readSource("app/projects/[id]/page.tsx"),
    readSource("app/guides/page.tsx"),
    readSource("app/guides/door-sticking-florida/page.tsx"),
    readSource("app/guides/how-to-photograph-a-repair/page.tsx"),
  ]);
  assert.match(home, /alternates: { canonical: "\/" }/);
  assert.match(city, /canonical: `\/handyman\/\$\{city}`/);
  assert.match(service, /canonical: `\/services\/\$\{slug}`/);
  assert.match(projects, /alternates: { canonical: "\/projects" }/);
  assert.match(project, /canonical: `\/projects\/\$\{project\.id}`/);
  assert.match(guides, /alternates: { canonical: "\/guides" }/);
  assert.match(doorGuide, /canonical: "\/guides\/door-sticking-florida"/);
  assert.match(photoGuide, /canonical: "\/guides\/how-to-photograph-a-repair"/);
  for (const source of [home, city, service, projects, project, guides, doorGuide, photoGuide]) {
    assert.doesNotMatch(source, /robots:\s*{[\s\S]*?index: false/);
  }
});

test("service pages link back to indexable city hubs and preserve project portfolio", async () => {
  const source = await readSource("app/services/[service]/page.tsx");
  assert.match(source, /href={`\/handyman\/\$\{city\.slug\}`}/);
  assert.match(source, /<Portfolio serviceSlug={slug}/);
  assert.doesNotMatch(source, /href={`\/handyman\/\$\{city\.slug\}\/\$\{slug\}`}/);
});
