import Link from "next/link";
import { Logo } from "./logo";
import { WHATSAPP_URL } from "@/lib/cta";

export function SiteFooter() {
  return (
    <footer className="border-t border-cream-border bg-cream py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 sm:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Logo size={28} />
              <p className="text-sm font-medium text-ink">
                Cardápio <span className="text-ink-accent">Alto</span>
              </p>
            </div>
            <p className="mt-3 max-w-xs text-sm text-muted">
              Estratégia digital para negócios de alimentação no Piauí.
            </p>
            <p className="mt-1 text-sm text-muted">Floriano, Piauí.</p>
          </div>

          <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-ink transition-colors hover:text-ink-accent"
            >
              WhatsApp
            </a>
            <Link href="/entrar" className="font-medium text-ink transition-colors hover:text-ink-accent">
              Entrar
            </Link>
            <Link
              href="/politica-de-privacidade"
              className="font-medium text-ink transition-colors hover:text-ink-accent"
            >
              Política de Privacidade
            </Link>
          </div>
        </div>

        <p className="text-sm text-muted">© {new Date().getFullYear()} Cardápio Alto</p>
      </div>
    </footer>
  );
}
