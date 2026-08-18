const SERVICES = [
  {
    course: "I",
    name: "Engenharia de Cardápio",
    description:
      "Reestruturação do cardápio digital com base em dados reais de venda — o que fica em destaque, o que sai e o que muda de preço para elevar o ticket médio.",
  },
  {
    course: "II",
    name: "Fotografia de Prato",
    description:
      "Produção fotográfica pensada para o feed e para o app de delivery: o prato precisa vender sozinho na miniatura.",
  },
  {
    course: "III",
    name: "Tráfego para Restaurantes",
    description:
      "Campanhas pagas em Meta e Google otimizadas para pedido, não para curtida. Cada real investido é rastreado até o carrinho.",
  },
  {
    course: "IV",
    name: "Ativação de Marca",
    description:
      "Identidade visual e presença digital consistentes, para o restaurante parecer — e ser tratado como — maior do que é hoje.",
  },
  {
    course: "V",
    name: "Remarketing",
    description:
      "Reconquista de quem já pediu uma vez. Transformamos cliente eventual em cliente de toda semana.",
  },
];

export function ServicesMenu() {
  return (
    <section id="servicos" className="border-t border-border bg-bg py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <h2 className="text-[clamp(2rem,4vw,3.25rem)] font-black leading-tight text-ink">
              O cardápio
              <br />
              de serviços.
            </h2>
            <p className="mt-6 max-w-sm text-base leading-relaxed text-muted">
              Cinco frentes, servidas na ordem que o seu delivery precisa —
              da cozinha ao carrinho.
            </p>
          </div>

          <ul className="divide-y divide-border border-y border-border">
            {SERVICES.map((service) => (
              <li
                key={service.course}
                className="group grid grid-cols-[3rem_1fr] gap-x-6 gap-y-2 py-8 sm:grid-cols-[4rem_1fr]"
              >
                <span className="font-display text-sm font-medium text-accent">
                  {service.course}
                </span>
                <div>
                  <h3 className="text-xl font-bold text-ink sm:text-2xl">
                    {service.name}
                  </h3>
                  <p className="mt-2 max-w-xl text-base leading-relaxed text-muted">
                    {service.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
