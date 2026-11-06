import type { Metadata } from "next";
import Link from "next/link";
import { logoutAction } from "@/app/admin/actions";
import { requireAdminSession } from "@/lib/admin/auth";

export const metadata: Metadata = {
  title: "Central de Produtos | Admin",
  robots: { index: false, follow: false },
};

export default async function CentralLayout({ children }: { children: React.ReactNode }) {
  await requireAdminSession();
  return (
    <div className="central-root min-h-screen bg-[#f4f5f3] text-[#1d2327]">
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href="/admin/central" className="font-bold tracking-tight">
            Central de Produtos <span className="ml-1 rounded bg-teal-50 px-1.5 py-0.5 text-[11px] font-semibold text-teal-800">uso interno</span>
          </Link>
          <nav className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-black/65">
            <Link href="/admin/central" className="hover:text-black">Produtos</Link>
            <Link href="/admin/central/integracoes" className="hover:text-black">Integrações</Link>
            <Link href="/admin/central/casos" className="hover:text-black">Casos e playbooks</Link>
            <Link href="/admin/produtos" className="hover:text-black">Páginas do site</Link>
            <form action={logoutAction}>
              <button type="submit" className="hover:text-black">Sair</button>
            </form>
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</div>
    </div>
  );
}
