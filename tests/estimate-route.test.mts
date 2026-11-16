import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { readFile } from "node:fs/promises";
import { getClientIp, withinRateLimit } from "../app/api/estimate/rate-limit.ts";

const originalFetch = globalThis.fetch;
const envNames = [
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
  "RATE_LIMIT_MODE",
  "TURNSTILE_SECRET_KEY",
  "NEXT_PUBLIC_TURNSTILE_SITE_KEY",
  "TURNSTILE_EXPECTED_HOSTNAME",
  "VERCEL_ENV",
  "LEAD_DELIVERY_MODE",
];
const originalEnv = Object.fromEntries(envNames.map((name) => [name, process.env[name]]));

afterEach(() => {
  globalThis.fetch = originalFetch;
  for (const name of envNames) {
    const value = originalEnv[name];
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }
});

function configureRedis() {
  process.env.UPSTASH_REDIS_REST_URL = "https://redis.example.test";
  process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";
  process.env.RATE_LIMIT_MODE = "enforce";
}

function redisResponse(count: number, ttl = 600, expireResult = 1) {
  return new Response(JSON.stringify([
    { result: count },
    { result: expireResult },
    { result: ttl },
  ]), { status: 200, headers: { "Content-Type": "application/json" } });
}

test("enforced missing Redis credentials is unavailable, never limited", async () => {
  process.env.RATE_LIMIT_MODE = "enforce";
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
  assert.deepEqual(await withinRateLimit("203.0.113.10"), {
    status: "unavailable",
    reason: "rate_limit_credentials_missing",
  });
});

test("invalid RATE_LIMIT_MODE and non-enforced production are configuration errors", async () => {
  process.env.RATE_LIMIT_MODE = "true";
  assert.deepEqual(await withinRateLimit("203.0.113.10"), {
    status: "unavailable", reason: "rate_limit_mode_invalid",
  });

  delete process.env.RATE_LIMIT_MODE;
  process.env.VERCEL_ENV = "production";
  assert.deepEqual(await withinRateLimit("203.0.113.10"), {
    status: "unavailable", reason: "rate_limit_not_enforced_in_production",
  });
});

test("Redis HTTP and command errors are unavailable, never 429 results", async () => {
  configureRedis();
  globalThis.fetch = async () => new Response("unauthorized", { status: 401 });
  assert.deepEqual(await withinRateLimit("203.0.113.10"), {
    status: "unavailable",
    reason: "redis_http_401",
  });

  globalThis.fetch = async () => new Response(JSON.stringify([
    { error: "ERR test" }, { result: 0 }, { result: -1 },
  ]), { status: 200, headers: { "Content-Type": "application/json" } });
  assert.deepEqual(await withinRateLimit("203.0.113.10"), {
    status: "unavailable",
    reason: "redis_command_error",
  });
});

test("valid Redis count and TTL distinguish allowed from limited", async () => {
  configureRedis();
  globalThis.fetch = async () => redisResponse(5, 597, 0);
  assert.deepEqual(await withinRateLimit("203.0.113.10"), {
    status: "allowed", count: 5, ttl: 597,
  });

  globalThis.fetch = async () => redisResponse(6, 596, 0);
  assert.deepEqual(await withinRateLimit("203.0.113.10"), {
    status: "limited", count: 6, ttl: 596,
  });
});

test("missing TTL is treated as Redis failure, not a limit", async () => {
  configureRedis();
  globalThis.fetch = async () => redisResponse(1, -1, 0);
  assert.deepEqual(await withinRateLimit("203.0.113.10"), {
    status: "unavailable", reason: "redis_ttl_invalid",
  });
});

test("client IP accepts valid forwarded values and rejects malformed input", () => {
  assert.equal(getClientIp(new Request("https://example.test", {
    headers: { "x-forwarded-for": "203.0.113.10, 10.0.0.1" },
  })), "203.0.113.10");
  assert.equal(getClientIp(new Request("https://example.test", {
    headers: { "x-forwarded-for": "not-an-ip" },
  })), null);
});

test("route invokes Turnstile before rate limiting", async () => {
  const source = await readFile(new URL("../app/api/estimate/route.ts", import.meta.url), "utf8");
  const verifyCall = source.indexOf("await verifyTurnstile(");
  const rateLimitCall = source.indexOf("await withinRateLimit(");
  assert.ok(verifyCall >= 0, "Turnstile call must exist");
  assert.ok(rateLimitCall > verifyCall, "rate limiter must run after Turnstile");
});
