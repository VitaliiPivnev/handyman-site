"use client";

import { useEffect, useState } from "react";

type Attribution = {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  landing_page: string;
  referrer_host: string;
};

const blank: Attribution = {
  utm_source: "", utm_medium: "", utm_campaign: "", landing_page: "", referrer_host: "",
};

export default function LeadAttributionFields() {
  const [values, setValues] = useState<Attribution>(blank);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const stored = JSON.parse(sessionStorage.getItem("handyman_first_touch") || "null") as Attribution | null;
      let referrer = "";
      try { if (document.referrer) referrer = new URL(document.referrer).hostname.slice(0, 120); } catch { /* external malformed referrer */ }
      const firstTouch: Attribution = stored || {
        utm_source: (params.get("utm_source") || "").slice(0, 120),
        utm_medium: (params.get("utm_medium") || "").slice(0, 120),
        utm_campaign: (params.get("utm_campaign") || "").slice(0, 120),
        landing_page: window.location.pathname.slice(0, 180),
        referrer_host: referrer,
      };
      if (!stored) sessionStorage.setItem("handyman_first_touch", JSON.stringify(firstTouch));
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync from external sessionStorage after mount
      setValues(firstTouch);
    } catch { /* form must continue to work if session storage is blocked */ }
  }, []);

  return <>
    {Object.entries(values).map(([name, value]) =>
      <input type="hidden" key={name} name={name} value={value} readOnly />
    )}
  </>;
}
