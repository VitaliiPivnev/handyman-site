import type { CmsDraft } from "./types.ts";

const DRAFT_TTL = 30 * 24 * 60 * 60;
const UPDATE_TTL = 7 * 24 * 60 * 60;
const PROCESSING_TTL = 90;

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

export type UpdateClaim = { status: "acquired"; token: string } | { status: "done" | "processing" };

export async function beginUpdate(updateId: number): Promise<UpdateClaim> {
  const key = `portfolio-cms:update:${updateId}`;
  const existing = await redis(["GET", key]);
  if (existing === "done") return { status: "done" };
  const token = `processing:${crypto.randomUUID()}`;
  const result = await redis(["SET", key, token, "EX", PROCESSING_TTL, "NX"]);
  if (result === "OK") return { status: "acquired", token };
  return { status: "processing" };
}

export async function completeUpdate(updateId: number, token: string): Promise<boolean> {
  const result = await redis([
    "EVAL",
    "if redis.call('GET', KEYS[1]) == ARGV[1] then redis.call('SET', KEYS[1], 'done', 'EX', ARGV[2]); return 1 end; return 0",
    1, `portfolio-cms:update:${updateId}`, token, UPDATE_TTL,
  ]);
  return Number(result) === 1;
}

export async function releaseUpdate(updateId: number, token: string): Promise<void> {
  await redis([
    "EVAL",
    "if redis.call('GET', KEYS[1]) == ARGV[1] then return redis.call('DEL', KEYS[1]) end; return 0",
    1, `portfolio-cms:update:${updateId}`, token,
  ]);
}

export async function withOwnerLock<T>(ownerId: string, operation: () => Promise<T>): Promise<T> {
  const key = `portfolio-cms:lock:${ownerId}`;
  const token = crypto.randomUUID();
  const acquired = await redis(["SET", key, token, "EX", PROCESSING_TTL, "NX"]);
  if (acquired !== "OK") throw new Error("CMS owner workflow is busy; Telegram should retry this update");
  try {
    return await operation();
  } finally {
    await redis([
      "EVAL",
      "if redis.call('GET', KEYS[1]) == ARGV[1] then return redis.call('DEL', KEYS[1]) end; return 0",
      1, key, token,
    ]).catch(() => undefined);
  }
}
