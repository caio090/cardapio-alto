const FAQS = [
  {
    question: "Vocês trabalham somente com hamburguerias?",
    answer:
      "Não. O Cardápio Alto atende diferentes operações de alimentação que trabalham com delivery.",
  },
  {
    question: "Preciso vender pelo iFood?",
    answer:
      "Não. O trabalho pode envolver WhatsApp, cardápio digital, Instagram, site ou marketplaces, dependendo da operação.",
  },
  {
    question: "Preciso investir em tráfego pago?",
    answer:
      "Não necessariamente. Primeiro avaliamos se a estrutura de venda está pronta para receber mais pessoas.",
  },
  {
    question: "Vocês mexem no meu cardápio?",
    answer:
      "Podemos analisar e reorganizar produtos, categorias, combos, adicionais e oportunidades para melhorar a experiência de compra e o ticket médio.",
  },
  {
    question: "Como funciona o diagnóstico?",
    answer:
      "O negócio responde algumas perguntas iniciais para que possamos entender sua estrutura atual e identificar os primeiros pontos de atenção.",
  },
  {
    question: "Preciso contratar todos os serviços?",
    answer:
      "Não. A estrutura pode ser definida de acordo com os problemas e necessidades encontrados no diagnóstico.",
  },
];

export function Faq() {
  return (
    <section className="bg-cream py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-6 sm:px-8">
        <h2 className="text-[clamp(1.85rem,3.4vw,2.75rem)] font-black leading-tight text-heading-dark">
          Perguntas frequentes.
        </h2>

        <div className="mt-10 divide-y divide-cream-border border-y border-cream-border">
          {FAQS.map((faq) => (
            <details key={faq.question} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-base font-bold text-heading-dark sm:text-lg">
                {faq.question}
                <span
                  aria-hidden
                  className="shrink-0 text-lg font-normal text-[#1a1206]/40 transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="mt-3 max-w-xl text-base leading-relaxed text-[#1a1206]/60">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
