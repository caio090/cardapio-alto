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
    <section className="border-t border-border bg-bg py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-6 sm:px-8">
        <h2 className="text-[clamp(2rem,4vw,3.25rem)] font-black leading-tight text-heading">
          Perguntas frequentes.
        </h2>

        <div className="mt-10 divide-y divide-border border-y border-border">
          {FAQS.map((faq) => (
            <details key={faq.question} className="group py-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-base font-bold text-ink sm:text-lg">
                {faq.question}
                <span
                  aria-hidden
                  className="shrink-0 text-xl font-normal text-muted transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="mt-3 max-w-xl text-base leading-relaxed text-muted">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
