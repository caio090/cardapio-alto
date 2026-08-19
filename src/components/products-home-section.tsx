import Link from "next/link";
import { ProductCtaLink } from "./products/product-cta-link";
import { getPublishedProducts } from "@/lib/products/repository";
import type { Product } from "@/lib/products/types";

function ProductCardContent({ product }: { product: Product }) {
  return (
    <>
      <h3 className="text-xl font-black text-heading">{product.name}</h3>
      {product.shortDescription && (
        <p className="mt-3 flex-1 text-base leading-relaxed text-muted">{product.shortDescription}</p>
      )}
      <ProductCtaLink
        product={product}
        location="home"
        className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-accent hover:underline"
      >
        Conhecer o Pack →
      </ProductCtaLink>
    </>
  );
}

// Compact teaser for the products catalog — capped at 3 cards no matter how
// many products exist, so the Home stays institutional instead of turning
// into a catalog dump. Renders nothing if there's nothing published+
// featured yet, and adapts its own layout to however many cards there are
// (1, 2, or 3) instead of assuming exactly 3.
export async function ProductsHomeSection() {
  const products = await getPublishedProducts();
  const items = products.filter((p) => p.featured).slice(0, 3);

  if (items.length === 0) return null;

  return (
    <section id="produtos" className="bg-bg py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <p className="text-sm font-medium text-muted">Soluções Cardápio Alto</p>
        <h2 className="mt-3 max-w-xl text-[clamp(1.85rem,3.4vw,2.75rem)] font-black leading-tight text-heading">
          Comece pelo ponto que mais precisa de atenção.
        </h2>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-ink sm:text-lg">
          Nem todo negócio precisa começar por uma operação completa. Criamos
          soluções específicas para corrigir pontos importantes da presença e
          das vendas do seu delivery.
        </p>

        {items.length === 1 ? (
          <div className="mx-auto mt-12 flex max-w-md flex-col rounded-2xl border border-black/10 bg-bg px-7 py-8">
            <ProductCardContent product={items[0]} />
          </div>
        ) : (
          <div
            className={`mt-12 grid gap-px overflow-hidden rounded-2xl bg-black/10 ${
              items.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3"
            }`}
          >
            {items.map((product) => (
              <div key={product.id} className="flex flex-col bg-bg px-7 py-8">
                <ProductCardContent product={product} />
              </div>
            ))}
          </div>
        )}

        <Link
          href="/produtos"
          className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-accent hover:underline"
        >
          Ver todos os produtos →
        </Link>
      </div>
    </section>
  );
}
