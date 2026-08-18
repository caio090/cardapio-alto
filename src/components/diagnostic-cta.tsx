import Link from "next/link";
import { DIAGNOSTIC_ROUTE } from "@/lib/cta";

type Variant = "primary" | "secondary";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "rounded-full bg-primary px-7 py-3.5 text-base font-medium text-on-fill transition-transform hover:scale-[1.03]",
  secondary:
    "rounded-full border border-border px-7 py-3.5 text-base font-medium text-ink transition-colors hover:border-primary",
};

// Único ponto de entrada para o diagnóstico. Toda seção da landing usa este
// componente em vez de conhecer a rota ou o Typebot diretamente — trocar o
// destino (popup, drawer, outro fluxo) no futuro é uma mudança neste arquivo.
export function DiagnosticCTA({
  children,
  variant = "primary",
  className,
  onClick,
}: {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <Link href={DIAGNOSTIC_ROUTE} className={className ?? VARIANT_CLASSES[variant]} onClick={onClick}>
      {children}
    </Link>
  );
}
