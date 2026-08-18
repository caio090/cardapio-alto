const WORKED_ON = [
  "Organização do cardápio",
  "Estrutura de ofertas e combos",
  "Apresentação dos produtos",
  "Caminho de compra",
];

export function CaseStudy() {
  return (
    <section id="resultado" className="border-t border-border bg-surface py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <p className="text-sm font-medium text-muted">Resultado real</p>

        <div className="mt-4 flex flex-wrap items-end gap-x-6 gap-y-2">
          <h2 className="text-[clamp(2.5rem,7vw,5rem)] font-black leading-none text-heading">
            De <span className="text-muted line-through decoration-2">R$38</span>{" "}
            para <span className="text-ink-accent">R$48</span>
          </h2>
        </div>
        <p className="mt-2 text-lg text-muted">de ticket médio.</p>

        <p className="mt-8 max-w-2xl text-base leading-relaxed text-ink sm:text-lg">
          Um dos trabalhos que originaram o Cardápio Alto mostrou na prática
          como ajustes na estrutura de venda podem mudar o valor de cada
          pedido.
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          {WORKED_ON.map((item) => (
            <span
              key={item}
              className="rounded-full border border-border bg-bg px-4 py-2 text-sm text-ink"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
