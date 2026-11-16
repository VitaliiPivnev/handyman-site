import { isIP } from "node:net";

const RATE_LIMIT_WINDOW_SECONDS = 10 * 60;
const RATE_LIMIT_MAX = 5;

export type RateLimitResult =
  | { status: "allowed"; count?: number; ttl?: number }
  | { status: "limited"; count: number; ttl: number }
  | { status: "unavailable"; reason: string };

export function getClientIp(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  const candidate = forwarded || realIp || "";
  return isIP(candidate) ? candidate : null;
}

async function sha256(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function withinRateLimit(ip: string | null): Promise<RateLimitResult> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  const configuredMode = process.env.RATE_LIMIT_MODE || "";
  if (configuredMode && configuredMode !== "enforce") {
    return { status: "unavailable", reason: "rate_limit_mode_invalid" };
  }
  const enforce = configuredMode === "enforce";
  if (process.env.VERCEL_ENV === "production" && !enforce) {
    return { status: "unavailable", reason: "rate_limit_not_enforced_in_production" };
  }
  if (!url || !token) {
    return enforce
      ? { status: "unavailable", reason: "rate_limit_credentials_missing" }
      : { status: "allowed" };
  }
  if (!ip) {
    return enforce
      ? { status: "unavailable", reason: "client_ip_missing_or_invalid" }
      : { status: "allowed" };
  }
  try {
    const key = `estimate:${(await sha256(ip)).slice(0, 32)}`;
    const response = await fetch(`${url.replace(/\/$/, "")}/multi-exec`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify([
        ["INCR", key],
        ["EXPIRE", key, RATE_LIMIT_WINDOW_SECONDS, "NX"],
        ["TTL", key],
      ]),
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) {
      return { status: "unavailable", reason: `redis_http_${response.status}` };
    }
    const result: unknown = await response.json();
    if (!Array.isArray(result) || result.length < 3) {
      return { status: "unavailable", reason: "redis_response_shape_invalid" };
    }
    const entries = result as Array<{ result?: number | string; error?: string }>;
    if (entries.some((entry) => typeof entry?.error === "string")) {
      return { status: "unavailable", reason: "redis_command_error" };
    }
    const count = Number(entries[0]?.result);
    const expireResult = Number(entries[1]?.result);
    const ttl = Number(entries[2]?.result);
    if (!Number.isInteger(count) || count < 1) {
      return { status: "unavailable", reason: "redis_count_invalid" };
    }
    if (![0, 1].includes(expireResult) || !Number.isInteger(ttl) || ttl <= 0 || ttl > RATE_LIMIT_WINDOW_SECONDS) {
      return { status: "unavailable", reason: "redis_ttl_invalid" };
    }
    return count > RATE_LIMIT_MAX
      ? { status: "limited", count, ttl }
      : { status: "allowed", count, ttl };
  } catch {
    return { status: "unavailable", reason: "redis_request_failed" };
  }
}
