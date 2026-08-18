const WORKED_ON = [
  "Organização do cardápio",
  "Estrutura de ofertas e combos",
  "Apresentação dos produtos",
  "Caminho de compra",
];

export function Ticket() {
  return (
    <section id="resultado" className="bg-bg py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <p className="text-sm font-medium text-muted">Resultado real</p>

        <h2 className="mt-3 text-[clamp(2.25rem,6vw,4.25rem)] font-black leading-none text-heading">
          De <span className="text-muted line-through decoration-2">R$38</span>{" "}
          para <span className="text-ink-accent">R$48</span>
        </h2>
        <p className="mt-2 text-lg text-muted">de ticket médio.</p>

        <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink sm:text-lg">
          Subir o ticket médio muda o resultado do mês sem depender de mais
          pedidos. Um dos trabalhos que originaram o Cardápio Alto mostrou
          isso na prática.
        </p>

        <div className="mt-12 grid gap-px overflow-hidden rounded-2xl bg-black/10 sm:grid-cols-3">
          <div className="bg-bg px-6 py-6">
            <p className="text-sm text-muted">100 pedidos × R$38</p>
            <p className="mt-1 text-2xl font-black text-heading">R$3.800</p>
          </div>
          <div className="bg-bg px-6 py-6">
            <p className="text-sm text-muted">100 pedidos × R$48</p>
            <p className="mt-1 text-2xl font-black text-heading">R$4.800</p>
          </div>
          <div className="bg-black/15 px-6 py-6">
            <p className="text-sm text-muted">Diferença</p>
            <p className="mt-1 text-2xl font-black text-ink-accent">R$1.000</p>
          </div>
        </div>

        <p className="mt-5 max-w-xl text-sm text-muted">
          Demonstração matemática do impacto do ticket médio — não é o
          faturamento garantido de um cliente real.
        </p>

        <div className="mt-10 flex flex-wrap gap-2.5">
          {WORKED_ON.map((item) => (
            <span
              key={item}
              className="rounded-full border border-black/15 px-4 py-1.5 text-sm text-ink"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
