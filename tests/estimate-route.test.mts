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
import { assessEstimateSpam, scoreEstimateSpam, spamThresholds } from "../app/api/estimate/spam.ts";
import { isConfirmedNewLeadRedirect } from "../app/components/lead-analytics.ts";

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
  assert.deepEqual([first.status, second.status].sort(), ["acquired", "processing"]);
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

test("GA4 generate_lead fires only for a newly delivered production lead", async () => {
  const [formSource, analyticsSource, routeSource, thanksSource] = await Promise.all([
    readFile(new URL("../app/components/EstimateForm.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/lead-analytics.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/estimate/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/thanks/page.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(formSource, /isConfirmedNewLeadRedirect\(response\.url\)/);
  assert.match(formSource, /await trackConfirmedLead\(\)/);
  assert.match(analyticsSource, /window\.gtag\("event", "generate_lead"/);
  assert.match(analyticsSource, /method: "website_form"/);
  assert.match(analyticsSource, /transport_type: "beacon"/);
  assert.match(analyticsSource, /event_callback: finish/);
  assert.match(analyticsSource, /LEAD_EVENT_TIMEOUT_MS = 300/);
  assert.doesNotMatch(analyticsSource, /customer_name|phone_number|email_address|lead_message|attachment|project_location/);

  assert.equal(isConfirmedNewLeadRedirect("https://handymantampa.net/thanks?lead=abc&conversion=1"), true);
  assert.equal(isConfirmedNewLeadRedirect("https://handymantampa.net/thanks?lead=abc"), false);
  assert.equal(isConfirmedNewLeadRedirect("https://handymantampa.net/thanks?lead=abc&conversion=1&test=1"), false);
  assert.equal(isConfirmedNewLeadRedirect("https://handymantampa.net/"), false);
  assert.equal(isConfirmedNewLeadRedirect("not-a-url"), false);

  const duplicateStart = routeSource.indexOf('if (submission.status === "delivered")');
  const duplicateEnd = routeSource.indexOf('if (deliveryMode === "test")', duplicateStart);
  assert.doesNotMatch(routeSource.slice(duplicateStart, duplicateEnd), /conversion=1/);

  const testStart = routeSource.indexOf('if (deliveryMode === "test")');
  const telegramStart = routeSource.indexOf("const bodyText", testStart);
  assert.doesNotMatch(routeSource.slice(testStart, telegramStart), /conversion=1/);
  assert.match(routeSource.slice(telegramStart), /thanks\?lead=\$\{submissionId\}&conversion=1/);
  assert.doesNotMatch(thanksSource, /generate_lead|LeadConversion/);
});

test("existing interaction analytics use one event per user action and retain UTM fields", async () => {
  const [trackingSource, formSource, attributionSource] = await Promise.all([
    readFile(new URL("../app/components/TrackingLink.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/EstimateForm.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/LeadAttributionFields.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(trackingSource, /window\.gtag\?\.\("event", eventName/);
  assert.equal((trackingSource.match(/window\.gtag\?\.\("event"/g) || []).length, 1);
  assert.match(trackingSource, /"click_to_call" \| "click_to_text"/);
  assert.match(formSource, /if \(formStarted\.current\) return/);
  assert.equal((formSource.match(/"form_started"/g) || []).length, 1);
  for (const field of ["utm_source", "utm_medium", "utm_campaign", "landing_page", "referrer_host"]) {
    assert.match(attributionSource, new RegExp(field));
  }
  assert.match(attributionSource, /handyman_first_touch/);
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

test("obvious SEO and ranking solicitations are blocked by combined signals", () => {
  const result = scoreEstimateSpam({
    name: "Michael",
    email: "sales@example.com",
    location: "",
    message: "I came across your website. We offer SEO services and can get your website top Google rankings and more website traffic. Book a call with our team.",
  });
  assert.equal(result.action, "block");
  assert.ok(result.score >= spamThresholds.block);
  assert.ok(result.reasons.includes("commercial_solicitation"));
  assert.ok(result.reasons.includes("mass_outreach_template"));
});

test("AI employee, chatbot, lead database and automated outreach advertising is blocked", () => {
  const result = scoreEstimateSpam({
    name: "Business Growth Team",
    email: "outreach@example.com",
    location: "Tampa",
    message: "We offer AI employees and chatbots for lead generation, B2B databases, and automated outreach. Our solution can grow your business.",
  });
  assert.equal(result.action, "block");
  assert.ok(result.reasons.includes("not_handyman_request"));
});

test("standalone commercial ads block on their first message without a template introduction", () => {
  const advertisements = [
    "We provide SEO services to improve your Google rankings.",
    "We offer lead generation services that can increase your leads.",
    "Our digital marketing service can increase your website traffic.",
    "We provide AI employees for your business and offer a free consultation.",
  ];
  for (const message of advertisements) {
    const result = scoreEstimateSpam({
      name: "Sales Representative",
      email: "sales@example.com",
      location: "",
      message,
    });
    assert.equal(result.action, "block", `${message}: ${JSON.stringify(result)}`);
    assert.ok(result.score >= spamThresholds.block);
    assert.ok(result.reasons.includes("commercial_solicitation"));
    assert.ok(result.reasons.includes("not_handyman_request"));
    assert.ok(result.reasons.includes("high_confidence_unrelated_ad"));
    assert.ok(!result.reasons.includes("mass_outreach_template"));
  }
});

test("known spam domains, HTML and URL names accumulate risk", () => {
  const result = scoreEstimateSpam({
    name: "https://myxa.cc/promo",
    email: "sender@example.com",
    location: "1",
    message: "<b>This message came through your contact form</b>. Visit https://myxa.cc for our service.",
  });
  assert.equal(result.action, "block");
  assert.ok(result.reasons.includes("known_spam_domain"));
  assert.ok(result.reasons.includes("html_in_fields"));
  assert.ok(result.reasons.includes("url_in_name"));
});

test("random and placeholder form values are blocked", () => {
  const result = scoreEstimateSpam({ name: "1", email: "", location: "", message: "asdfghjkl qwerty", });
  assert.equal(result.action, "block");
  assert.ok(result.reasons.includes("invalid_name_pattern"));
  assert.ok(result.reasons.includes("garbage_message"));
});

test("real ceiling and cabinet handyman requests stay allowed", () => {
  const normalRequests = [
    "I need to repair a ceiling damaged by an AC leak. The damaged area is about four feet wide.",
    "I need help installing kitchen cabinets next week. Here is the product: https://example.com/cabinets",
    "Can you install a Google Nest doorbell and repair the trim around my front door?",
    "We need an AI camera mounted outside and a small hole in the drywall patched afterward.",
  ];
  for (const message of normalRequests) {
    const result = scoreEstimateSpam({ name: "Jamie Smith", email: "jamie@example.com", location: "Tampa", message });
    assert.equal(result.action, "allow", `${message}: ${JSON.stringify(result)}`);
  }
});

test("ambiguous commercial wording with a real repair is marked for review, not dropped", () => {
  const result = scoreEstimateSpam({
    name: "Chris",
    email: "chris@example.com",
    location: "Clearwater",
    message: "I came across your website and wanted to discuss Google rankings, but I also need help to repair a damaged door at my office.",
  });
  assert.equal(result.action, "review");
  assert.ok(result.score >= spamThresholds.review && result.score < spamThresholds.block);
});

test("repeated risky message fingerprints raise risk without storing message text", async () => {
  configureRedis();
  let count = 0;
  const bodies: string[] = [];
  globalThis.fetch = async (_input, init) => {
    count += 1;
    bodies.push(String(init?.body));
    return new Response(JSON.stringify([{ result: count }, { result: count === 1 ? 1 : 0 }, { result: 604800 }]), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };
  const input = {
    name: "Changing Name",
    email: "changing@example.com",
    location: "",
    message: "I am reaching out about digital marketing for your business.",
  };
  const first = await assessEstimateSpam(input);
  const second = await assessEstimateSpam({ ...input, name: "Different Name", email: "other@example.com" });
  assert.equal(first.repeatCount, 1);
  assert.equal(second.repeatCount, 2);
  assert.ok(second.score > first.score);
  assert.ok(second.reasons.includes("repeated_message_fingerprint"));
  assert.doesNotMatch(bodies.join(" "), /digital marketing|changing name|example\.com/i);
});

test("fingerprint storage failure does not silently block an otherwise reviewable lead", async () => {
  configureRedis();
  globalThis.fetch = async () => new Response("unavailable", { status: 503 });
  const result = await assessEstimateSpam({
    name: "Pat",
    email: "pat@example.com",
    location: "Tampa",
    message: "I am reaching out about digital marketing for your business.",
  });
  assert.equal(result.fingerprintStatus, "unavailable");
  assert.notEqual(result.action, "block");
});

test("route blocks spam before idempotency and Telegram, while review leads are labeled", async () => {
  const source = await readFile(new URL("../app/api/estimate/route.ts", import.meta.url), "utf8");
  const assessCall = source.indexOf("await assessEstimateSpam(");
  const claimCall = source.indexOf("await claimSubmission(");
  const telegramCall = source.indexOf('await telegram("sendMessage"');
  assert.ok(assessCall >= 0 && claimCall > assessCall && telegramCall > claimCall);
  assert.match(source, /spam\.action === "block"/);
  assert.match(source, /⚠️ REVIEW — Possible Promotional Lead/);
});
