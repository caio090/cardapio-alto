const STEPS = ["Instagram", "Link", "Cardápio", "Produto", "Combo / adicional", "Pedido"];

export function BuyingPath() {
  return (
    <section className="bg-navy py-20 sm:py-28">
      <div className="mx-auto grid max-w-6xl gap-14 px-6 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-20">
        <div>
          <h2 className="text-[clamp(1.85rem,3.4vw,2.75rem)] font-black leading-tight text-heading">
            O pedido começa antes do cliente abrir o cardápio.
          </h2>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-navy-muted sm:text-lg">
            Cada etapa pode facilitar a compra, aumentar o valor do pedido ou
            fazer o cliente desistir. O Cardápio Alto analisa e organiza
            esse caminho como uma estrutura única.
          </p>
        </div>

        {/* The path itself, drawn — not a stock photo of a phone. */}
        <ol className="relative flex flex-col gap-0">
          {STEPS.map((step, i) => (
            <li key={step} className="relative flex items-center gap-5 py-3.5">
              {i < STEPS.length - 1 && (
                <span
                  aria-hidden
                  className="absolute left-[11px] top-[calc(50%+14px)] h-[calc(100%-14px)] w-px bg-navy-border"
                />
              )}
              <span
                aria-hidden
                className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-bg-deep text-xs font-bold text-white"
              >
                {i + 1}
              </span>
              <span className="text-lg font-semibold text-heading sm:text-xl">{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
