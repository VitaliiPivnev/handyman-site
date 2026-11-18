import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

const escapeHtml = (value) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#x27;");
const containsText = (html, value) => [value, escapeHtml(value), escapeHtml(value).replace(/&#x27;/g, "&#39;")].some((candidate) => html.includes(candidate));

export function validatePresentSnapshot({ html, sitemap, project, expectedUrl }) {
  const failures = [];
  if (!project) return ["expected project is missing from the commit data"];
  if (!containsText(html, project.title)) failures.push("exact project title is missing");
  if (!containsText(html, project.metaDescription)) failures.push("exact meta description is missing");
  if (!html.includes(`rel=\"canonical\" href=\"${expectedUrl}\"`) && !html.includes(`href=\"${expectedUrl}\" rel=\"canonical\"`)) failures.push("exact canonical URL is missing");
  if (!sitemap.includes(`<loc>${expectedUrl}</loc>`)) failures.push("exact project URL is missing from sitemap");
  return failures;
}

export function validateAbsentSnapshot({ status, sitemap, expectedUrl }) {
  const failures = [];
  if (status !== 404) failures.push(`project URL returned ${status}, expected 404`);
  if (sitemap.includes(`<loc>${expectedUrl}</loc>`)) failures.push("project URL is still present in sitemap");
  return failures;
}

async function fetchText(url) {
  const response = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(15_000) });
  return { status: response.status, text: await response.text() };
}

async function main() {
  const [action, slug, projectsPath, siteUrl = "https://handymantampa.net"] = process.argv.slice(2);
  if (!/^(publish|edit|republish|unpublish|delete)$/.test(action || "") || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug || "")) throw new Error("Invalid deployment verification arguments");
  const projects = JSON.parse(await readFile(projectsPath, "utf8"));
  const project = projects.find((item) => item.id === slug);
  const root = siteUrl.replace(/\/$/, "");
  const expectedUrl = `${root}/projects/${slug}`;
  const shouldExist = ["publish", "edit", "republish"].includes(action);

  for (let attempt = 1; attempt <= 60; attempt += 1) {
    try {
      const [page, sitemap] = await Promise.all([fetchText(expectedUrl), fetchText(`${root}/sitemap.xml`)]);
      const failures = shouldExist
        ? page.status === 200 ? validatePresentSnapshot({ html: page.text, sitemap: sitemap.text, project, expectedUrl }) : [`project URL returned ${page.status}`]
        : validateAbsentSnapshot({ status: page.status, sitemap: sitemap.text, expectedUrl });
      if (sitemap.status === 200 && failures.length === 0) {
        process.stdout.write(JSON.stringify({ action, slug, expectedUrl, verified: true }));
        return;
      }
      process.stderr.write(`Attempt ${attempt}: ${failures.join("; ")}\n`);
    } catch (error) {
      process.stderr.write(`Attempt ${attempt}: ${error instanceof Error ? error.message : "request failed"}\n`);
    }
    await new Promise((resolve) => setTimeout(resolve, 10_000));
  }
  throw new Error(`Production did not reach the exact expected ${action} state for ${slug}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => { console.error(error); process.exitCode = 1; });
}
