"use client";

import Link from "next/link";
import { DIAGNOSTIC_HREF, DIAGNOSTIC_IS_EXTERNAL } from "@/lib/cta";
import { CA_EVENTS, trackEvent } from "@/lib/tracking/events";

type Variant = "primary" | "secondary";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "rounded-full bg-primary px-7 py-3.5 text-base font-medium text-on-fill transition-transform hover:scale-[1.03]",
  secondary:
    "rounded-full border border-border px-7 py-3.5 text-base font-medium text-ink transition-colors hover:border-primary",
};

// Único ponto de entrada para o diagnóstico. Toda seção da landing usa este
// componente em vez de conhecer a rota ou o Typebot diretamente — trocar o
// destino (popup, drawer, rota interna) no futuro é uma mudança em src/lib/cta.ts.
// "use client" (and the internal tracking call) is required here — it's
// rendered from Server Component sections, and a Server Component can't
// hand a plain closure to next/link's onClick.
export function DiagnosticCTA({
  children,
  variant = "primary",
  className,
  location,
  onClick,
}: {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
  location?: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href={DIAGNOSTIC_HREF}
      target={DIAGNOSTIC_IS_EXTERNAL ? "_blank" : undefined}
      rel={DIAGNOSTIC_IS_EXTERNAL ? "noopener noreferrer" : undefined}
      className={className ?? VARIANT_CLASSES[variant]}
      onClick={() => {
        trackEvent(CA_EVENTS.ANALYSIS_CTA_CLICK, { cta_location: location ?? "unspecified" });
        onClick?.();
      }}
    >
      {children}
    </Link>
  );
}
