"use client";

import { getTrackingContext } from "./attribution";

// Every component in the app funnels through this — nobody calls
// `fbq`/`gtag`/`window.dataLayer.push` directly. GTM (once configured)
// reads off `window.dataLayer` and routes each event to GA4/Meta/etc.
// Never put PII (name/phone/email) in here — only tracking context.

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export const CA_EVENTS = {
  PAGE_VIEW: "ca_page_view",
  ANALYSIS_CTA_CLICK: "ca_analysis_cta_click",
  TYPEBOT_STARTED: "ca_typebot_started",
  DIAGNOSTIC_COMPLETED: "ca_diagnostic_completed",
  LEAD_GENERATED: "ca_lead_generated",
  WHATSAPP_CLICK: "ca_whatsapp_click",
  PRODUCT_VIEW: "ca_product_view",
  PRODUCT_CTA_CLICK: "ca_product_cta_click",
  PRODUCT_PURCHASE_CLICK: "ca_product_purchase_click",
} as const;

export type CAEventName = (typeof CA_EVENTS)[keyof typeof CA_EVENTS];

function generateEventId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers — not cryptographically strong, but this
  // is a client tracking correlation id, not a security token.
  return `ca_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function isDebugEnabled(): boolean {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.NEXT_PUBLIC_TRACKING_DEBUG === "true"
  );
}

export function trackEvent(
  event: CAEventName,
  payload: Record<string, string | number | boolean | undefined> = {}
): string {
  const eventId = generateEventId();

  if (typeof window === "undefined") return eventId; // never runs server-side, but stay safe

  const context = getTrackingContext();

  const entry = {
    event,
    event_id: eventId,
    timestamp: new Date().toISOString(),
    page_location: window.location.href,
    page_path: window.location.pathname,
    ...context,
    ...payload,
  };

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(entry);

  if (isDebugEnabled()) {
    // eslint-disable-next-line no-console
    console.log(`[tracking] ${event}`, entry);
  }

  return eventId;
}
