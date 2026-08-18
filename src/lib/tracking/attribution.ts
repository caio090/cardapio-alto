"use client";

import { extractAttributionFromSearchParams, type Attribution } from "@/lib/attribution";

// Client-side companion to `src/lib/attribution.ts` (which backs the
// server-only, httpOnly cookie read by proxy.ts and the diagnostic
// endpoint). That cookie is intentionally unreadable from the browser —
// this module exists so GTM events, DiagnosticCTA, and the future Typebot
// embed have something client-readable to work with. Same UTM/Meta
// parsing logic, reused rather than reimplemented; different storage.
//
// No PII is ever stored here — only campaign/source-shaped strings.

const FIRST_TOUCH_KEY = "ca_first_touch";
const LAST_TOUCH_KEY = "ca_last_touch";
const SESSION_TOUCH_KEY = "ca_session_touch";
const TTL_MS = 90 * 24 * 60 * 60 * 1000; // 90 days — documented in docs/tracking/traffic-attribution.md

export interface TouchRecord extends Attribution {
  first_seen_at?: string;
  last_seen_at?: string;
}

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function readLocal(key: string): TouchRecord | null {
  if (typeof window === "undefined") return null;
  const record = safeParse<TouchRecord & { _storedAt?: number }>(window.localStorage.getItem(key));
  if (!record) return null;
  if (record._storedAt && Date.now() - record._storedAt > TTL_MS) {
    window.localStorage.removeItem(key);
    return null;
  }
  return record;
}

function writeLocal(key: string, record: TouchRecord) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify({ ...record, _storedAt: Date.now() }));
}

export function getFirstTouch(): TouchRecord | null {
  return readLocal(FIRST_TOUCH_KEY);
}

export function getLastTouch(): TouchRecord | null {
  return readLocal(LAST_TOUCH_KEY);
}

export function getSessionTouch(): TouchRecord | null {
  if (typeof window === "undefined") return null;
  return safeParse<TouchRecord>(window.sessionStorage.getItem(SESSION_TOUCH_KEY));
}

function parseTrackingParams(): Partial<Attribution> {
  if (typeof window === "undefined") return {};
  return extractAttributionFromSearchParams(new URLSearchParams(window.location.search));
}

// A touch only overwrites last-touch (and can seed first-touch) when it's
// "qualified" — a UTM, a Meta identifier, a click id, or an external
// referrer. Plain internal navigation between pages must never look like
// a new acquisition event.
function isQualifiedTouch(params: Partial<Attribution>): boolean {
  const hasParam = Object.values(params).some(Boolean);
  if (hasParam) return true;
  if (typeof document === "undefined") return false;
  const referrer = document.referrer;
  if (!referrer) return false;
  try {
    return new URL(referrer).hostname !== window.location.hostname;
  } catch {
    return false;
  }
}

// Call once on app mount (see <TrackingProvider />). Idempotent per
// qualified touch — safe to call on every page load.
export function captureAttribution(): void {
  if (typeof window === "undefined") return;

  const params = parseTrackingParams();
  const qualified = isQualifiedTouch(params);
  const now = new Date().toISOString();
  const landingPage = window.location.pathname + window.location.search;
  const referrer = document.referrer || undefined;

  // Session touch: always reflects the current visit's context, whatever
  // it is (qualified or not) — the embed/CTA needs "right now", not history.
  const sessionTouch: TouchRecord = {
    ...params,
    landing_page: landingPage,
    referrer,
    last_seen_at: now,
  };
  window.sessionStorage.setItem(SESSION_TOUCH_KEY, JSON.stringify(sessionTouch));

  if (!qualified) return;

  const record: TouchRecord = { ...params, landing_page: landingPage, referrer, last_seen_at: now };

  if (!getFirstTouch()) {
    writeLocal(FIRST_TOUCH_KEY, { ...record, first_seen_at: now });
  }
  writeLocal(LAST_TOUCH_KEY, record);
}

// The "current" attribution context injected into every tracked event and
// (later) into the Typebot embed — last touch if we have one qualified
// source recorded, falling back to first touch, then session touch.
export function getTrackingContext(): Record<string, string> {
  const touch = getLastTouch() ?? getFirstTouch() ?? getSessionTouch();
  if (!touch) return {};

  const context: Record<string, string> = {};
  for (const [key, value] of Object.entries(touch)) {
    if (typeof value === "string" && value && key !== "_storedAt") {
      context[key] = value;
    }
  }
  return context;
}

// Hidden Typebot variables — never shown to the visitor. Works whether
// the flow is embedded (pass as `prefilledVariables`) or, until the embed
// route exists, appended as query params on a redirect URL.
export function getTypebotPrefilledVariables(): Record<string, string> {
  const first = getFirstTouch();
  const context = getTrackingContext();
  return {
    ...context,
    ...(first?.first_seen_at ? { first_seen_at: first.first_seen_at } : {}),
  };
}
