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
    <section className="bg-bg py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <h2 className="max-w-2xl text-[clamp(1.85rem,3.4vw,2.75rem)] font-black leading-tight text-heading">
          A comida pode ser boa. O problema pode estar em todo o resto.
        </h2>

        <div className="mt-14 grid gap-x-16 gap-y-7 sm:grid-cols-2">
          {PROBLEMS.map((problem) => (
            <p key={problem} className="text-lg font-bold leading-snug text-heading sm:text-xl">
              {problem}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
