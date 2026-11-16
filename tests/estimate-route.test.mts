import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { readFile } from "node:fs/promises";
import { getClientIp, withinRateLimit } from "../app/api/estimate/rate-limit.ts";
import {
  claimSubmission,
  isValidSubmissionId,
  markSubmissionDelivered,
  releaseSubmission,
} from "../app/api/estimate/idempotency.ts";

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

test("submission IDs require a UUID v4 and independent IDs remain independent", () => {
  assert.equal(isValidSubmissionId("c7b190b5-bdc8-4ab8-a903-f8c80b3ad135"), true);
  assert.equal(isValidSubmissionId("c7b190b5-bdc8-1ab8-a903-f8c80b3ad135"), false);
  assert.equal(isValidSubmissionId("not-a-submission-id"), false);
});

test("parallel double POST atomically acquires only one delivery lock", async () => {
  configureRedis();
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    return new Response(JSON.stringify([{ result: calls === 1 ? 1 : 0 }]), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };

  const submissionId = "c7b190b5-bdc8-4ab8-a903-f8c80b3ad135";
  const [first, second] = await Promise.all([
    claimSubmission(submissionId),
    claimSubmission(submissionId),
  ]);
  assert.equal(first.status, "acquired");
  assert.equal(second.status, "processing");
  assert.equal(calls, 2);
});

test("repeat POST after successful delivery is acknowledged without a new lock", async () => {
  configureRedis();
  globalThis.fetch = async () => new Response(JSON.stringify([{ result: 2 }]), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
  assert.deepEqual(await claimSubmission("c7b190b5-bdc8-4ab8-a903-f8c80b3ad135"), {
    status: "delivered",
  });
});

test("delivery can be finalized and failed delivery can release its exact lock", async () => {
  configureRedis();
  const requests: string[] = [];
  globalThis.fetch = async (_input, init) => {
    requests.push(String(init?.body));
    return new Response(JSON.stringify([{ result: 1 }]), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };
  const submissionId = "c7b190b5-bdc8-4ab8-a903-f8c80b3ad135";
  assert.equal(await markSubmissionDelivered(submissionId, "processing:test-lock"), true);
  assert.equal(await releaseSubmission(submissionId, "processing:test-lock"), true);
  assert.match(requests[0], /delivered/);
  assert.match(requests[1], /DEL/);
});

test("Redis idempotency errors fail closed instead of allowing duplicate Telegram delivery", async () => {
  configureRedis();
  globalThis.fetch = async () => new Response(JSON.stringify([{ error: "ERR unavailable" }]), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
  assert.deepEqual(await claimSubmission("c7b190b5-bdc8-4ab8-a903-f8c80b3ad135"), {
    status: "unavailable",
    reason: "idempotency_claim_failed",
  });
});

test("client clears only confirmed success, handles BFCache Back, and blocks double clicks", async () => {
  const source = await readFile(new URL("../app/components/EstimateForm.tsx", import.meta.url), "utf8");
  assert.match(source, /response\.ok && response\.redirected/);
  assert.match(source, /sessionStorage\.setItem\(CLEAR_AFTER_SUCCESS_KEY/);
  assert.match(source, /clearEstimateForm\(\);\s*window\.location\.assign/);
  assert.match(source, /addEventListener\("pageshow", handlePageShow\)/);
  assert.match(source, /requestAnimationFrame\(clear\)/);
  assert.match(source, /window\.setTimeout\(clear, 100\)/);
  assert.match(source, /if \(submittingRef\.current\) return/);
  assert.match(source, /form\.set\("submission_id", submissionId\.current\)/);
});

test("client retains entered data on failed submission and only resets Turnstile", async () => {
  const source = await readFile(new URL("../app/components/EstimateForm.tsx", import.meta.url), "utf8");
  const failureStart = source.indexOf("const text = await response.text()");
  const failureEnd = source.indexOf("} finally {", failureStart);
  const failurePath = source.slice(failureStart, failureEnd);
  assert.match(failurePath, /setError\(/);
  assert.match(failurePath, /resetTurnstile\(\)/);
  assert.doesNotMatch(failurePath, /clearEstimateForm\(\)/);
});

test("server claims before Telegram and only releases a confirmed delivery failure", async () => {
  const source = await readFile(new URL("../app/api/estimate/route.ts", import.meta.url), "utf8");
  const claimCall = source.indexOf("await claimSubmission(");
  const telegramCall = source.indexOf('await telegram("sendMessage"');
  assert.ok(claimCall >= 0 && telegramCall > claimCall);
  const telegramCatch = source.slice(telegramCall, source.indexOf("if (!(await markSubmissionDelivered", telegramCall));
  assert.match(telegramCatch, /error instanceof ConfirmedTelegramFailure/);
  assert.match(telegramCatch, /await releaseSubmission\(/);
});
