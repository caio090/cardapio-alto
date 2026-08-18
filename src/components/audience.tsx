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
];

export function Audience() {
  return (
    <section id="para-quem-e" className="bg-cream py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="text-[clamp(1.75rem,3vw,2.5rem)] font-black leading-tight text-heading-dark">
            Feito para quem trabalha com comida.
          </h2>
          <p className="max-w-xs text-sm text-[#1a1206]/60 sm:text-right">
            Principalmente para negócios que já vendem, mas sabem que
            poderiam aproveitar melhor cada pedido.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-2.5">
          {SEGMENTS.map((segment) => (
            <span
              key={segment}
              className="rounded-full border border-[#1a1206]/20 px-4 py-2 text-sm font-medium text-heading-dark transition-colors hover:border-bg-deep hover:text-bg-deep"
            >
              {segment}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
