import Link from "next/link";
import { whatsappHref } from "@/lib/contact";

const NAV = [
  { href: "#servicos", label: "Serviços" },
  { href: "#metodo", label: "Método" },
  { href: "#contato", label: "Contato" },
];

export function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-bg/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 sm:px-8">
        <Link href="#top" className="text-lg font-bold tracking-tight text-ink">
          Cárdapio <span className="text-primary">Alto</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-muted transition-colors hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href={whatsappHref("Olá! Quero saber mais sobre a Cárdapio Alto.")}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-on-fill transition-transform hover:scale-[1.03]"
        >
          Falar com a gente
        </Link>
      </div>
    </header>
  );
}
