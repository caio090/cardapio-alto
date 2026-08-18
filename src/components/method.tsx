import Image from "next/image";

const STEPS = [
  {
    number: "01",
    title: "Diagnosticar",
    description:
      "Entendemos como o delivery vende hoje, onde o cliente entra e onde existem oportunidades.",
  },
  {
    number: "02",
    title: "Estruturar",
    description:
      "Organizamos cardápio, ofertas, apresentação e caminho de compra.",
  },
  {
    number: "03",
    title: "Atrair",
    description:
      "Depois da estrutura mínima pronta, usamos conteúdo e tráfego para colocar mais clientes nesse caminho.",
  },
];

export function Method() {
  return (
    <section id="metodo" className="border-t border-border bg-surface py-24 sm:py-32">
      <div className="mx-auto grid max-w-6xl gap-16 px-6 sm:px-8 lg:grid-cols-2 lg:items-center lg:gap-24">
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl lg:order-2">
          <Image
            src="/images/ingredientes.jpg"
            alt="Ingredientes organizados sobre tábua de carvalho — a estrutura antes da venda"
            fill
            sizes="(min-width: 1024px) 40vw, 90vw"
            className="object-cover"
          />
        </div>

        <div className="lg:order-1">
          <h2 className="text-[clamp(2rem,4vw,3.25rem)] font-black leading-tight text-heading">
            Primeiro arrumamos a casa. Depois trazemos mais gente.
          </h2>
          <p className="mt-5 max-w-md text-base leading-relaxed text-muted">
            Estrutura primeiro, aquisição depois — nessa ordem, cardápio,
            apresentação e tráfego puxam para o mesmo lado.
          </p>

          <ol className="mt-12 space-y-10">
            {STEPS.map((step) => (
              <li key={step.number} className="flex gap-6">
                <span className="font-display shrink-0 text-2xl font-bold text-ink-accent">
                  {step.number}
                </span>
                <div>
                  <h3 className="text-lg font-bold text-ink">{step.title}</h3>
                  <p className="mt-1.5 max-w-md text-base leading-relaxed text-muted">
                    {step.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
