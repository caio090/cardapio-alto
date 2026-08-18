import Image from "next/image";

const PRINCIPLES = [
  {
    title: "Venda antes de mídia",
    description:
      "O ponto de partida é o cardápio e o ticket médio — a mídia entra depois, com uma estrutura pronta para receber gente.",
  },
  {
    title: "Caminho completo",
    description:
      "Instagram, link, cardápio digital, WhatsApp e produto são tratados como uma coisa só, não como frentes separadas.",
  },
  {
    title: "Adaptado à operação",
    description:
      "Hamburgueria, pizzaria, açaí ou marmitaria: o plano parte de como o seu delivery vende hoje, não de um modelo pronto.",
  },
];

export function Positioning() {
  return (
    <section id="sobre" className="bg-navy py-20 sm:py-28">
      <div className="mx-auto grid max-w-6xl gap-14 px-6 sm:px-8 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-20">
        <div>
          <h2 className="text-[clamp(1.85rem,3.4vw,2.75rem)] font-black leading-tight text-heading">
            Por que Cardápio Alto.
          </h2>

          <div className="mt-10 space-y-8">
            {PRINCIPLES.map((principle) => (
              <div key={principle.title}>
                <h3 className="text-lg font-bold uppercase tracking-wide text-white/90">
                  {principle.title}
                </h3>
                <p className="mt-2 max-w-md text-base leading-relaxed text-navy-muted">
                  {principle.description}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-10 border-t border-navy-border pt-6 text-base font-medium text-heading">
            Nascido em Floriano. Feito perto da realidade de quem vende no
            Piauí.
          </p>
        </div>

        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
          <Image
            src="/images/ingredientes.jpg"
            alt="Ingredientes organizados sobre tábua de carvalho — a operação real por trás do cardápio"
            fill
            sizes="(min-width: 1024px) 40vw, 90vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
