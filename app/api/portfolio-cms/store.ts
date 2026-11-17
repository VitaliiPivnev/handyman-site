import type { CmsDraft } from "./types.ts";

const DRAFT_TTL = 30 * 24 * 60 * 60;

async function redis(command: Array<string | number>): Promise<unknown> {
  const url = process.env.UPSTASH_REDIS_REST_URL?.replace(/\/$/, "");
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error("CMS draft storage is not configured");
  const response = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(command),
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error("CMS draft storage is unavailable");
  const body = await response.json() as { result?: unknown; error?: string };
  if (body.error) throw new Error("CMS draft storage rejected the operation");
  return body.result;
}

const draftKey = (ownerId: string) => `portfolio-cms:draft:${ownerId}`;

export async function getDraft(ownerId: string): Promise<CmsDraft | null> {
  const value = await redis(["GET", draftKey(ownerId)]);
  if (typeof value !== "string") return null;
  try { return JSON.parse(value) as CmsDraft; } catch { return null; }
}

export async function saveDraft(ownerId: string, draft: CmsDraft): Promise<void> {
  draft.updatedAt = new Date().toISOString();
  await redis(["SET", draftKey(ownerId), JSON.stringify(draft), "EX", DRAFT_TTL]);
}

export async function removeDraft(ownerId: string): Promise<void> {
  await redis(["DEL", draftKey(ownerId)]);
}

export async function claimUpdate(updateId: number): Promise<boolean> {
  const result = await redis(["SET", `portfolio-cms:update:${updateId}`, "1", "EX", 7 * 24 * 60 * 60, "NX"]);
  return result === "OK";
}
