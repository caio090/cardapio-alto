const AREAS = [
  {
    number: "01",
    name: "Cardápio",
    description: "Produtos, preços, categorias e destaques.",
  },
  {
    number: "02",
    name: "Conteúdo",
    description: "Como o negócio aparece e cria desejo.",
  },
  {
    number: "03",
    name: "Aquisição",
    description: "Como novas pessoas descobrem o negócio.",
  },
  {
    number: "04",
    name: "Conversão",
    description: "O que acontece até o pedido acontecer.",
  },
];

export function AnalysisPillars() {
  return (
    <section id="o-que-analisamos" className="bg-cream py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <h2 className="max-w-xl text-[clamp(1.85rem,3.4vw,2.75rem)] font-black leading-tight text-heading-dark">
          O que analisamos.
        </h2>

        <div className="mt-16 grid gap-x-12 gap-y-14 sm:grid-cols-2">
          {AREAS.map((area, i) => (
            <div
              key={area.number}
              className={i % 2 === 1 ? "sm:mt-16 sm:text-right" : undefined}
            >
              <span className="font-display text-sm font-semibold text-bg-deep">
                {area.number}
              </span>
              <h3 className="mt-2 text-3xl font-black text-heading-dark sm:text-4xl">
                {area.name}
              </h3>
              <p
                className={`mt-3 max-w-[22ch] text-base leading-relaxed text-[#1a1206]/60 ${
                  i % 2 === 1 ? "sm:ml-auto" : ""
                }`}
              >
                {area.description}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-16 max-w-md text-sm text-[#1a1206]/50">
          Uma futura quinta área, dados e recorrência, ainda está em
          preparação.
        </p>
      </div>
    </section>
  );
}
