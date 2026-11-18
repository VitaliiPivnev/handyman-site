import sharp from "sharp";
import { createHash } from "node:crypto";
import { projects, type Project } from "../../data/projects.ts";
import type { CmsDraft, DraftPhoto, ImportedContent } from "./types.ts";
import { getPortfolioCategory } from "../../data/portfolio-categories.ts";

type GithubRef = { object: { sha: string } };
type GithubCommit = { tree: { sha: string } };
type GithubContent = { content: string; encoding: string };

const repo = () => process.env.GITHUB_CMS_REPOSITORY || "VitaliiPivnev/handyman-site";
const branch = () => process.env.GITHUB_CMS_BRANCH || "main";

async function github<T>(path: string, init?: RequestInit): Promise<T> {
  const token = process.env.GITHUB_CMS_TOKEN;
  if (!token) throw new Error("GitHub CMS publishing is not configured");
  const response = await fetch(`https://api.github.com/repos/${repo()}${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) {
    const rateLimited = response.status === 403 && response.headers.get("x-ratelimit-remaining") === "0";
    throw new Error(rateLimited ? "GitHub API rate limit reached" : `GitHub publishing failed (${response.status})`);
  }
  return response.json() as Promise<T>;
}

async function telegramFile(fileId: string): Promise<Buffer> {
  const token = process.env.TELEGRAM_CMS_BOT_TOKEN;
  if (!token) throw new Error("Telegram CMS bot is not configured");
  const info = await fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${encodeURIComponent(fileId)}`, { cache: "no-store" });
  const body = await info.json() as { ok?: boolean; result?: { file_path?: string } };
  if (!info.ok || !body.ok || !body.result?.file_path) throw new Error("Telegram could not provide an uploaded photo");
  const file = await fetch(`https://api.telegram.org/file/bot${token}/${body.result.file_path}`, { cache: "no-store", signal: AbortSignal.timeout(20000) });
  if (!file.ok) throw new Error("Telegram photo download failed");
  const bytes = Buffer.from(await file.arrayBuffer());
  if (bytes.length > 12 * 1024 * 1024) throw new Error("A photo exceeds the 12 MB CMS limit");
  return bytes;
}

export async function optimizePhoto(photo: DraftPhoto): Promise<{ bytes: Buffer; digest: string }> {
  if (!photo.telegramFileId) throw new Error("A new draft photo is missing its Telegram file reference");
  const source = await telegramFile(photo.telegramFileId);
  const bytes = await optimizeImageBuffer(source);
  return { bytes, digest: createHash("sha256").update(bytes).digest("hex") };
}

export async function optimizeImageBuffer(source: Buffer): Promise<Buffer> {
  return sharp(source, { failOn: "error", limitInputPixels: 40_000_000 })
    .rotate()
    .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82, effort: 4 })
    .toBuffer();
}

async function createBlob(content: Buffer | string, encoding: "base64" | "utf-8") {
  return github<{ sha: string }>("/git/blobs", {
    method: "POST",
    body: JSON.stringify({ content: Buffer.isBuffer(content) ? content.toString("base64") : content, encoding }),
  });
}

async function readCmsProjects(): Promise<Project[]> {
  const result = await github<GithubContent>(`/contents/app/data/cms-projects.json?ref=${encodeURIComponent(branch())}`);
  if (result.encoding !== "base64") throw new Error("Unexpected CMS data encoding");
  const value = JSON.parse(Buffer.from(result.content.replace(/\n/g, ""), "base64").toString("utf8"));
  if (!Array.isArray(value)) throw new Error("Published CMS project data is invalid");
  return value as Project[];
}

async function readProjectFile(path: string): Promise<Project[]> {
  const result = await github<GithubContent>(`/contents/${path}?ref=${encodeURIComponent(branch())}`);
  if (result.encoding !== "base64") throw new Error("Unexpected CMS data encoding");
  const value = JSON.parse(Buffer.from(result.content.replace(/\n/g, ""), "base64").toString("utf8"));
  if (!Array.isArray(value)) throw new Error("CMS project data is invalid");
  return value as Project[];
}

