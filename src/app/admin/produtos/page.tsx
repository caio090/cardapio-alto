import Link from "next/link";
import { requireAdminSession } from "@/lib/admin/auth";
import { getAllProductsAdmin } from "@/lib/products/repository";
import { logoutAction } from "@/app/admin/actions";
import { toggleProductStatusAction } from "./actions";

const STATUS_LABEL: Record<string, string> = {
  draft: "Rascunho",
  published: "Publicado",
  coming_soon: "Em breve",
};

function formatPrice(cents: number | null): string {
  if (cents === null) return "—";
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function AdminProductsPage() {
  await requireAdminSession();
  const products = await getAllProductsAdmin();

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[#1a1a1a]/50">Cardápio Alto · Admin</p>
          <h1 className="mt-1 text-2xl font-bold">Produtos</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/produtos/novo"
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/80"
          >
            Novo produto
          </Link>
          <form action={logoutAction}>
            <button type="submit" className="text-sm text-[#1a1a1a]/50 hover:text-[#1a1a1a]">
              Sair
            </button>
          </form>
        </div>
      </div>

      <div className="mt-8 overflow-x-auto rounded-lg border border-black/10 bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-black/10 text-[#1a1a1a]/50">
            <tr>
              <th className="px-4 py-3 font-medium">Produto</th>
              <th className="px-4 py-3 font-medium">Preço</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Checkout</th>
              <th className="px-4 py-3 font-medium">Indexação</th>
              <th className="px-4 py-3 font-medium">Ordem</th>
              <th className="px-4 py-3 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-black/5 last:border-0">
                <td className="px-4 py-3 font-medium">{product.name}</td>
                <td className="px-4 py-3">{formatPrice(product.priceCents)}</td>
                <td className="px-4 py-3">{STATUS_LABEL[product.status] ?? product.status}</td>
                <td className="px-4 py-3">
                  {product.checkoutUrl ? product.checkoutProvider || "configurado" : "WhatsApp (fallback)"}
                </td>
                <td className="px-4 py-3">{product.isIndexable ? "Indexável" : "Noindex"}</td>
                <td className="px-4 py-3">{product.sortOrder}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Link href={`/admin/produtos/${product.id}`} className="font-medium text-blue-700 hover:underline">
                      Editar
                    </Link>
                    {product.status === "published" ? (
                      <form action={toggleProductStatusAction.bind(null, product.id, "draft")}>
                        <button type="submit" className="text-[#1a1a1a]/60 hover:text-[#1a1a1a]">
                          Tirar de publicação
                        </button>
                      </form>
                    ) : (
                      <form action={toggleProductStatusAction.bind(null, product.id, "published")}>
                        <button type="submit" className="text-[#1a1a1a]/60 hover:text-[#1a1a1a]">
                          Publicar
                        </button>
                      </form>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-[#1a1a1a]/50">
                  Nenhum produto ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
