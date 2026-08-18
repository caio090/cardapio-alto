import { DiagnosticCTA } from "./diagnostic-cta";

export function Diagnostic() {
  return (
    <section className="border-t border-border bg-surface py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-6 text-center sm:px-8">
        <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-black leading-tight text-heading">
          Antes de sugerir, a gente precisa entender.
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
          O diagnóstico do Cardápio Alto coleta informações sobre o negócio,
          presença digital, cardápio, vendas e principais dificuldades para
          orientar a primeira análise.
        </p>

        <div className="mt-10">
          <DiagnosticCTA>Começar diagnóstico</DiagnosticCTA>
        </div>
      </div>
    </section>
  );
}
