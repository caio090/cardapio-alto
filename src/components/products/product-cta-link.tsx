"use client";

import Link from "next/link";
import { CA_EVENTS, trackEvent } from "@/lib/tracking/events";
import type { Product } from "@/lib/products/types";

// Shared tracked link for product cards (Home section + /produtos listing).
// "use client" because it fires trackEvent on click and is rendered from
// Server Component sections — a Server Component can't hand next/link a
// plain closure for onClick.
export function ProductCtaLink({
  product,
  location,
  className,
  children,
}: {
  product: Product;
  location: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={`/produtos/${product.slug}`}
      onClick={() =>
        trackEvent(CA_EVENTS.PRODUCT_CTA_CLICK, {
          product_slug: product.slug,
          product_name: product.name,
          price: product.priceCents ?? undefined,
          checkout_provider: product.checkoutProvider ?? undefined,
          cta_location: location,
        })
      }
      className={className}
    >
      {children}
    </Link>
  );
}