export async function publishDraft(draft: CmsDraft): Promise<{ commitSha: string; url: string }> {
  if (!draft.content || !draft.photos.length) throw new Error("Draft needs content and at least one photo");
  if (draft.editProjectId) return editDraftProject(draft);
  const content = draft.content;
  if (projects.some((project) => project.id === content.slug)) throw new Error("This project URL already exists");
  const remoteProjects = await readCmsProjects();
  if (remoteProjects.some((project) => project.id === content.slug)) throw new Error("This project URL already exists");

  const optimized = await Promise.all(draft.photos.map(async (photo) => ({ photo, ...(await optimizePhoto(photo)) })));
  if (new Set(optimized.map((item) => item.digest)).size !== optimized.length) throw new Error("Duplicate photographs were detected");
  const ordered = optimized.sort((a, b) => a.photo.order - b.photo.order);
  const imagePaths = ordered.map((item, index) => `public/projects/${content.slug}-${item.photo.stage}-${index + 1}.webp`);
  const photos = ordered.map((item, index) => ({
    src: `/${imagePaths[index].replace(/^public\//, "")}`,
    alt: content.imageAlt[item.photo.id],
    caption: content.imageAlt[item.photo.id],
    stage: item.photo.stage,
  }));
  const project = buildNewProject(content, photos, draft.location);

  const ref = await github<GithubRef>(`/git/ref/heads/${encodeURIComponent(branch())}`);
  const parent = await github<GithubCommit>(`/git/commits/${ref.object.sha}`);
  const blobs = await Promise.all([
    ...ordered.map((item) => createBlob(item.bytes, "base64")),
    createBlob(`${JSON.stringify([...remoteProjects, project], null, 2)}\n`, "utf-8"),
  ]);
  const tree = await github<{ sha: string }>("/git/trees", {
    method: "POST",
    body: JSON.stringify({
      base_tree: parent.tree.sha,
      tree: [
        ...imagePaths.map((path, index) => ({ path, mode: "100644", type: "blob", sha: blobs[index].sha })),
        { path: "app/data/cms-projects.json", mode: "100644", type: "blob", sha: blobs[blobs.length - 1].sha },
      ],
    }),
  });
  const commit = await github<{ sha: string }>("/git/commits", {
    method: "POST",
    body: JSON.stringify({ message: `portfolio: publish ${content.slug}`, tree: tree.sha, parents: [ref.object.sha] }),
  });
  await github(`/git/refs/heads/${encodeURIComponent(branch())}`, {
    method: "PATCH", body: JSON.stringify({ sha: commit.sha, force: false }),
  });
  return { commitSha: commit.sha, url: `https://handymantampa.net/projects/${content.slug}` };
}

export function buildNewProject(content: ImportedContent, photos: Project["photos"], draftLocation?: string): Project {
  if (!photos.length) throw new Error("A CMS project needs at least one photo");
  const after = photos.find((photo) => photo.stage === "after") || photos[0];
  return {
    id: content.slug,
    title: content.title,
    category: getPortfolioCategory(content.serviceSlug) || content.category,
    serviceSlug: content.serviceSlug,
    summary: content.summary,
    description: content.description,
    seoTitle: content.seoTitle,
    metaDescription: content.metaDescription,
    location: content.location || draftLocation,
    cover: after.src,
    photos,
    featured: false,
    detailPage: true,
  };
}

