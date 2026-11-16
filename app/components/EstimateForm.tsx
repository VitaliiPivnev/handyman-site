"use client";

import { useRef, useState, type FormEvent } from "react";
import Script from "next/script";
import LeadAttributionFields from "./LeadAttributionFields";

// Vercel Functions accept at most 4.5 MB total request bodies. Reduce photos
// locally before submitting; never upload originals through the API route.
const MAX_PHOTOS = 3;
const MAX_IMAGE_BYTES = 950_000;

async function compressImage(file: File): Promise<File> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = new Image();
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Unable to read this photo"));
      image.src = objectUrl;
    });

    for (const [maxDimension, quality] of [[1600, 0.75], [1200, 0.68], [1000, 0.57]]) {
      const factor = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.naturalWidth * factor));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * factor));
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Image processing is unavailable");
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
      if (!blob) throw new Error("Image conversion failed");
      if (blob.size <= MAX_IMAGE_BYTES) {
        return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" });
      }
    }
    throw new Error("This photo is still too large after compression");
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export default function EstimateForm() {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const formStarted = useRef(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setError("");
    const formElement = event.currentTarget;
    const filesInput = formElement.elements.namedItem("attachment") as HTMLInputElement | null;
    const files = Array.from(filesInput?.files || []);
    if (files.length > MAX_PHOTOS) {
      setError(`Please choose up to ${MAX_PHOTOS} photos.`);
      return;
    }

    setSubmitting(true);
    try {
      const form = new FormData(formElement);
      form.delete("attachment");
      for (const file of files) {
        const optimized = await compressImage(file);
        form.append("attachment", optimized);
      }
      const response = await fetch("/api/estimate", { method: "POST", body: form, redirect: "follow" });
      if (response.ok && response.redirected && new URL(response.url).pathname === "/thanks") {
        window.location.assign(response.url);
        return;
      }
      const text = await response.text();
      const doc = new DOMParser().parseFromString(text, "text/html");
      const message = doc.querySelector("main p")?.textContent;
      setError(message || "Could not send the request. Please call or text us instead.");
      window.turnstile?.reset();
    } catch {
      setError("We couldn't process your photos or send this form. Please try again without photos, or text us your project details.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="estimate" className="bg-white px-5 py-16 text-black">
      <div className="mx-auto max-w-3xl rounded-3xl border border-black/10 bg-neutral-50 p-6 shadow-xl md:p-10">
        <p className="font-semibold text-amber-700">Free project estimate</p>
        <h2 className="mt-2 text-3xl font-extrabold md:text-5xl">Tell Us About Your Project</h2>
        <p className="mt-4 text-black/70">
          A short description and a few photos help us give you accurate project-based pricing.
          Materials, when needed, are quoted separately.
        </p>
        <form action="/api/estimate" method="POST" encType="multipart/form-data" onSubmit={handleSubmit}
          onFocus={() => {
            if (formStarted.current) return;
            formStarted.current = true;
            window.gtag?.("event", "form_started", { form_name: "estimate_request" });
          }}
          className="mt-8 space-y-5">
          <LeadAttributionFields />
          {/* The honeypot is invisible to visitors but attractive to unsophisticated bots. */}
          <div className="absolute -left-[9999px] -top-[9999px]" aria-hidden="true">
            <label htmlFor="company_website">Leave empty</label>
            <input id="company_website" name="company_website" autoComplete="off" tabIndex={-1} />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="lead-name" className="mb-2 block font-semibold">Your Name *</label>
              <input id="lead-name" name="name" type="text" required maxLength={80} autoComplete="name"
                className="w-full rounded-xl border border-black/20 px-4 py-3" placeholder="Your name" />
            </div>
            <div>
              <label htmlFor="lead-phone" className="mb-2 block font-semibold">Phone Number *</label>
              <input id="lead-phone" name="phone" type="tel" required maxLength={30} autoComplete="tel"
                className="w-full rounded-xl border border-black/20 px-4 py-3" placeholder="(813) 555-0123" />
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="lead-email" className="mb-2 block font-semibold">Email (optional)</label>
              <input id="lead-email" name="email" type="email" maxLength={160} autoComplete="email"
                className="w-full rounded-xl border border-black/20 px-4 py-3" placeholder="you@example.com" />
            </div>
            <div>
              <label htmlFor="lead-location" className="mb-2 block font-semibold">City or ZIP Code</label>
              <input id="lead-location" name="location" maxLength={90} autoComplete="address-level2"
                className="w-full rounded-xl border border-black/20 px-4 py-3" placeholder="Tampa, FL" />
            </div>
          </div>
          <div>
            <label htmlFor="lead-message" className="mb-2 block font-semibold">What Needs to Be Done? *</label>
            <textarea id="lead-message" name="message" required minLength={10} maxLength={3000} rows={5}
              className="w-full rounded-xl border border-black/20 px-4 py-3" placeholder="Describe the repair, installation, or project..." />
          </div>
          <div>
            <label htmlFor="lead-images" className="mb-2 block font-semibold">Photos (optional)</label>
            <input id="lead-images" type="file" name="attachment" multiple
              accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
              className="w-full rounded-xl border border-black/20 bg-white px-4 py-3" />
            <p className="mt-2 text-xs text-black/60">Up to 3 photos; resized on your device before sending. If your phone cannot process a photo, text it to us instead.</p>
          </div>
          {siteKey && (
            <>
              <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" />
              <div className="cf-turnstile" data-sitekey={siteKey} data-theme="light" />
            </>
          )}
          {!siteKey && process.env.NODE_ENV === "production" && (
            <p role="alert" className="rounded-xl bg-amber-50 p-4 text-sm font-semibold text-amber-900">
              Online security verification is temporarily unavailable. Please call or text us.
            </p>
          )}
          {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-800">{error}</p>}
          <button type="submit" disabled={submitting || (!siteKey && process.env.NODE_ENV === "production")}
            className="w-full rounded-xl bg-neutral-950 px-6 py-4 text-lg font-bold text-white hover:bg-neutral-800 disabled:cursor-wait disabled:opacity-60">
            {submitting ? "Sending your request..." : "Send My Estimate Request"}
          </button>
          <p className="text-xs leading-5 text-black/60">We use your details only to respond to this inquiry. No payment is required to request an estimate.</p>
        </form>
      </div>
    </section>
  );
}
