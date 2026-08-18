const PROBLEMS = [
  "Cardápio difícil de entender.",
  "Produto bom mal apresentado.",
  "Instagram bonito que não leva ao pedido.",
  "Promoção feita sem estratégia.",
  "Pouca valorização dos produtos principais.",
  "Cliente chega ao perfil e não sabe o que pedir.",
  "Campanhas sem acompanhamento.",
  "Falta de organização do caminho entre anúncio, perfil, cardápio e pedido.",
];

export function Problem() {
  return (
    <section className="border-t border-border bg-bg py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <div className="max-w-2xl">
          <h2 className="text-[clamp(2rem,4vw,3.25rem)] font-black leading-tight text-heading">
            A comida pode ser boa. O problema pode estar em todo o resto.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-muted sm:text-lg">
            Muitos negócios de alimentação já vendem todos os dias, mas
            deixam dinheiro pelo caminho por causa de detalhes fora da
            cozinha.
          </p>
        </div>

        <div className="mt-16 grid gap-x-12 gap-y-8 sm:grid-cols-2">
          {PROBLEMS.map((problem) => (
            <div key={problem} className="flex gap-4 border-t border-border pt-6">
              <span aria-hidden className="mt-1 text-2xl font-bold leading-none text-ink-accent">
                ×
              </span>
              <p className="text-base font-medium leading-relaxed text-ink sm:text-lg">
                {problem}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
