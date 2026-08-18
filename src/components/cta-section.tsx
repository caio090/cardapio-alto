import { DiagnosticCTA } from "./diagnostic-cta";

export function CtaSection() {
  return (
    <section className="bg-navy py-20 sm:py-24">
      <div className="mx-auto max-w-2xl px-6 text-center sm:px-8">
        <h2 className="text-[clamp(1.85rem,4vw,3rem)] font-black leading-tight text-heading">
          Quanto o seu negócio pode estar deixando na mesa?
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-navy-muted sm:text-lg">
          O primeiro passo é entender onde seu delivery pode vender melhor.
        </p>

        <div className="mt-8">
          <DiagnosticCTA>Fazer meu diagnóstico</DiagnosticCTA>
        </div>
      </div>
    </section>
  );
}
