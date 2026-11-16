const FINGERPRINT_TTL_SECONDS = 7 * 24 * 60 * 60;
const REVIEW_THRESHOLD = 4;
const BLOCK_THRESHOLD = 8;

export type SpamAction = "allow" | "review" | "block";

export type SpamAssessment = {
  action: SpamAction;
  score: number;
  reasons: string[];
  repeatCount?: number;
  fingerprintStatus: "recorded" | "skipped" | "unavailable";
};

export type SpamInput = {
  name: string;
  email: string;
  location: string;
  message: string;
};

type RedisEntry = { result?: number | string | null; error?: string };

function normalize(value: string): string {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/<[^>]{1,200}>/g, " ")
    .replace(/https?:\/\/\S+|www\.\S+/g, " url ")
    .replace(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/gi, " email ")
    .replace(/\b\d[\d\s().+-]{5,}\d\b/g, " number ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function containsAny(text: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(text));
}

function looksLikeRandomText(value: string): boolean {
  const compact = value.toLowerCase().replace(/[^a-z]/g, "");
  if (compact.length < 6) return false;
  if (/^(.)\1{5,}$/.test(compact) || /(?:asdf|qwer|zxcv|hjkl|testtest)/.test(compact)) return true;
  const vowels = (compact.match(/[aeiouy]/g) || []).length;
  return compact.length >= 9 && (vowels / compact.length < 0.12 || /(.)\1{3}/.test(compact));
}

export function scoreEstimateSpam(input: SpamInput): Omit<SpamAssessment, "repeatCount" | "fingerprintStatus"> {
  const message = normalize(input.message);
  const combined = `${input.name} ${input.email} ${input.location} ${input.message}`;
  const reasons: string[] = [];
  let score = 0;

  const commercialTopic = containsAny(message, [
    /\bseo\b|search engine optimi[sz]ation|google rankings?|rank (?:your|on) google/,
    /search index(?:ing| registration)?|website traffic|digital marketing/,
    /ai employees?|ai agents?|chatbots?|lead generation|b2b (?:data|database|leads?)/,
    /automated (?:email|outreach|messages?)|cold email|bulk email/,
  ]);
  const solicitation = containsAny(message, [
    /\b(?:we|i) (?:offer|provide|speciali[sz]e|can help|can get|would like to offer)\b/,
    /grow your business|increase your (?:website )?(?:sales|traffic|leads)|book (?:a )?(?:call|meeting)/,
    /guaranteed results?|free (?:audit|consultation|proposal)|our (?:service|team|solution)/,
  ]);
  const templateIntro = containsAny(message, [
    /\bi came across your website\b/,
    /\bthis message came through your contact form\b/,
    /\bi (?:was|am) reaching out\b|\bhope this (?:email|message) finds you well\b/,
  ]);
  const automationSignals = [
    /ai employees?|ai agents?/.test(message),
    /chatbots?/.test(message),
    /lead generation/.test(message),
    /b2b (?:data|database|leads?)/.test(message),
    /automated (?:email|outreach|messages?)/.test(message),
  ].filter(Boolean).length;
  const handymanIntent = containsAny(message, [
    /\b(?:i|we) need (?:help )?(?:to |with )?(?:repair|fix|install|replace|paint|patch|mount|assemble|build|remove)\b/,
    /\b(?:repair|fix|install|replacement|painting|patching|mounting|assembly|renovation|remodel)\b/,
    /\b(?:door|drywall|ceiling|wall|deck|fence|cabinet|shelf|floor|tile|trim|baseboard|patio|faucet|leak)\b/,
  ]);

  if (commercialTopic && solicitation) {
    score += 5;
    reasons.push("commercial_solicitation");
  } else if (commercialTopic) {
    score += 2;
    reasons.push("commercial_topic");
  }
  if (templateIntro && (commercialTopic || solicitation)) {
    score += 3;
    reasons.push("mass_outreach_template");
  }
  if (solicitation && automationSignals >= 2) {
    score += 2;
    reasons.push("automated_sales_stack");
  }
  if ((commercialTopic || solicitation) && !handymanIntent) {
    score += 2;
    reasons.push("not_handyman_request");
  }
  if (commercialTopic && solicitation && !handymanIntent) {
    // A recognized marketing/automation offer plus an explicit sales pitch,
    // with no actual repair or installation request, is high-confidence spam
    // even when it omits a familiar mass-mail introduction.
    score += 1;
    reasons.push("high_confidence_unrelated_ad");
  }
  if (handymanIntent) {
    // A real project strongly lowers risk, but a mass-outreach introduction
    // combined with marketing language still deserves human review.
    score = Math.max(0, score - (templateIntro && commercialTopic ? 1 : 3));
    reasons.push("handyman_context");
  }

  const htmlTags = /<\/?[a-z][^>]*>/i.test(`${input.name} ${input.message}`);
  if (htmlTags) {
    score += 3;
    reasons.push("html_in_fields");
  }
  if (/myxa\.cc/i.test(combined)) {
    score += 4;
    reasons.push("known_spam_domain");
  }
  if (/https?:\/\/|www\./i.test(input.name)) {
    score += 5;
    reasons.push("url_in_name");
  }
  const messageLinks = input.message.match(/https?:\/\/|www\./gi)?.length || 0;
  if (messageLinks > 0 && (commercialTopic || solicitation || templateIntro)) {
    score += Math.min(2, messageLinks);
    reasons.push("solicitation_links");
  }
  if (/^(?:1|test|none|n\/a|na)$/i.test(input.name.trim()) || looksLikeRandomText(input.name)) {
    score += 4;
    reasons.push("invalid_name_pattern");
  }
  if (/^(?:1|test|testing|asdf|qwerty|none|n\/a)[\s.!]*$/i.test(input.message.trim()) || looksLikeRandomText(input.message)) {
    score += 5;
    reasons.push("garbage_message");
  }

  return {
    action: score >= BLOCK_THRESHOLD ? "block" : score >= REVIEW_THRESHOLD ? "review" : "allow",
    score,
    reasons,
  };
}

