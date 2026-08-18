export const ATTRIBUTION_COOKIE = "ca_attribution";
export const ATTRIBUTION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

export interface Attribution {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  gclid?: string;
  fbclid?: string;
  landing_page?: string;
  referrer?: string;
}

const UTM_PARAM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "gclid",
  "fbclid",
] as const;

export function extractAttributionFromSearchParams(
  searchParams: URLSearchParams
): Partial<Attribution> {
  const attribution: Partial<Attribution> = {};
  for (const key of UTM_PARAM_KEYS) {
    const value = searchParams.get(key);
    if (value) attribution[key] = value;
  }
  return attribution;
}

export function parseAttributionCookie(raw: string | undefined): Attribution | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Attribution;
  } catch {
    return null;
  }
}
