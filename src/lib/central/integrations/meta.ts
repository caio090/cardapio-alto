import "server-only";
import { readApiError } from "./state";
import type { MetaReportData } from "./meta-types";

export type MetaReport = MetaReportData;

// Meta Marketing API (Graph API) — SOMENTE LEITURA nesta versão.
// Requer token com permissão ads_read para a conta de anúncios.
// A versão da Graph API muda com frequência: é configurada explicitamente
// (META_GRAPH_VERSION, ex.: "v24.0") em vez de presumida no código.
// Criação, publicação, ativação e aumento de orçamento não existem aqui.

export function metaConfig() {
  const token = process.env.META_ACCESS_TOKEN;
  const account = process.env.META_AD_ACCOUNT_ID;
  const version = process.env.META_GRAPH_VERSION;
  if (!token || !account || !version) return null;
  return { token, account: account.startsWith("act_") ? account : `act_${account}`, version };
}

export function metaMissing(): string[] {
  return ["META_ACCESS_TOKEN", "META_AD_ACCOUNT_ID", "META_GRAPH_VERSION"].filter((k) => !process.env[k]);
}

async function graph<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const cfg = metaConfig();
  if (!cfg) throw new Error(`Faltam variáveis no servidor: ${metaMissing().join(", ")}.`);
  const qs = new URLSearchParams(params);
  const res = await fetch(`https://graph.facebook.com/${cfg.version}/${path}?${qs}`, {
    headers: { Authorization: `Bearer ${cfg.token}` },
  });
  if (!res.ok) throw await readApiError("Meta", res);
  return (await res.json()) as T;
}

export async function metaTest() {
  const cfg = metaConfig()!;
  const perms = await graph<{ data: { permission: string; status: string }[] }>("me/permissions");
  const granted = perms.data.filter((p) => p.status === "granted").map((p) => p.permission);
  const hasRead = granted.includes("ads_read") || granted.includes("ads_management");
  const account = hasRead
    ? await graph<{ name: string; currency: string; timezone_name: string; account_status: number }>(cfg.account, {
        fields: "name,currency,timezone_name,account_status",
      })
    : null;
  return { granted, hasRead, account };
}


const num = (v: unknown) => (v === undefined || v === null || v === "" ? null : Number(v));

function pickAction(list: { action_type: string; value: string }[] | undefined, types: string[]) {
  if (!list) return null;
  const found = list.find((a) => types.includes(a.action_type));
  return found ? Number(found.value) : null;
}

/** Relatório agregado de um período. Compras = atribuídas pela Meta, não pagamentos confirmados. */
export async function metaInsights(since: string, until: string, campaignNameContains: string): Promise<MetaReport> {
  const cfg = metaConfig()!;
  const account = await graph<{ currency: string; timezone_name: string }>(cfg.account, { fields: "currency,timezone_name" });
  const params: Record<string, string> = {
    fields: "spend,impressions,inline_link_clicks,actions,action_values",
    time_range: JSON.stringify({ since, until }),
    level: "account",
  };
  if (campaignNameContains) {
    params.level = "campaign";
    params.filtering = JSON.stringify([{ field: "campaign.name", operator: "CONTAIN", value: campaignNameContains }]);
  }
  const res = await graph<{
    data: {
      spend?: string;
      impressions?: string;
      inline_link_clicks?: string;
      actions?: { action_type: string; value: string }[];
      action_values?: { action_type: string; value: string }[];
    }[];
  }>(`${cfg.account}/insights`, params);

  const sum = (f: (r: (typeof res.data)[number]) => number | null) => {
    const vals = res.data.map(f).filter((v): v is number => v !== null);
    return vals.length ? vals.reduce((a, b) => a + b, 0) : null;
  };
  const purchaseTypes = ["offsite_conversion.fb_pixel_purchase", "purchase", "omni_purchase"];
  return {
    since,
    until,
    timezone: account.timezone_name,
    currency: account.currency,
    attribution: "Configuração padrão da conta de anúncios (não alterada por esta ferramenta)",
    spend: sum((r) => num(r.spend)),
    impressions: sum((r) => num(r.impressions)),
    linkClicks: sum((r) => num(r.inline_link_clicks)),
    landingPageViews: sum((r) => pickAction(r.actions, ["landing_page_view"])),
    purchases: sum((r) => pickAction(r.actions, purchaseTypes)),
    purchaseValue: sum((r) => pickAction(r.action_values, purchaseTypes)),
    fetchedAt: new Date().toISOString(),
    campaignFilter: campaignNameContains,
  };
}
