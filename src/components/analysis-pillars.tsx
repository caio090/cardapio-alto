const AREAS = [
  {
    course: "I",
    name: "Cardápio",
    description:
      "Como produtos, preços, categorias, imagens e destaques estão apresentados.",
  },
  {
    course: "II",
    name: "Conteúdo",
    description:
      "Como o negócio aparece e cria desejo no ambiente digital.",
  },
  {
    course: "III",
    name: "Aquisição",
    description:
      "Como novas pessoas descobrem o estabelecimento.",
  },
  {
    course: "IV",
    name: "Conversão",
    description:
      "O que acontece entre descobrir o negócio e realmente fazer um pedido.",
  },
];

export function AnalysisPillars() {
  return (
    <section id="o-que-analisamos" className="border-t border-border bg-bg py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <h2 className="text-[clamp(2rem,4vw,3.25rem)] font-black leading-tight text-heading">
              O que analisamos.
            </h2>
            <p className="mt-6 max-w-sm text-base leading-relaxed text-muted">
              Quatro áreas de uma mesma estrutura — não uma lista de
              serviços soltos de agência. Uma futura quinta área, dados e
              recorrência, ainda está em preparação.
            </p>
          </div>

          <ul className="divide-y divide-border border-y border-border">
            {AREAS.map((area) => (
              <li
                key={area.course}
                className="group grid grid-cols-[3rem_1fr] gap-x-6 gap-y-2 py-8 sm:grid-cols-[4rem_1fr]"
              >
                <span className="font-display text-sm font-medium text-ink-accent">
                  {area.course}
                </span>
                <div>
                  <h3 className="text-xl font-bold text-heading sm:text-2xl">
                    {area.name}
                  </h3>
                  <p className="mt-2 max-w-xl text-base leading-relaxed text-muted">
                    {area.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
