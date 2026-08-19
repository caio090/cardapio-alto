import type { Metadata } from "next";
import { cabinetGrotesk } from "@/fonts";
import { TrackingProvider } from "@/components/tracking-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cardápio Alto | Assessoria para Delivery e Aumento de Ticket Médio",
  description:
    "Assessoria para restaurantes e delivery focada em ticket médio, cardápio, caminho de compra, conteúdo e tráfego.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      data-scroll-behavior="smooth"
      className={`${cabinetGrotesk.variable} h-full`}
    >
      <body className="min-h-full bg-bg text-ink antialiased">
        <TrackingProvider />
        {children}
      </body>
    </html>
  );
}
