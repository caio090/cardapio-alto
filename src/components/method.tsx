import Image from "next/image";

const STEPS = [
  {
    number: "01",
    title: "Diagnóstico",
    description:
      "Analisamos cardápio, fotos, anúncios e histórico de pedidos para mapear exatamente onde o dinheiro está ficando na mesa.",
  },
  {
    number: "02",
    title: "Intervenção",
    description:
      "Reescrevemos o cardápio, refazemos as fotos e colocamos o tráfego pago no ar — tudo alinhado à mesma estratégia.",
  },
  {
    number: "03",
    title: "Acompanhamento",
    description:
      "Medimos ticket médio, recorrência e retorno sobre anúncio mês a mês, ajustando o que não estiver performando.",
  },
];

export function Method() {
  return (
    <section id="metodo" className="border-t border-border bg-surface py-24 sm:py-32">
      <div className="mx-auto grid max-w-6xl gap-16 px-6 sm:px-8 lg:grid-cols-2 lg:items-center lg:gap-24">
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl lg:order-2">
          <Image
            src="/images/ingredientes.jpg"
            alt="Ingredientes organizados sobre tábua de carvalho — inspeção antes de reengenhar o prato"
            fill
            sizes="(min-width: 1024px) 40vw, 90vw"
            className="object-cover"
          />
        </div>

        <div className="lg:order-1">
          <h2 className="text-[clamp(2rem,4vw,3.25rem)] font-black leading-tight text-ink">
            Método, não palpite.
          </h2>
          <p className="mt-5 max-w-md text-base leading-relaxed text-muted">
            Cada frente de serviço entra numa ordem específica. É assim que
            garantimos que cardápio, imagem e tráfego puxam para o mesmo
            lado.
          </p>

          <ol className="mt-12 space-y-10">
            {STEPS.map((step) => (
              <li key={step.number} className="flex gap-6">
                <span className="font-display shrink-0 text-2xl font-bold text-primary">
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
