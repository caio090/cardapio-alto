import { getTrackingContext } from "./attribution";

// UTMs/fbclid a visitor arrived on a product page with need to survive the
// hop to Cakto's checkout, so Cakto's own webhook payload (utm_source etc,
// fbc) reflects the campaign that actually drove the sale. Only appends
// params that aren't already on the URL — an admin-configured checkoutUrl
// that already hardcodes a param (e.g. a fixed utm_source) always wins.
const PRESERVED_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "fbclid",
] as const;

export function buildCheckoutUrlWithTracking(baseUrl: string): string {
  let url: URL;
  try {
    url = new URL(baseUrl);
  } catch {
    return baseUrl; // not a valid absolute URL — hand it back untouched rather than throw
  }

  const context = getTrackingContext();

  for (const param of PRESERVED_PARAMS) {
    const value = context[param];
    if (value && !url.searchParams.has(param)) {
      url.searchParams.set(param, value);
    }
  }

  return url.toString();
}
