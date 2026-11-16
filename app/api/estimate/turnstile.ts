const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

type TurnstileResponse = {
  success?: boolean;
  hostname?: string;
  "error-codes"?: unknown;
};

export type TurnstileResult = {
  outcome: "verified" | "rejected" | "unavailable";
  category:
    | "verified"
    | "configuration_missing"
    | "token_missing"
    | "siteverify_http_error"
    | "siteverify_response_invalid"
    | "siteverify_rejected"
    | "hostname_mismatch"
    | "siteverify_request_failed";
  httpStatus: number | null;
  success: boolean | null;
  hostname: string | null;
  errorCodes: string[];
  hostnameMatched: boolean | null;
};

function normalizedHostnames(value: string | undefined): string[] {
  return (value || "")
    .split(",")
    .map((hostname) => hostname.trim().toLowerCase().replace(/\.$/, ""))
    .filter(Boolean);
}

function safeErrorCodes(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((code): code is string => typeof code === "string")
    .map((code) => code.slice(0, 80))
    .slice(0, 10);
}

export function logTurnstileResult(result: TurnstileResult) {
  const diagnostic = {
    category: result.category,
    httpStatus: result.httpStatus,
    errorCodes: result.errorCodes,
    success: result.success,
    hostname: result.hostname,
    hostnameMatched: result.hostnameMatched,
  };
  if (result.outcome === "verified") console.info("Turnstile Siteverify", diagnostic);
  else console.error("Turnstile Siteverify", diagnostic);
}

export async function verifyTurnstile(token: string, ip: string | null): Promise<TurnstileResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  const siteKeyConfigured = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
  const production = process.env.VERCEL_ENV === "production";
  const expectedHostnames = normalizedHostnames(process.env.TURNSTILE_EXPECTED_HOSTNAME);

  if (!secret || !siteKeyConfigured || (production && expectedHostnames.length === 0)) {
    return {
      outcome: "unavailable", category: "configuration_missing", httpStatus: null,
      success: null, hostname: null, errorCodes: [], hostnameMatched: null,
    };
  }
  if (!token || token.length > 2048) {
    return {
      outcome: "rejected", category: "token_missing", httpStatus: null,
      success: false, hostname: null, errorCodes: [], hostnameMatched: null,
    };
  }

  try {
    const body = new URLSearchParams({ secret, response: token });
    if (ip) body.set("remoteip", ip);
    const response = await fetch(SITEVERIFY_URL, {
      method: "POST",
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) {
      return {
        outcome: "unavailable", category: "siteverify_http_error", httpStatus: response.status,
        success: null, hostname: null, errorCodes: [], hostnameMatched: null,
      };
    }

    let payload: TurnstileResponse;
    try {
      payload = await response.json() as TurnstileResponse;
    } catch {
      return {
        outcome: "unavailable", category: "siteverify_response_invalid", httpStatus: response.status,
        success: null, hostname: null, errorCodes: [], hostnameMatched: null,
      };
    }
    const errorCodes = safeErrorCodes(payload["error-codes"]);
    const hostname = typeof payload.hostname === "string"
      ? payload.hostname.toLowerCase().replace(/\.$/, "").slice(0, 253)
      : null;
    const hostnameMatched = expectedHostnames.length === 0
      ? true
      : Boolean(hostname && expectedHostnames.includes(hostname));

    if (payload.success !== true) {
      return {
        outcome: "rejected", category: "siteverify_rejected", httpStatus: response.status,
        success: false, hostname, errorCodes, hostnameMatched,
      };
    }
    if (!hostnameMatched) {
      return {
        outcome: "rejected", category: "hostname_mismatch", httpStatus: response.status,
        success: true, hostname, errorCodes, hostnameMatched: false,
      };
    }
    return {
      outcome: "verified", category: "verified", httpStatus: response.status,
      success: true, hostname, errorCodes, hostnameMatched: true,
    };
  } catch {
    return {
      outcome: "unavailable", category: "siteverify_request_failed", httpStatus: null,
      success: null, hostname: null, errorCodes: [], hostnameMatched: null,
    };
  }
}