async function recordFingerprint(message: string): Promise<{ count: number } | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  const canonical = normalize(message);
  if (!canonical) return null;
  const key = `estimate-spam:${(await sha256(canonical)).slice(0, 40)}`;
  try {
    const response = await fetch(`${url.replace(/\/$/, "")}/multi-exec`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify([
        ["INCR", key],
        ["EXPIRE", key, FINGERPRINT_TTL_SECONDS, "NX"],
        ["TTL", key],
      ]),
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return null;
    const payload: unknown = await response.json();
    if (!Array.isArray(payload) || payload.length < 3) return null;
    const entries = payload as RedisEntry[];
    if (entries.some((entry) => entry.error)) return null;
    const count = Number(entries[0]?.result);
    const ttl = Number(entries[2]?.result);
    if (!Number.isInteger(count) || count < 1 || !Number.isInteger(ttl) || ttl <= 0 || ttl > FINGERPRINT_TTL_SECONDS) return null;
    return { count };
  } catch {
    return null;
  }
}

export async function assessEstimateSpam(input: SpamInput): Promise<SpamAssessment> {
  const base = scoreEstimateSpam(input);
  // Store hashes only for messages that already show risk. Normal customer
  // requests never create behavioral fingerprint records.
  if (base.score < 2) return { ...base, fingerprintStatus: "skipped" };
  const fingerprint = await recordFingerprint(input.message);
  if (!fingerprint) return { ...base, fingerprintStatus: "unavailable" };

  let score = base.score;
  const reasons = [...base.reasons];
  if (fingerprint.count >= 2) {
    score += fingerprint.count >= 4 ? 4 : 2;
    reasons.push("repeated_message_fingerprint");
  }
  return {
    action: score >= BLOCK_THRESHOLD ? "block" : score >= REVIEW_THRESHOLD ? "review" : "allow",
    score,
    reasons,
    repeatCount: fingerprint.count,
    fingerprintStatus: "recorded",
  };
}

export const spamThresholds = { review: REVIEW_THRESHOLD, block: BLOCK_THRESHOLD } as const;
