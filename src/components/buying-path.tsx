import Image from "next/image";

const STEPS = ["Instagram", "Link", "Cardápio", "Produto", "Combo / adicional", "Pedido"];

export function BuyingPath() {
  return (
    <section className="border-t border-border bg-surface py-24 sm:py-32">
      <div className="mx-auto grid max-w-6xl gap-16 px-6 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-20">
        <div>
          <h2 className="text-[clamp(2rem,4vw,3.25rem)] font-black leading-tight text-heading">
            O pedido começa antes do cliente abrir o cardápio.
          </h2>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-muted sm:text-lg">
            Cada etapa pode facilitar a compra, aumentar o valor do pedido ou
            fazer o cliente desistir. O Cardápio Alto analisa e organiza
            esse caminho como uma estrutura única.
          </p>

          <ol className="mt-12 flex flex-wrap items-center gap-x-2 gap-y-4">
            {STEPS.map((step, i) => (
              <li key={step} className="flex items-center gap-2">
                <span className="rounded-full border border-border bg-bg px-4 py-2 text-sm font-medium text-ink sm:text-base">
                  {step}
                </span>
                {i < STEPS.length - 1 && (
                  <span aria-hidden className="text-ink-accent">
                    →
                  </span>
                )}
              </li>
            ))}
          </ol>
        </div>

        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
          <Image
            src="/images/phone-caminho.jpg"
            alt="Tela de celular com Instagram entre os aplicativos — o pedido começa no digital, antes do cardápio"
            fill
            sizes="(min-width: 1024px) 40vw, 90vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
