import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { DiagnosticCTA } from "@/components/diagnostic-cta";
import { ProductCtaLink } from "@/components/products/product-cta-link";
import { getPublishedProducts } from "@/lib/products/repository";

// Indexável assim que houver pelo menos 1 produto publicado com checkout
// real — enquanto o catálogo só tiver rascunhos ou packs sem checkout
// configurado, fica noindex automaticamente (sem precisar lembrar de tirar
// manualmente depois).
export async function generateMetadata(): Promise<Metadata> {
  const products = await getPublishedProducts();
  const hasSellableProduct = products.some((product) => Boolean(product.checkoutUrl));

  return {
    title: "Soluções para Restaurantes e Delivery | Cardápio Alto",
    description:
      "Do diagnóstico à execução: soluções específicas para organizar a presença digital, melhorar o cardápio e criar novas oportunidades de venda do seu delivery.",
    alternates: { canonical: "/produtos" },
    robots: hasSellableProduct
      ? { index: true, follow: true }
      : { index: false, follow: false },
  };
}

const CARD_CTA_CLASSES =
  "inline-flex items-center gap-1.5 text-sm font-semibold text-bg-deep hover:underline";

// Always fetch fresh — a product published in /admin must show up here
// immediately, no rebuild/redeploy needed.
export const dynamic = "force-dynamic";

export default async function ProdutosPage() {
  const products = await getPublishedProducts();

  return (
    <>
      <SiteHeader />
      <main className="bg-cream pt-28">
        <section className="mx-auto max-w-3xl px-6 pb-14 pt-8 sm:px-8 sm:pb-20">
          <p className="text-sm font-medium text-bg-deep">Soluções</p>
          <h1 className="mt-2 text-[clamp(2rem,4.5vw,3.25rem)] font-black leading-tight text-heading-dark">
            Escolha onde seu negócio precisa melhorar primeiro.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-[#1a1206]/70 sm:text-lg">
            Do diagnóstico à execução, encontre soluções específicas para
            organizar sua presença digital, melhorar seu cardápio e criar
            novas oportunidades de venda.
          </p>
        </section>

        <section className="mx-auto max-w-5xl px-6 pb-20 sm:px-8 sm:pb-28">
          <div className="grid gap-5 sm:grid-cols-2">
            {/* Diagnóstico — porta de entrada, identificado como análise
                inicial, não um produto do catálogo. */}
            <div className="flex flex-col rounded-2xl border border-cream-border bg-[#FDFAF5] p-7 sm:p-8">
              <p className="text-sm font-medium text-bg-deep">Análise inicial</p>
              <h2 className="mt-2 text-xl font-black text-heading-dark sm:text-2xl">
                Diagnóstico Cardápio Alto
              </h2>
              <p className="mt-3 flex-1 text-base leading-relaxed text-[#1a1206]/60">
                Identificamos os principais pontos que podem estar limitando a
                presença e as vendas do seu negócio.
              </p>
              <div className="mt-6">
                <DiagnosticCTA location="produtos_page" className={CARD_CTA_CLASSES}>
                  Solicitar diagnóstico →
                </DiagnosticCTA>
              </div>
            </div>

            {products.map((product) => (
              <div
                key={product.id}
                className="flex flex-col rounded-2xl border border-cream-border bg-[#FDFAF5] p-7 sm:p-8"
              >
                <p className="text-sm font-medium text-bg-deep">{product.name}</p>
                <h2 className="mt-2 text-xl font-black text-heading-dark sm:text-2xl">
                  {product.name}
                </h2>
                {product.shortDescription && (
                  <p className="mt-3 flex-1 text-base leading-relaxed text-[#1a1206]/60">
                    {product.shortDescription}
                  </p>
                )}
                <div className="mt-6">
                  <ProductCtaLink product={product} location="produtos_page" className={CARD_CTA_CLASSES}>
                    Ver detalhes →
                  </ProductCtaLink>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
