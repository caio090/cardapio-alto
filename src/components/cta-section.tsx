import { DiagnosticCTA } from "./diagnostic-cta";

export function CtaSection() {
  return (
    <section className="relative overflow-hidden border-t border-border bg-bg-deep py-28 sm:py-36">
      <div className="relative mx-auto max-w-3xl px-6 text-center sm:px-8">
        <h2 className="text-[clamp(2rem,4.5vw,3.5rem)] font-black leading-tight text-heading">
          Quanto o seu negócio pode estar deixando na mesa?
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted">
          O primeiro passo é entender onde seu delivery pode vender melhor.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <DiagnosticCTA>Fazer meu diagnóstico</DiagnosticCTA>
        </div>
        <p className="mt-4 text-sm text-muted">
          Comece respondendo algumas perguntas sobre o seu negócio.
        </p>
      </div>
    </section>
  );
}
