import Image from "next/image";
import Link from "next/link";
import { DiagnosticCTA } from "./diagnostic-cta";

export function Hero() {
  return (
    <section id="top" className="relative flex min-h-[100svh] items-end overflow-hidden">
      <Image
        src="/images/hero-burger.jpg"
        alt="Hambúrguer artesanal em close, fundo escuro — o produto como protagonista do pedido"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-bg via-bg/75 to-bg/20"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-bg/70 via-transparent to-transparent"
      />

      <div className="relative mx-auto w-full max-w-6xl px-6 pb-20 pt-40 sm:px-8 sm:pb-28">
        <div className="animate-rise max-w-3xl">
          <p className="text-base font-medium text-ink-accent">
            Estratégia para negócios de alimentação no Piauí
          </p>
          <h1 className="mt-3 text-[clamp(2.5rem,6.5vw,4.75rem)] font-black leading-[0.98] text-heading">
            Seu negócio pode estar vendendo menos do que poderia.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted sm:text-xl">
            Analisamos cardápio, conteúdo, presença digital e caminho de
            compra para encontrar onde seu restaurante ou delivery pode
            melhorar.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <DiagnosticCTA>Fazer meu diagnóstico</DiagnosticCTA>
            <Link
              href="#metodo"
              className="rounded-full border border-border px-7 py-3.5 text-base font-medium text-ink transition-colors hover:border-primary"
            >
              Entender como funciona
            </Link>
          </div>
          <p className="mt-4 text-sm text-muted">
            Diagnóstico inicial rápido e direto.
          </p>
        </div>
      </div>
    </section>
  );
}
