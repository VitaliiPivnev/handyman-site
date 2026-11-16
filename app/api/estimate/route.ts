import { NextResponse } from "next/server";
import { getClientIp, withinRateLimit } from "./rate-limit";
import { claimSubmission, isValidSubmissionId, markSubmissionDelivered, releaseSubmission } from "./idempotency";
import { assessEstimateSpam } from "./spam";

export const runtime = "nodejs";

const MAX_BODY = 4 * 1024 * 1024; // Vercel platform cap is 4.5MB including multipart overhead
const MAX_PHOTOS = 3;
const MAX_PHOTO_SIZE = 1 * 1024 * 1024;
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);

function asText(data: FormData, name: string, limit: number): string | null {
  const value = data.get(name);
  if (value !== null && typeof value !== "string") return null;
  const cleaned = (value || "").trim();
  return cleaned.length <= limit ? cleaned : null;
}

function formError(message: string, status = 400) {
  return new Response(
    `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Request not sent</title><main style="max-width:600px;margin:10vh auto;padding:24px;font-family:Arial,sans-serif"><h1>Request not sent</h1><p>${message}</p><p><a href="/#estimate">Go back to the estimate form</a></p></main></html>`,
    { status, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } }
  );
}

async function verifyTurnstile(token: string, ip: string | null): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  const isLiveProduction = process.env.VERCEL_ENV === "production";
  if (!secret) return !isLiveProduction;
  if (!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || !token) return false;
  try {
    const body = new URLSearchParams({ secret, response: token });
    if (ip) body.set("remoteip", ip);
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return false;
    const result: { success?: boolean; hostname?: string } = await response.json();
    // Set TURNSTILE_EXPECTED_HOSTNAME=handymantampa.net after deployment.
    const expected = process.env.TURNSTILE_EXPECTED_HOSTNAME;
    return result.success === true && (!expected || result.hostname === expected);
  } catch {
    return false;
  }
}

