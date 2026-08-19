import { DiagnosticCTA } from "@/components/diagnostic-cta";
import { ProductCheckoutCta } from "./product-checkout-cta";
import { ProductViewTracker } from "./product-view-tracker";
import type { Product } from "@/lib/products/types";

function formatPriceCents(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Shared block structure for every product landing — content comes from
// the `products` table (see src/lib/products/repository.ts). The richer
// sections (problema, como funciona) only render when the product actually
// has that content, so a product created through the admin's lean v1 form
// still gets a clean, complete landing page.
export function ProductLanding({ product }: { product: Product }) {
  const paymentNote = "Pagamento único.";

  return (
    <>
      <ProductViewTracker product={product} />

      <section className="bg-bg pt-32 pb-16 sm:pt-36 sm:pb-20">
        <div className="mx-auto max-w-3xl px-6 sm:px-8">
          <p className="text-sm font-medium text-muted">{product.name}</p>
          <h1 className="mt-3 text-[clamp(2rem,4.5vw,3.25rem)] font-black leading-tight text-heading">
            {product.headline || product.name}
          </h1>
          {product.shortDescription && (
            <p className="mt-5 max-w-xl text-base leading-relaxed text-ink sm:text-lg">
              {product.shortDescription}
            </p>
          )}
          <p className="mt-3 text-sm font-medium text-muted">{paymentNote}</p>
          <div className="mt-8">
            <ProductCheckoutCta product={product} location="product_hero" />
          </div>
        </div>
      </section>

      {product.problemItems.length > 0 && (
        <section className="bg-cream py-16 sm:py-20">
          <div className="mx-auto max-w-4xl px-6 sm:px-8">
            <h2 className="text-[clamp(1.6rem,3vw,2.25rem)] font-black leading-tight text-heading-dark">
              {product.problemHeadline}
            </h2>
            <div className="mt-10 grid gap-x-10 gap-y-4 sm:grid-cols-2">
              {product.problemItems.map((item) => (
                <p key={item} className="text-lg font-bold leading-snug text-heading-dark">
                  {item}
                </p>
              ))}
            </div>
          </div>
        </section>
      )}

      {product.deliverables.length > 0 && (
        <section className="bg-bg py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-6 sm:px-8">
            <h2 className="text-[clamp(1.6rem,3vw,2.25rem)] font-black leading-tight text-heading">
              {product.deliverablesHeadline || "O que você recebe."}
            </h2>
            <ul className="mt-8 space-y-3">
              {product.deliverables.map((item) => (
                <li key={item} className="flex items-start gap-3 text-base leading-relaxed text-ink">
                  <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ink-accent" />
                  {item}
                </li>
              ))}
            </ul>
            {product.deliverablesNote && (
              <p className="mt-6 max-w-xl text-sm text-muted">{product.deliverablesNote}</p>
            )}
          </div>
        </section>
      )}

      {product.howItWorks.length > 0 && (
        <section className="bg-navy py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-6 sm:px-8">
            <h2 className="text-[clamp(1.6rem,3vw,2.25rem)] font-black leading-tight text-heading">
              Como funciona.
            </h2>
            <ol className="mt-10 space-y-8">
              {product.howItWorks.map((step, i) => (
                <li key={step.title} className="flex gap-5">
                  <span className="font-display shrink-0 text-2xl font-bold text-heading">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-heading">{step.title}</h3>
                    <p className="mt-1.5 max-w-md text-base leading-relaxed text-navy-muted">
                      {step.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* Exemplo de entrega — placeholder neutro até existir capa/banner
          reais (cover_image_url/banner_image_url); nenhum case, print ou
          número é inventado aqui. */}
      <section className="bg-cream py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-6 sm:px-8">
          <h2 className="text-[clamp(1.6rem,3vw,2.25rem)] font-black leading-tight text-heading-dark">
            Exemplo de entrega.
          </h2>
          <div className="mt-8 flex aspect-video items-center justify-center rounded-2xl border border-dashed border-cream-border bg-[#FDFAF5]">
            <p className="max-w-xs text-center text-sm text-[#1a1206]/45">
              Exemplos reais deste pack serão adicionados aqui em breve.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-bg py-16 sm:py-20">
        <div className="mx-auto max-w-2xl px-6 text-center sm:px-8">
          <h2 className="text-[clamp(1.75rem,4vw,2.75rem)] font-black leading-tight text-heading">
            {product.name}
          </h2>
          {product.offerDescription && (
            <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-muted sm:text-lg">
              {product.offerDescription}
            </p>
          )}
          <div className="mt-4">
            {product.compareAtPriceCents && (
              <p className="text-lg text-muted line-through decoration-2">
                {formatPriceCents(product.compareAtPriceCents)}
              </p>
            )}
            <p className="text-2xl font-black text-heading">
              {product.priceCents !== null ? formatPriceCents(product.priceCents) : "Valor sob consulta"}
            </p>
          </div>
          <p className="mt-1 text-sm text-muted">{paymentNote}</p>
          <div className="mt-8">
            <ProductCheckoutCta product={product} location="product_offer" />
          </div>
        </div>
      </section>

      <section className="bg-navy py-14 sm:py-16">
        <div className="mx-auto max-w-xl px-6 text-center sm:px-8">
          <h2 className="text-xl font-bold text-heading sm:text-2xl">
            Ainda não sabe qual solução faz sentido?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-navy-muted sm:text-base">
            Faça um diagnóstico do seu negócio e veja onde estão as principais oportunidades.
          </p>
          <div className="mt-6">
            <DiagnosticCTA location={`product_${product.slug}_crosssell`}>
              Solicitar diagnóstico
            </DiagnosticCTA>
          </div>
        </div>
      </section>
    </>
  );
}
