import Image from "next/image";

const PRINCIPLES = [
  {
    title: "Olhamos para venda antes de mídia",
    description:
      "O ponto de partida é o cardápio e o ticket médio — a mídia entra depois, com uma estrutura pronta para receber gente.",
  },
  {
    title: "Vemos o caminho completo do pedido",
    description:
      "Instagram, link, cardápio digital, WhatsApp e produto são tratados como uma coisa só, não como frentes separadas.",
  },
  {
    title: "Estrutura adaptada à sua operação",
    description:
      "Hamburgueria, pizzaria, açaí ou marmitaria: o plano parte de como o seu delivery vende hoje, não de um modelo pronto.",
  },
];

export function Positioning() {
  return (
    <section id="sobre" className="border-t border-border bg-bg py-24 sm:py-32">
      <div className="mx-auto grid max-w-6xl gap-16 px-6 sm:px-8 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-24">
        <div>
          <h2 className="text-[clamp(2rem,4vw,3.25rem)] font-black leading-tight text-heading">
            Por que Cardápio
            <br />
            Alto.
          </h2>

          <ul className="mt-10 space-y-8">
            {PRINCIPLES.map((principle) => (
              <li key={principle.title} className="border-t border-border pt-6">
                <h3 className="text-lg font-bold text-ink">{principle.title}</h3>
                <p className="mt-2 max-w-md text-base leading-relaxed text-muted">
                  {principle.description}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
          <Image
            src="/images/fries-dark.jpg"
            alt="Porção de batata frita em cesto, fundo escuro — um adicional simples que muda o ticket médio"
            fill
            sizes="(min-width: 1024px) 40vw, 90vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
