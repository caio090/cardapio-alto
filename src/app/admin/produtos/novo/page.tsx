import Link from "next/link";
import { requireAdminSession } from "@/lib/admin/auth";
import { ProductForm } from "@/components/admin/product-form";
import { createProductAction } from "../actions";

export default async function NewProductPage() {
  await requireAdminSession();

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <Link href="/admin/produtos" className="text-sm text-[#1a1a1a]/50 hover:text-[#1a1a1a]">
        ← Produtos
      </Link>
      <h1 className="mt-3 text-2xl font-bold">Novo produto</h1>
      <ProductForm action={createProductAction} />
    </main>
  );
}