async function editDraftProject(draft: CmsDraft): Promise<{ commitSha: string; url: string }> {
  const id = draft.editProjectId!;
  const [published, unpublished] = await Promise.all([readCmsProjects(), listUnpublishedProjects()]);
  const target = draft.editWasPublished ? published : unpublished;
  const existing = target.find((project) => project.id === id);
  if (!existing) throw new Error("The project changed or no longer exists in its expected state");

  const orderedDraftPhotos = [...draft.photos].sort((a, b) => a.order - b.order);
  const newDraftPhotos = orderedDraftPhotos.filter((photo) => !photo.existingSrc);
  const optimized = await Promise.all(newDraftPhotos.map(async (photo) => ({ photo, ...(await optimizePhoto(photo)) })));
  if (new Set(optimized.map((item) => item.digest)).size !== optimized.length) throw new Error("Duplicate new photographs were detected");
  const optimizedById = new Map(optimized.map((item) => [item.photo.id, item]));
  const newImagePaths = new Map(newDraftPhotos.map((photo) => [photo.id, `public/projects/${id}-${photo.stage}-${photo.id}.webp`]));
  const project = buildEditedProject(existing, draft, newImagePaths);
  const photos = project.photos;
  const nextTarget = target.map((item) => item.id === id ? project : item);
  const nextPublished = draft.editWasPublished ? nextTarget : published;
  const nextUnpublished = draft.editWasPublished ? unpublished : nextTarget;

  const ref = await github<GithubRef>(`/git/ref/heads/${encodeURIComponent(branch())}`);
  const parent = await github<GithubCommit>(`/git/commits/${ref.object.sha}`);
  const [publishedBlob, unpublishedBlob, ...photoBlobs] = await Promise.all([
    createBlob(`${JSON.stringify(nextPublished, null, 2)}\n`, "utf-8"),
    createBlob(`${JSON.stringify(nextUnpublished, null, 2)}\n`, "utf-8"),
    ...newDraftPhotos.map((photo) => createBlob(optimizedById.get(photo.id)!.bytes, "base64")),
  ]);
  const retained = new Set(photos.map((photo) => photo.src));
  const removedPaths = existing.photos.map((photo) => photo.src).filter((src) => !retained.has(src));
  const treeEntries: Array<Record<string, unknown>> = [
    { path: "app/data/cms-projects.json", mode: "100644", type: "blob", sha: publishedBlob.sha },
    { path: "app/data/cms-unpublished-projects.json", mode: "100644", type: "blob", sha: unpublishedBlob.sha },
    ...newDraftPhotos.map((photo, index) => ({ path: newImagePaths.get(photo.id), mode: "100644", type: "blob", sha: photoBlobs[index].sha })),
    ...removedPaths.filter((src) => src.startsWith(`/projects/${id}-`)).map((src) => ({ path: `public${src}`, mode: "100644", type: "blob", sha: null })),
  ];
  const tree = await github<{ sha: string }>("/git/trees", { method: "POST", body: JSON.stringify({ base_tree: parent.tree.sha, tree: treeEntries }) });
  const commit = await github<{ sha: string }>("/git/commits", {
    method: "POST",
    body: JSON.stringify({ message: `portfolio: edit ${id}`, tree: tree.sha, parents: [ref.object.sha] }),
  });
  await github(`/git/refs/heads/${encodeURIComponent(branch())}`, { method: "PATCH", body: JSON.stringify({ sha: commit.sha, force: false }) });
  return { commitSha: commit.sha, url: `https://handymantampa.net/projects/${id}` };
}

