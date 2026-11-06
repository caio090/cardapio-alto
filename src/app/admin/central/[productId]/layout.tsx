import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminSession } from "@/lib/admin/auth";
import { getProduct } from "@/lib/central/repo";
import { Badge } from "@/components/central/ui";
import { ProductTabs } from "@/components/central/product-tabs";

export default async function ProductLayout({ children, params }: LayoutProps<"/admin/central/[productId]">) {
  await requireAdminSession();
  const { productId } = await params;
  const product = await getProduct(productId);
  if (!product) notFound();

  return (
    <div>
      <p className="text-sm text-black/50">
        <Link href="/admin/central" className="hover:text-black">Produtos</Link> /
      </p>
      <div className="mt-1 mb-4 flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-bold">{product.name}</h1>
        <Badge tone="gray">versão {product.versionLabel}</Badge>
        {product.dadosFicticios ? <Badge tone="orange">Dados fictícios</Badge> : <Badge tone="green">Dados reais</Badge>}
      </div>
      <ProductTabs productId={product.id} />
      {children}
    </div>
  );
}
