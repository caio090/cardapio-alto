"use client";

import { buildWhatsappUrl } from "@/lib/cta";
import { buildCheckoutUrlWithTracking } from "@/lib/tracking/checkout-url";
import { CA_EVENTS, trackEvent } from "@/lib/tracking/events";
import type { Product } from "@/lib/products/types";

const DEFAULT_CLASSES =
  "inline-block rounded-full bg-primary px-7 py-3.5 text-base font-medium text-on-fill transition-transform hover:scale-[1.03]";

// The purchase CTA for a product landing (hero + oferta blocks). Uses
// product.checkoutUrl once a real gateway is connected; while it's empty,
// falls back to a WhatsApp message specific to the product — never a dead
// link. See src/lib/products/repository.ts (checkoutUrl/whatsappMessage)
// for where those values live and get edited (admin panel).
export function ProductCheckoutCta({
  product,
  location,
  className,
}: {
  product: Product;
  location: string;
  className?: string;
}) {
  const hasCheckout = Boolean(product.checkoutUrl);
  const baseHref = hasCheckout
    ? (product.checkoutUrl as string)
    : buildWhatsappUrl(product.whatsappMessage || `Olá! Quero saber mais sobre o pack ${product.name}.`);
  const label = hasCheckout ? "Comprar agora" : "Solicitar este pack";

  return (
    <a
      href={baseHref}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(event) => {
        // utm_source/utm_medium/utm_campaign/utm_content/utm_term are
        // already merged into every tracked event by trackEvent() itself
        // (see src/lib/tracking/events.ts) — no need to repeat them here.
        trackEvent(hasCheckout ? CA_EVENTS.PRODUCT_PURCHASE_CLICK : CA_EVENTS.WHATSAPP_CLICK, {
          product_slug: product.slug,
          product_name: product.name,
          price: product.priceCents ?? undefined,
          checkout_provider: product.checkoutProvider ?? undefined,
          cta_location: location,
        });

        if (hasCheckout) {
          // UTMs/fbclid only exist in localStorage client-side, so the
          // enriched URL can't be the anchor's static href (would differ
          // from the server-rendered one). Computed here, at the moment of
          // click — inside the same user gesture, so window.open isn't
          // popup-blocked — instead of via an effect that would just be
          // recomputing derived state on every mount.
          event.preventDefault();
          window.open(buildCheckoutUrlWithTracking(baseHref), "_blank", "noopener,noreferrer");
        }
      }}
      className={className ?? DEFAULT_CLASSES}
    >
      {label}
    </a>
  );
}