export function buildEditedProject(existing: Project, draft: CmsDraft, newImagePaths: Map<string, string>): Project {
  if (!draft.content || !draft.editProjectId || !draft.photos.length) throw new Error("Invalid project edit draft");
  const photos = [...draft.photos].sort((a, b) => a.order - b.order).map((photo) => {
    const newPath = newImagePaths.get(photo.id);
    if (!photo.existingSrc && !newPath) throw new Error(`Missing optimized image for ${photo.id}`);
    return {
      src: photo.existingSrc || `/${newPath!.replace(/^public\//, "")}`,
      alt: draft.content!.imageAlt[photo.id],
      caption: draft.content!.imageAlt[photo.id],
      stage: photo.stage,
    };
  });
  const cover = (photos.find((photo) => photo.stage === "after") || photos[0]).src;
  return {
    ...existing,
    id: draft.editProjectId,
    title: draft.content.title,
    category: getPortfolioCategory(draft.content.serviceSlug) || draft.content.category,
    serviceSlug: draft.content.serviceSlug,
    summary: draft.content.summary,
    description: draft.content.description,
    seoTitle: draft.content.seoTitle,
    metaDescription: draft.content.metaDescription,
    location: draft.content.location || draft.location,
    cover,
    photos,
    detailPage: true,
  };
}

export async function listPublishedProjects(): Promise<Project[]> {
  return readCmsProjects();
}

export async function listUnpublishedProjects(): Promise<Project[]> {
  return readProjectFile("app/data/cms-unpublished-projects.json");
}

export function transitionProjectPublication(
  published: Project[],
  unpublished: Project[],
  id: string,
  action: "unpublish" | "republish" | "delete",
): { published: Project[]; unpublished: Project[]; project: Project } {
  const source = action === "republish" ? unpublished : published;
  const project = source.find((item) => item.id === id);
  if (!project) throw new Error("Project was not found in the expected state");
  if (action === "unpublish") {
    return {
      published: published.filter((item) => item.id !== id),
      unpublished: [...unpublished.filter((item) => item.id !== id), project],
      project,
    };
  }
  if (action === "republish") {
    if (published.some((item) => item.id === id)) throw new Error("Published URL already exists");
    return {
      published: [...published, project],
      unpublished: unpublished.filter((item) => item.id !== id),
      project,
    };
  }
  return {
    published: published.filter((item) => item.id !== id),
    unpublished: unpublished.filter((item) => item.id !== id),
    project,
  };
}

export async function changeProjectPublication(id: string, action: "unpublish" | "republish" | "delete"): Promise<string> {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) throw new Error("Invalid project ID");
  const [published, unpublished] = await Promise.all([readCmsProjects(), listUnpublishedProjects()]);
  const { published: nextPublished, unpublished: nextUnpublished, project } = transitionProjectPublication(published, unpublished, id, action);

  const ref = await github<GithubRef>(`/git/ref/heads/${encodeURIComponent(branch())}`);
  const parent = await github<GithubCommit>(`/git/commits/${ref.object.sha}`);
  const [publishedBlob, unpublishedBlob] = await Promise.all([
    createBlob(`${JSON.stringify(nextPublished, null, 2)}\n`, "utf-8"),
    createBlob(`${JSON.stringify(nextUnpublished, null, 2)}\n`, "utf-8"),
  ]);
  const treeEntries: Array<Record<string, unknown>> = [
    { path: "app/data/cms-projects.json", mode: "100644", type: "blob", sha: publishedBlob.sha },
    { path: "app/data/cms-unpublished-projects.json", mode: "100644", type: "blob", sha: unpublishedBlob.sha },
  ];
  if (action === "delete") {
    for (const photo of project.photos) {
      const path = photo.src.replace(/^\//, "");
      if (path.startsWith("projects/") && path.includes(project.id)) treeEntries.push({ path: `public/${path}`, mode: "100644", type: "blob", sha: null });
    }
  }
  const tree = await github<{ sha: string }>("/git/trees", { method: "POST", body: JSON.stringify({ base_tree: parent.tree.sha, tree: treeEntries }) });
  const commit = await github<{ sha: string }>("/git/commits", {
    method: "POST",
    body: JSON.stringify({ message: `portfolio: ${action} ${id}`, tree: tree.sha, parents: [ref.object.sha] }),
  });
  await github(`/git/refs/heads/${encodeURIComponent(branch())}`, { method: "PATCH", body: JSON.stringify({ sha: commit.sha, force: false }) });
  return commit.sha;
}
