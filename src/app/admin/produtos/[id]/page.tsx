import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminSession } from "@/lib/admin/auth";
import { getProductByIdAdmin } from "@/lib/products/repository";
import { ProductForm } from "@/components/admin/product-form";
import { updateProductAction } from "../actions";

export default async function EditProductPage({ params }: PageProps<"/admin/produtos/[id]">) {
  await requireAdminSession();
  const { id } = await params;

  const product = await getProductByIdAdmin(id);
  if (!product) notFound();

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <Link href="/admin/produtos" className="text-sm text-[#1a1a1a]/50 hover:text-[#1a1a1a]">
        ← Produtos
      </Link>
      <h1 className="mt-3 text-2xl font-bold">{product.name}</h1>
      <ProductForm action={updateProductAction.bind(null, id)} product={product} />
    </main>
  );
}
