"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FullLogo } from "./logo";
import { DiagnosticCTA } from "./diagnostic-cta";

const NAV = [
  { href: "#metodo", label: "Como funciona" },
  { href: "#o-que-analisamos", label: "O que analisamos" },
  { href: "#para-quem-e", label: "Para quem é" },
  { href: "#sobre", label: "Sobre" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Header sits directly over the hero's light gradient at the top of the
  // page (integrated, per brief), then picks up the site's orange scrim
  // once scrolled past it — text stays dark throughout either way, so
  // only the backdrop tint needs to change.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b backdrop-blur-md transition-colors duration-300 ${
        scrolled ? "border-border/60 bg-bg/80" : "border-black/5 bg-[#FDFAF5]/60"
      }`}
    >
      <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-3.5 sm:px-8 lg:px-16">
        <Link href="#top" onClick={() => setOpen(false)}>
          <FullLogo height={44} />
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-[#1a1206]/70 transition-colors hover:text-[#1a1206]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <Link href="/entrar" className="text-sm font-medium text-[#1a1206] transition-colors hover:text-bg-deep">
            Entrar
          </Link>
          <DiagnosticCTA className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-bg-deep">
            Fazer diagnóstico
          </DiagnosticCTA>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-black/10 text-[#1a1206] md:hidden"
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
        <div id="mobile-menu" className="border-t border-black/10 bg-[#FDFAF5] px-6 py-6 md:hidden">
          <nav className="flex flex-col gap-5">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="text-base font-medium text-[#1a1206]"
              >
                {item.label}
              </Link>
            ))}
            <Link href="/entrar" onClick={() => setOpen(false)} className="text-base font-medium text-[#1a1206]">
              Entrar
            </Link>
            <DiagnosticCTA
              className="mt-2 rounded-full bg-black px-5 py-3 text-center text-sm font-medium text-white"
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
