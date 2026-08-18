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
  meta_campaign_id?: string;
  meta_adset_id?: string;
  meta_ad_id?: string;
  placement?: string;
  landing_page?: string;
  referrer?: string;
}

const DIRECT_PARAM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "gclid",
  "fbclid",
  "placement",
] as const;

// Meta Ads URL template params can arrive either as the short names
// (campaign_id/adset_id/ad_id) or already prefixed (meta_campaign_id/...);
// both normalize to the same meta_-prefixed field so the rest of the app
// only ever deals with one shape.
const META_ID_ALIASES: Record<string, "meta_campaign_id" | "meta_adset_id" | "meta_ad_id"> = {
  campaign_id: "meta_campaign_id",
  adset_id: "meta_adset_id",
  ad_id: "meta_ad_id",
  meta_campaign_id: "meta_campaign_id",
  meta_adset_id: "meta_adset_id",
  meta_ad_id: "meta_ad_id",
};

export function extractAttributionFromSearchParams(
  searchParams: URLSearchParams
): Partial<Attribution> {
  const attribution: Partial<Attribution> = {};

  for (const key of DIRECT_PARAM_KEYS) {
    const value = searchParams.get(key);
    if (value) attribution[key] = value;
  }

  for (const [param, field] of Object.entries(META_ID_ALIASES)) {
    if (attribution[field]) continue; // first match wins (meta_* takes priority if both present)
    const value = searchParams.get(param);
    if (value) attribution[field] = value;
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
