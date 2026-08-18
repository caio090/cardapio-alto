"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "./logo";
import { DiagnosticCTA } from "./diagnostic-cta";

const NAV = [
  { href: "#metodo", label: "Como funciona" },
  { href: "#o-que-analisamos", label: "O que analisamos" },
  { href: "#para-quem-e", label: "Para quem é" },
  { href: "#resultado", label: "Resultados" },
  { href: "#sobre", label: "Sobre" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5 sm:px-8">
        <Link href="#top" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <Logo size={36} />
          <span className="text-base font-bold tracking-tight text-ink">
            Cardápio <span className="text-ink-accent">Alto</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
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

        <div className="hidden items-center gap-4 md:flex">
          <Link href="/entrar" className="text-sm font-medium text-ink transition-colors hover:text-ink-accent">
            Entrar
          </Link>
          <DiagnosticCTA
            className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-on-fill transition-transform hover:scale-[1.03]"
          >
            Fazer diagnóstico
          </DiagnosticCTA>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-border text-ink md:hidden"
        >
          <span className="sr-only">{open ? "Fechar menu" : "Abrir menu"}</span>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            {open ? (
              <path d="M4 4L16 16M16 4L4 16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            ) : (
              <path d="M2.5 5.5H17.5M2.5 10H17.5M2.5 14.5H17.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div id="mobile-menu" className="border-t border-border bg-bg px-6 py-6 md:hidden">
          <nav className="flex flex-col gap-5">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="text-base font-medium text-ink"
              >
                {item.label}
              </Link>
            ))}
            <Link href="/entrar" onClick={() => setOpen(false)} className="text-base font-medium text-ink">
              Entrar
            </Link>
            <DiagnosticCTA
              className="mt-2 rounded-full bg-primary px-5 py-3 text-center text-sm font-medium text-on-fill"
              onClick={() => setOpen(false)}
            >
              Fazer diagnóstico
            </DiagnosticCTA>
          </nav>
        </div>
      )}
    </header>
  );
}
