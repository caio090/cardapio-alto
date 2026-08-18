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
    <section id="metodo" className="bg-cream py-20 sm:py-28">
      <div className="mx-auto grid max-w-6xl gap-14 px-6 sm:px-8 lg:grid-cols-2 lg:items-center lg:gap-20">
        <div className="lg:order-1">
          <h2 className="text-[clamp(1.85rem,3.4vw,2.75rem)] font-black leading-tight text-heading-dark">
            Primeiro arrumamos a casa. Depois trazemos mais gente.
          </h2>
          <p className="mt-5 max-w-md text-base leading-relaxed text-[#1a1206]/60">
            Estrutura primeiro, aquisição depois — nessa ordem, cardápio,
            apresentação e tráfego puxam para o mesmo lado.
          </p>

          <ol className="mt-10 space-y-8">
            {STEPS.map((step) => (
              <li key={step.number} className="flex gap-5">
                <span className="font-display shrink-0 text-2xl font-bold text-bg-deep">
                  {step.number}
                </span>
                <div>
                  <h3 className="text-lg font-bold text-heading-dark">{step.title}</h3>
                  <p className="mt-1.5 max-w-md text-base leading-relaxed text-[#1a1206]/60">
                    {step.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Collage — cardápio, produto, conteúdo: the real work, not a
            stock kitchen shot with no connection to the argument. */}
        <div className="grid grid-cols-2 gap-3 lg:order-2">
          <div className="relative col-span-2 aspect-[16/10] overflow-hidden rounded-2xl">
            <Image
              src="/images/pizza-close.jpg"
              alt="Pizza recém-assada em close — o produto que a estrutura existe para vender"
              fill
              sizes="(min-width: 1024px) 40vw, 90vw"
              className="object-cover"
            />
          </div>
          <div className="relative aspect-square overflow-hidden rounded-2xl">
            <Image
              src="/images/hero-burger.jpg"
              alt="Hambúrguer artesanal em close"
              fill
              sizes="(min-width: 1024px) 20vw, 45vw"
              className="object-cover"
            />
          </div>
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#FDFAF5]">
            <div className="absolute inset-0 flex flex-col gap-1.5 p-4">
              <div className="h-2 w-1/2 rounded-full bg-bg-deep" />
              <div className="mt-1.5 h-1 w-full rounded-full bg-[#1a1206]/15" />
              <div className="h-1 w-4/5 rounded-full bg-[#1a1206]/15" />
              <div className="mt-2 h-1 w-full rounded-full bg-[#1a1206]/15" />
              <div className="h-1 w-3/5 rounded-full bg-[#1a1206]/15" />
              <span className="mt-auto text-[0.65rem] font-medium uppercase tracking-wide text-[#1a1206]/35">
                Cardápio
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