async function hasValidImageSignature(file: File): Promise<boolean> {
  const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const ascii = String.fromCharCode(...bytes);
  if (file.type === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (file.type === "image/png") return bytes.slice(0, 8).every((value, index) => value === [137, 80, 78, 71, 13, 10, 26, 10][index]);
  if (file.type === "image/webp") return ascii.slice(0, 4) === "RIFF" && ascii.slice(8, 12) === "WEBP";
  if (file.type === "image/heic" || file.type === "image/heif") return ascii.slice(4, 8) === "ftyp" && /hei[cf]|mif1|msf1/.test(ascii.slice(8, 16));
  return false;
}

function safeUpload(file: File, index: number): File {
  const extension: Record<string, string> = {
    "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/heic": "heic", "image/heif": "heif",
  };
  return new File([file], `project-photo-${index + 1}.${extension[file.type] || "bin"}`, { type: file.type });
}

async function telegram(endpoint: string, body: BodyInit, headers?: HeadersInit) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("Telegram bot configuration missing");
  const response = await fetch(`https://api.telegram.org/bot${token}/${endpoint}`, {
    method: "POST", body, headers, cache: "no-store", signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new ConfirmedTelegramFailure(`Telegram ${endpoint} failed with status ${response.status}`);
  const result: { ok?: boolean } = await response.json();
  if (result.ok !== true) throw new ConfirmedTelegramFailure(`Telegram ${endpoint} rejected request`);
}

class ConfirmedTelegramFailure extends Error {}

export async function POST(request: Request) {
  try {
    const size = Number(request.headers.get("content-length") || 0);
    if (size > MAX_BODY) return formError("Your upload is too large. Please send no more than three compressed photos.", 413);

    const form = await Promise.race([
      request.formData(),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Form parsing timed out")), 10_000)),
    ]);
    if (String(form.get("company_website") || "").trim()) return formError("Please review your request and try again.", 403);

    const name = asText(form, "name", 80);
    const phone = asText(form, "phone", 30);
    const email = asText(form, "email", 160);
    const location = asText(form, "location", 90);
    const message = asText(form, "message", 3000);
    const submissionId = asText(form, "submission_id", 64);
    const source = asText(form, "utm_source", 120) || "";
    const medium = asText(form, "utm_medium", 120) || "";
    const campaign = asText(form, "utm_campaign", 120) || "";
    const landingPage = asText(form, "landing_page", 180) || "";
    const referrer = asText(form, "referrer_host", 120) || "";
    if (!name || name.length < 2 || !phone || !message || message.length < 10 || email === null || location === null) {
      return formError("Please enter your name, phone number, and project details.");
    }
    if (!submissionId || !isValidSubmissionId(submissionId)) {
      return formError("This form session is invalid. Please refresh the page and try again.");
    }
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 15) return formError("Please enter a valid phone number.");
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return formError("Please check your email address.");
    if ((message.match(/https?:\/\/|www\./gi) || []).length >= 3) return formError("Please remove unnecessary website links from the message.");

    const files = form.getAll("attachment").filter((value): value is File => value instanceof File && value.size > 0);
    if (files.length > MAX_PHOTOS) return formError("Please select no more than three photos.");
    if (files.some((file) => file.size > MAX_PHOTO_SIZE || !IMAGE_TYPES.has(file.type))) {
      return formError("Photos must be JPG, PNG, WebP, or HEIC and no larger than 1 MB each after compression.");
    }
    if (!(await Promise.all(files.map(hasValidImageSignature))).every(Boolean)) {
      return formError("One of the selected files is not a supported photo. Please choose JPG, PNG, WebP, or HEIC images.");
    }

    const ip = getClientIp(request);
    const verified = await verifyTurnstile(String(form.get("cf-turnstile-response") || ""), ip);
    if (!verified) return formError("Security verification failed. Please return to the form and retry.", 403);

    const rateLimit = await withinRateLimit(ip);
    if (rateLimit.status === "limited") {
      return formError("Too many requests were sent. Please wait ten minutes, then try again, or call or text us.", 429);
    }
    if (rateLimit.status === "unavailable") {
      console.error("Estimate rate limit unavailable", { reason: rateLimit.reason });
      return formError("The form is temporarily unavailable. Please call or text us instead.", 503);
    }

    const spam = await assessEstimateSpam({ name, email, location, message });
    if (spam.action !== "allow" || spam.fingerprintStatus === "unavailable") {
      console.warn("Estimate spam assessment", {
        action: spam.action,
        score: spam.score,
        reasons: spam.reasons,
        repeatCount: spam.repeatCount,
        fingerprintStatus: spam.fingerprintStatus,
      });
    }
    if (spam.action === "block") {
      return formError("Your request could not be accepted. Please describe the handyman work you need and remove promotional or unrelated content.", 422);
    }

    const isProduction = process.env.VERCEL_ENV === "production";
    const deliveryMode = process.env.LEAD_DELIVERY_MODE || (isProduction ? "telegram" : "test");
    if (isProduction && deliveryMode !== "telegram") {
      console.error("Production lead delivery mode is not configured");
      return formError("The form is temporarily unavailable. Please call or text us instead.", 503);
    }
    if (deliveryMode !== "telegram" && deliveryMode !== "test") {
      console.error("Unknown lead delivery mode");
      return formError("The form is temporarily unavailable. Please call or text us instead.", 503);
    }
    if (deliveryMode === "telegram" && !isProduction && process.env.ALLOW_PREVIEW_TELEGRAM_DELIVERY !== "true") {
      console.error("Preview Telegram delivery is not explicitly allowed");
      return formError("Preview delivery is disabled. Use test mode or a dedicated test Telegram destination.", 503);
    }

    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (deliveryMode === "telegram" && (!chatId || !process.env.TELEGRAM_BOT_TOKEN)) {
      console.error("Lead destination not configured");
      return formError("The form is temporarily unavailable. Please call or text us instead.", 503);
    }

    const submission = await claimSubmission(submissionId);
    if (submission.status === "unavailable") {
      console.error("Estimate idempotency unavailable", { reason: submission.reason });
      return formError("The form is temporarily unavailable. Please call or text us instead.", 503);
    }
    if (submission.status === "processing") {
      return formError("This request is already being processed. Please wait before trying again.", 409);
    }
    if (submission.status === "delivered") {
      const testQuery = deliveryMode === "test" ? "&test=1" : "";
      return NextResponse.redirect(new URL(`/thanks?lead=${submissionId}${testQuery}`, request.url), 303);
    }
    if (deliveryMode === "test") {
      if (!(await markSubmissionDelivered(submissionId, submission.lockValue))) {
        console.error("Unable to finalize test submission idempotency");
        await releaseSubmission(submissionId, submission.lockValue);
        return formError("The form is temporarily unavailable. Please call or text us instead.", 503);
      }
      return NextResponse.redirect(new URL(`/thanks?lead=${submissionId}&test=1`, request.url), 303);
    }

    const bodyText = [
      spam.action === "review" ? "⚠️ REVIEW — Possible Promotional Lead" : "🛠 New Handyman Website Lead",
      ...(spam.action === "review" ? [`Risk signals: ${spam.reasons.join(", ") || "context review"}`] : []),
      `Name: ${name}`,
      `Phone: ${phone}`,
      `Email: ${email || "Not provided"}`,
      `City / ZIP: ${location || "Not provided"}`,
      "Project:", message,
      `Photos attached: ${files.length}`,
      `UTM: ${source || "(direct)"} / ${medium || "none"} / ${campaign || "none"}`,
      `Landing: ${landingPage || "unknown"}`,
      `Referrer: ${referrer || "none"}`,
    ].join("\n");

    try {
      await telegram("sendMessage", JSON.stringify({ chat_id: chatId!, text: bodyText }), { "Content-Type": "application/json" });
    } catch (error) {
      // A definite API rejection is safe to retry. A timeout or network error
      // is ambiguous: Telegram may have accepted the message, so retain the
      // processing lock rather than risk sending the same lead twice.
      if (error instanceof ConfirmedTelegramFailure) {
        await releaseSubmission(submissionId, submission.lockValue);
      }
      throw error;
    }

    if (!(await markSubmissionDelivered(submissionId, submission.lockValue))) {
      // The Telegram text is already confirmed. Keep the processing lock so a
      // retry cannot send a duplicate, and return success to the customer.
      console.error("Telegram delivered but submission idempotency finalization failed");
    }

    // The text lead is now safely delivered; do not lose it if a photo fails.
    for (const [index, originalFile] of files.entries()) {
      try {
        const file = safeUpload(originalFile, index);
        const photoData = new FormData();
        photoData.set("chat_id", chatId!);
        const isPhoto = file.type === "image/jpeg" || file.type === "image/png";
        photoData.set(isPhoto ? "photo" : "document", file);
        await telegram(isPhoto ? "sendPhoto" : "sendDocument", photoData);
      } catch (error) {
        console.error("Failed to forward an attached photo", error);
      }
    }
    return NextResponse.redirect(new URL(`/thanks?lead=${submissionId}&conversion=1`, request.url), 303);
  } catch (error) {
    console.error("Unable to deliver website estimate", error);
    return formError("There was a problem sending your request. Please call or text us instead.", 500);
  }
}
