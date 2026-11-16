const LEAD_EVENT_TIMEOUT_MS = 300;

export function isConfirmedNewLeadRedirect(responseUrl: string): boolean {
  try {
    const url = new URL(responseUrl);
    return url.pathname === "/thanks" &&
      url.searchParams.get("conversion") === "1" &&
      url.searchParams.get("test") !== "1";
  } catch {
    return false;
  }
}

/**
 * Send the GA4 recommended lead event before leaving the form page.
 * The callback normally resolves as soon as gtag queues the transport; the
 * timeout prevents analytics from creating a noticeable navigation delay.
 */
export function trackConfirmedLead(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.gtag) {
      resolve();
      return;
    }

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      window.clearTimeout(timeoutId);
      resolve();
    };
    const timeoutId = window.setTimeout(finish, LEAD_EVENT_TIMEOUT_MS);

    window.gtag("event", "generate_lead", {
      method: "website_form",
      form_name: "estimate_request",
      transport_type: "beacon",
      event_callback: finish,
      event_timeout: LEAD_EVENT_TIMEOUT_MS,
    });
  });
}
