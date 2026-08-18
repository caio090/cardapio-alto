import { DiagnosticCTA } from "./diagnostic-cta";

export function Diagnostic() {
  return (
    <section className="bg-bg py-16 sm:py-20">
      <div className="mx-auto max-w-2xl px-6 text-center sm:px-8">
        <h2 className="text-[clamp(1.75rem,4vw,2.75rem)] font-black leading-tight text-heading">
          Antes de sugerir, a gente precisa entender.
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-muted">
          O diagnóstico coleta informações sobre o negócio, presença
          digital, cardápio e vendas para orientar a primeira análise.
        </p>

        <div className="mt-8">
          <DiagnosticCTA>Começar diagnóstico</DiagnosticCTA>
        </div>
      </div>
    </section>
  );
}
