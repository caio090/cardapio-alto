import Link from "next/link";
import type { ReactNode } from "react";
import { DECISION_STATUS, type DecisionStatus } from "@/lib/central/model";

export const inputCls =
  "w-full rounded-md border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15";
export const labelCls = "block text-xs font-semibold uppercase tracking-wide text-black/55";
export const btnPrimary =
  "inline-flex items-center justify-center rounded-md bg-teal-800 px-3.5 py-2 text-sm font-semibold text-white hover:bg-teal-900 disabled:opacity-50";
export const btnSecondary =
  "inline-flex items-center justify-center rounded-md border border-black/15 bg-white px-3 py-1.5 text-sm font-medium text-black/80 hover:bg-black/[0.03]";
export const btnDanger =
  "inline-flex items-center justify-center rounded-md border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50";

export function Card({ children, className = "", id }: { children: ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={`rounded-xl border border-black/10 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] ${className}`}>
      {children}
    </section>
  );
}

export function PageTitle({ kicker, title, children }: { kicker?: string; title: string; children?: ReactNode }) {
  return (
    <div className="mb-6">
      {kicker && <p className="text-xs font-semibold uppercase tracking-wide text-orange-700">{kicker}</p>}
      <h1 className="mt-1 text-2xl font-bold text-black">{title}</h1>
      {children && <div className="mt-2 max-w-3xl text-sm leading-relaxed text-black/65">{children}</div>}
    </div>
  );
}

const TONE: Record<string, string> = {
  gray: "bg-gray-100 text-gray-700 ring-gray-200",
  amber: "bg-amber-50 text-amber-800 ring-amber-200",
  blue: "bg-sky-50 text-sky-800 ring-sky-200",
  violet: "bg-violet-50 text-violet-800 ring-violet-200",
  green: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  red: "bg-red-50 text-red-700 ring-red-200",
  orange: "bg-orange-50 text-orange-800 ring-orange-200",
};

export function Badge({ tone = "gray", children, title }: { tone?: string; children: ReactNode; title?: string }) {
  return (
    <span title={title} className={`inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${TONE[tone] ?? TONE.gray}`}>
      {children}
    </span>
  );
}

export function DecisionBadge({ status }: { status: DecisionStatus }) {
  const d = DECISION_STATUS[status];
  return (
    <Badge tone={d.tone} title={d.help}>
      {d.label}
    </Badge>
  );
}

/** Ajuda contextual curta: o que é, quando usar, o que preparar, como avaliar. */
export function Help({
  oQueE,
  quandoUsar,
  oQuePreparar,
  comoAvaliar,
  label = "Como usar esta parte",
}: {
  oQueE: string;
  quandoUsar?: string;
  oQuePreparar?: string;
  comoAvaliar?: string;
  label?: string;
}) {
  return (
    <details className="group rounded-lg border border-teal-900/10 bg-teal-50/60 px-4 py-2.5 text-sm">
      <summary className="list-none [&::-webkit-details-marker]:hidden cursor-pointer select-none font-medium text-teal-900">
        <span className="mr-1.5 inline-block transition-transform group-open:rotate-90">›</span>
        {label}
      </summary>
      <dl className="mt-2 grid gap-2 text-black/75 sm:grid-cols-2">
        <div>
          <dt className="font-semibold text-black/85">O que é</dt>
          <dd>{oQueE}</dd>
        </div>
        {quandoUsar && (
          <div>
            <dt className="font-semibold text-black/85">Quando usar</dt>
            <dd>{quandoUsar}</dd>
          </div>
        )}
        {oQuePreparar && (
          <div>
            <dt className="font-semibold text-black/85">O que preparar</dt>
            <dd>{oQuePreparar}</dd>
          </div>
        )}
        {comoAvaliar && (
          <div>
            <dt className="font-semibold text-black/85">Como avaliar</dt>
            <dd>{comoAvaliar}</dd>
          </div>
        )}
      </dl>
    </details>
  );
}

export function Flash({ msg, err }: { msg?: string; err?: string }) {
  if (!msg && !err) return null;
  return (
    <div
      role={err ? "alert" : "status"}
      className={`mb-5 rounded-lg border px-4 py-3 text-sm ${err ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-900"}`}
    >
      {err ?? msg}
    </div>
  );
}

export function Empty({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-black/15 bg-white/60 px-6 py-8 text-center">
      <p className="font-semibold text-black/80">{title}</p>
      {children && <div className="mx-auto mt-1.5 max-w-md text-sm text-black/60">{children}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="font-medium text-teal-800 underline-offset-2 hover:underline">
      {children}
    </Link>
  );
}

export function formatDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" });
}

export function formatBytes(n?: number) {
  if (!n && n !== 0) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

export type SP = Promise<Record<string, string | string[] | undefined>>;

export async function readFlash(searchParams: SP) {
  const sp = await searchParams;
  const one = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : undefined);
  return { msg: one("msg"), err: one("err"), sp, one };
}
