import assert from "node:assert/strict";
import { test } from "node:test";
import { readFile } from "node:fs/promises";
import { cities, services } from "../app/data/site.ts";
import { detailProjects } from "../app/data/projects.ts";

const readSource = (path: string) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("all 187 city-service combinations remain generated but are noindex, follow", async () => {
  assert.equal(cities.length, 17);
  assert.equal(services.length, 11);
  assert.equal(cities.length * services.length, 187);

  const source = await readSource("app/handyman/[city]/[service]/page.tsx");
  assert.match(source, /cities\.flatMap\(\(city\) =>/);
  assert.match(source, /services\.map\(\(service\) =>/);
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
  assert.equal(expectedCount, 56);
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
