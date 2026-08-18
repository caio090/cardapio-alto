const SEGMENTS = [
  "Hamburguerias",
  "Pizzarias",
  "Restaurantes",
  "Delivery",
  "Cafeterias",
  "Docerias",
  "Açaí e sorveterias",
  "Bares",
  "Marmitarias",
  "Outros negócios de alimentação",
];

export function Audience() {
  return (
    <section id="para-quem-e" className="border-t border-border bg-surface py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <h2 className="text-[clamp(2rem,4vw,3.25rem)] font-black leading-tight text-heading">
          Feito para quem trabalha com comida.
        </h2>

        <div className="mt-10 flex flex-wrap gap-3">
          {SEGMENTS.map((segment) => (
            <span
              key={segment}
              className="rounded-full border border-border bg-bg px-5 py-2.5 text-sm font-medium text-ink sm:text-base"
            >
              {segment}
            </span>
          ))}
        </div>

        <p className="mt-8 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
          Principalmente para negócios que já vendem, mas sabem que
          poderiam aproveitar melhor cada pedido.
        </p>
      </div>
    </section>
  );
}
