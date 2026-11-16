"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

/** Record one GA4 lead event for each successful server-side Telegram delivery. */
export default function LeadConversion({ leadId }: { leadId: string }) {
  useEffect(() => {
    const key = `handyman_conversion_${leadId}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch { /* continue tracking when browser storage is restricted */ }
    // Queue event even if the Google Analytics script has not loaded yet.
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(["event", "generate_lead", { method: "website_form" }]);
  }, [leadId]);
  return null;
}
