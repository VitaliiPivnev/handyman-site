"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    turnstile?: { reset: (widgetId?: string) => void };
  }
}

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  eventName: "click_to_call" | "click_to_text" | "estimate_cta" | "external_reviews";
  eventLabel: string;
  children: ReactNode;
};

export default function TrackingLink({ eventName, eventLabel, children, onClick, ...rest }: Props) {
  return (
    <a
      {...rest}
      onClick={(event) => {
        window.gtag?.("event", eventName, {
          event_category: "lead_interaction",
          event_label: eventLabel,
        });
        onClick?.(event);
      }}
    >
      {children}
    </a>
  );
}
