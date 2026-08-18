import type { Metadata } from "next";
import { cabinetGrotesk } from "@/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cárdapio Alto — Assessoria de Delivery",
  description:
    "Engenharia de cardápio, fotografia, tráfego pago, ativação de marca e remarketing para restaurantes que querem vender mais no delivery.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      data-scroll-behavior="smooth"
      className={`${cabinetGrotesk.variable} h-full`}
    >
      <body className="min-h-full bg-bg text-ink antialiased">{children}</body>
    </html>
  );
}
