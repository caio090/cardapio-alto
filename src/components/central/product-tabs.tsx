"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "", label: "Visão geral" },
  { href: "/corpo", label: "Corpo do Produto" },
  { href: "/tarefas", label: "Tarefas" },
  { href: "/entregavel", label: "Entregável (PDF)" },
  { href: "/arquivos", label: "Arquivos e Drive" },
  { href: "/criativos", label: "Imagens e criativos" },
  { href: "/pagina", label: "Página e checkout" },
  { href: "/financeiro", label: "Números" },
  { href: "/versoes", label: "Versões e decisões" },
];

export function ProductTabs({ productId }: { productId: string }) {
  const pathname = usePathname();
  const base = `/admin/central/${productId}`;
  return (
    <nav className="-mx-4 mb-6 overflow-x-auto border-b border-black/10 px-4 sm:mx-0 sm:px-0" aria-label="Seções do produto">
      <ul className="flex min-w-max gap-1">
        {TABS.map((t) => {
          const href = base + t.href;
          const active = t.href === "" ? pathname === base : pathname.startsWith(href);
          return (
            <li key={t.href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`inline-block border-b-2 px-3 py-2 text-sm font-medium ${
                  active ? "border-teal-700 text-teal-900" : "border-transparent text-black/55 hover:text-black"
                }`}
              >
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
