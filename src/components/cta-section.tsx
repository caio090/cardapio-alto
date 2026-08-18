import Image from "next/image";
import Link from "next/link";
import { whatsappHref } from "@/lib/contact";

export function CtaSection() {
  return (
    <section id="contato" className="relative overflow-hidden border-t border-border py-28 sm:py-36">
      <Image
        src="/images/vitrine-noite.jpg"
        alt="Vitrine de restaurante à noite, letreiro luminoso sobre o salão iluminado"
        fill
        sizes="100vw"
        className="object-cover object-center"
      />
      <div aria-hidden className="absolute inset-0 bg-bg/85" />

      <div className="relative mx-auto max-w-3xl px-6 text-center sm:px-8">
        <h2 className="text-[clamp(2.25rem,5vw,4rem)] font-black leading-tight text-ink">
          Vamos elevar o seu delivery?
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted">
          Conte pra gente como está o seu cardápio hoje e a gente devolve um
          diagnóstico real, sem enrolação.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href={whatsappHref("Olá! Quero fazer um diagnóstico com a Cárdapio Alto.")}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-primary px-8 py-4 text-base font-medium text-on-fill transition-transform hover:scale-[1.03]"
          >
            Chamar no WhatsApp
          </Link>
        </div>
      </div>
    </section>
  );
}
