"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { captureAttribution } from "@/lib/tracking/attribution";
import { CA_EVENTS, trackEvent } from "@/lib/tracking/events";

// Mounted once in the root layout. Captures attribution and fires the
// page_view event — on first load, and again on any client-side App
// Router navigation, without double-firing on the initial render.
//
// Deliberately uses `usePathname()` only, not `useSearchParams()` — the
// latter forces Next to opt the route out of static rendering (requires
// a Suspense boundary), which would cost `/` its current static
// prerendering just for a tracking nicety. Query-only navigations (no
// pathname change) are the rare case and are an acceptable gap here.
export function TrackingProvider() {
  const pathname = usePathname();
  const hasFiredInitial = useRef(false);

  useEffect(() => {
    captureAttribution();

    if (!hasFiredInitial.current) {
      hasFiredInitial.current = true;
      trackEvent(CA_EVENTS.PAGE_VIEW);
      return;
    }

    trackEvent(CA_EVENTS.PAGE_VIEW);
  }, [pathname]);

  return null;
}
