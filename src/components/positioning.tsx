import Image from "next/image";

const PRINCIPLES = [
  {
    title: "Uma assessoria, uma estratégia",
    description:
      "Cardápio, foto, tráfego, marca e remarketing costumados por quem entende que um pedido perdido tem sempre a mesma causa raiz — e ela raramente é só uma dessas frentes.",
  },
  {
    title: "Delivery, não marketing genérico",
    description:
      "Falamos a língua de quem opera cozinha: ficha técnica, ticket médio, tempo de preparo, ruptura de estoque. O plano de mídia parte daí, não do funil de outro setor.",
  },
  {
    title: "Você acompanha cada número",
    description:
      "Relatório claro, sem jargão. Você sabe exatamente o que mudou no cardápio, quanto custou o anúncio e quantos pedidos vieram de volta.",
  },
];

export function Positioning() {
  return (
    <section className="border-t border-border bg-bg py-24 sm:py-32">
      <div className="mx-auto grid max-w-6xl gap-16 px-6 sm:px-8 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-24">
        <div>
          <h2 className="text-[clamp(2rem,4vw,3.25rem)] font-black leading-tight text-ink">
            Por que Cárdapio
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
            src="/images/prato-montado.jpg"
            alt="Prato montado sob luz de vela, taças de espumante ao fundo, pronto para o clique"
            fill
            sizes="(min-width: 1024px) 40vw, 90vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
