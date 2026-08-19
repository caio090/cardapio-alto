import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ProductLanding } from "@/components/products/product-landing";
import { getPublishedProductBySlug } from "@/lib/products/repository";

// No generateStaticParams — the catalog lives in Supabase and changes
// through /admin, not through code/deploys, so these are always fetched at
// request time. status != 'published' (including slugs that don't exist at
// all) is a public 404, same as any other missing page.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/produtos/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getPublishedProductBySlug(slug);
  if (!product) return {};

  const title = product.seoTitle || `${product.name} | Cardápio Alto`;
  const description = product.seoDescription || product.shortDescription || undefined;

  return {
    title,
    description,
    alternates: { canonical: `/produtos/${product.slug}` },
    openGraph: {
      title,
      description,
      url: `/produtos/${product.slug}`,
      type: "website",
    },
    robots: product.isIndexable
      ? { index: true, follow: true }
      : { index: false, follow: false },
  };
}

export default async function ProductPage({ params }: PageProps<"/produtos/[slug]">) {
  const { slug } = await params;
  const product = await getPublishedProductBySlug(slug);
  if (!product) notFound();

  return (
    <>
      <SiteHeader />
      <main>
        <ProductLanding product={product} />
      </main>
      <SiteFooter />
    </>
  );
}
