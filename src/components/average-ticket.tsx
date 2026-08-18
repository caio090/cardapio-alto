export function AverageTicket() {
  return (
    <section className="border-t border-border bg-bg py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <div className="max-w-2xl">
          <h2 className="text-[clamp(2rem,4vw,3.25rem)] font-black leading-tight text-heading">
            Mais faturamento sem depender apenas de mais pedidos.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-muted sm:text-lg">
            Ticket médio é quanto, em média, cada cliente gasta por pedido.
            Subir esse número muda o resultado do mês sem precisar vender
            para mais gente.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-surface p-8">
            <p className="text-sm text-muted">Ticket médio atual</p>
            <p className="mt-2 text-4xl font-black text-ink">R$38</p>
            <p className="mt-4 text-base text-muted">
              100 pedidos × R$38 = <span className="text-ink">R$3.800</span>
            </p>
          </div>
          <div className="rounded-2xl border border-primary/50 bg-surface p-8">
            <p className="text-sm text-muted">Ticket médio com estrutura</p>
            <p className="mt-2 text-4xl font-black text-ink-accent">R$48</p>
            <p className="mt-4 text-base text-muted">
              100 pedidos × R$48 = <span className="text-ink">R$4.800</span>
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-baseline gap-3 rounded-2xl bg-surface-2 px-8 py-6">
          <span className="text-sm text-muted">Diferença no mesmo volume de pedidos:</span>
          <span className="text-2xl font-bold text-ink-accent">R$1.000</span>
        </div>

        <p className="mt-6 max-w-xl text-sm text-muted">
          Esse cálculo é apenas uma demonstração matemática do impacto do
          ticket médio — não é o faturamento de um cliente real.
        </p>
      </div>
    </section>
  );
}
