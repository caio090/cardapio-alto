"use client";

import { useEffect } from "react";
import { CA_EVENTS, trackEvent } from "@/lib/tracking/events";
import type { Product } from "@/lib/products/types";

// Mounted once per product landing page. Mirrors <TrackingProvider />'s
// mount-effect pattern, scoped to a single product_view event instead of
// the site-wide page_view.
export function ProductViewTracker({ product }: { product: Product }) {
  useEffect(() => {
    trackEvent(CA_EVENTS.PRODUCT_VIEW, { product_slug: product.slug });
  }, [product.slug]);

  return null;
}
