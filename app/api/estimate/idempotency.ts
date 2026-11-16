const PROCESSING_TTL_SECONDS = 60 * 60;
const DELIVERED_TTL_SECONDS = 30 * 24 * 60 * 60;

export type SubmissionClaim =
  | { status: "acquired"; lockValue: string }
  | { status: "processing" }
  | { status: "delivered" }
  | { status: "unavailable"; reason: string };

type RedisEntry = { result?: number | string | null; error?: string };

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function evalRedis(script: string, key: string, args: string[]): Promise<number | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  try {
    const response = await fetch(`${url.replace(/\/$/, "")}/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify([["EVAL", script, 1, key, ...args]]),
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return null;
    const payload: unknown = await response.json();
    if (!Array.isArray(payload) || payload.length !== 1) return null;
    const entry = payload[0] as RedisEntry;
    if (entry.error) return null;
    const result = Number(entry.result);
    return Number.isInteger(result) ? result : null;
  } catch {
    return null;
  }
}

export function isValidSubmissionId(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function claimSubmission(submissionId: string): Promise<SubmissionClaim> {
  const key = `estimate-submission:${(await sha256(submissionId)).slice(0, 40)}`;
  const lockValue = `processing:${crypto.randomUUID()}`;
  const script = [
    "local current = redis.call('GET', KEYS[1])",
    "if current == 'delivered' then return 2 end",
    "if current then return 0 end",
    "redis.call('SET', KEYS[1], ARGV[1], 'EX', ARGV[2])",
    "return 1",
  ].join("\n");
  const result = await evalRedis(script, key, [lockValue, String(PROCESSING_TTL_SECONDS)]);
  if (result === 1) return { status: "acquired", lockValue };
  if (result === 2) return { status: "delivered" };
  if (result === 0) return { status: "processing" };
  return { status: "unavailable", reason: "idempotency_claim_failed" };
}

export async function markSubmissionDelivered(submissionId: string, lockValue: string): Promise<boolean> {
  const key = `estimate-submission:${(await sha256(submissionId)).slice(0, 40)}`;
  const script = [
    "local current = redis.call('GET', KEYS[1])",
    "if current == 'delivered' then return 2 end",
    "if current ~= ARGV[1] then return 0 end",
    "redis.call('SET', KEYS[1], 'delivered', 'EX', ARGV[2])",
    "return 1",
  ].join("\n");
  const result = await evalRedis(script, key, [lockValue, String(DELIVERED_TTL_SECONDS)]);
  return result === 1 || result === 2;
}

export async function releaseSubmission(submissionId: string, lockValue: string): Promise<boolean> {
  const key = `estimate-submission:${(await sha256(submissionId)).slice(0, 40)}`;
  const script = [
    "if redis.call('GET', KEYS[1]) ~= ARGV[1] then return 0 end",
    "return redis.call('DEL', KEYS[1])",
  ].join("\n");
  return (await evalRedis(script, key, [lockValue])) === 1;
}
