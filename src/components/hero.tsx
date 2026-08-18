import Image from "next/image";
import Link from "next/link";
import { whatsappHref } from "@/lib/contact";

export function Hero() {
  return (
    <section id="top" className="relative flex min-h-[100svh] items-end overflow-hidden">
      <Image
        src="/images/hero-salao.jpg"
        alt="Salão de um restaurante em madeira escura e latão, luzes baixas sobre as mesas vazias antes do serviço"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-bg via-bg/70 to-bg/10"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-bg/60 via-transparent to-transparent"
      />

      <div className="relative mx-auto w-full max-w-6xl px-6 pb-20 pt-40 sm:px-8 sm:pb-28">
        <div className="animate-rise max-w-3xl">
          <h1 className="text-[clamp(2.75rem,7vw,5.5rem)] font-black leading-[0.95] text-ink">
            Seu delivery,
            <br />
            no padrão <span className="text-primary">Alto</span>.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted sm:text-xl">
            Assessoria completa para restaurantes que querem vender mais no
            delivery: cardápio reengenhado, fotos que convertem, tráfego
            pago com retorno e a marca lembrada na hora de pedir de novo.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href={whatsappHref("Olá! Quero fazer um diagnóstico com a Cárdapio Alto.")}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-primary px-7 py-3.5 text-base font-medium text-on-fill transition-transform hover:scale-[1.03]"
            >
              Agendar diagnóstico
            </Link>
            <Link
              href="#servicos"
              className="rounded-full border border-border px-7 py-3.5 text-base font-medium text-ink transition-colors hover:border-primary hover:text-primary"
            >
              Ver serviços
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
