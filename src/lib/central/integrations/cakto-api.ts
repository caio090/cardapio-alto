import "server-only";
import { readApiError } from "./state";

// Cakto API pública, pelo SERVIDOR desta aplicação (OAuth2 client_credentials),
// conforme docs.cakto.com.br/authentication (lido em 06/11/2026):
//   POST https://api.cakto.com.br/public_api/token/ (form: client_id, client_secret)
//   → access_token (Bearer), expires_in ~36000s; reutilizar até expirar.
// Isto é diferente do MCP usado pelo assistente: aquele login não serve
// para a aplicação e nunca é copiado para cá. Esta integração só LÊ.
const BASE = "https://api.cakto.com.br";

export function caktoApiConfig() {
  const clientId = process.env.CAKTO_CLIENT_ID;
  const clientSecret = process.env.CAKTO_CLIENT_SECRET;
  return clientId && clientSecret ? { clientId, clientSecret } : null;
}

let token: { value: string; exp: number; scope: string } | null = null;

async function getToken() {
  if (token && token.exp > Date.now() + 120_000) return token;
  const cfg = caktoApiConfig();
  if (!cfg) throw new Error("CAKTO_CLIENT_ID / CAKTO_CLIENT_SECRET não configurados no servidor.");
  const res = await fetch(`${BASE}/public_api/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: cfg.clientId, client_secret: cfg.clientSecret }),
  });
  if (!res.ok) throw await readApiError("Cakto", res);
  const json = (await res.json()) as { access_token: string; expires_in: number; scope?: string };
  token = { value: json.access_token, exp: Date.now() + json.expires_in * 1000, scope: json.scope ?? "" };
  return token;
}

async function caktoGet<T>(path: string): Promise<T> {
  const t = await getToken();
  const res = await fetch(`${BASE}${path}`, { headers: { Authorization: `Bearer ${t.value}` } });
  if (!res.ok) throw await readApiError("Cakto", res);
  return (await res.json()) as T;
}

interface Page<T> {
  count?: number;
  results?: T[];
}

export interface CaktoProductSummary {
  id: string;
  name: string;
  status?: string;
  price?: number;
}

export async function caktoTest() {
  const t = await getToken();
  const products = await caktoGet<Page<CaktoProductSummary>>("/public_api/products/");
  return { scope: t.scope, products: (products.results ?? []).map(({ id, name, status, price }) => ({ id, name, status, price })) };
}

/** Leitura de um produto, suas ofertas e a contagem de pedidos por status (sem dados pessoais). */
export async function caktoProductSnapshot(productId: string) {
  const id = encodeURIComponent(productId);
  const product = await caktoGet<CaktoProductSummary & { description?: string }>(`/public_api/products/${id}/`);
  const offers = await caktoGet<Page<{ id: string; name: string; price: number; status: string }>>(`/public_api/offers/?product=${id}`);
  const orders = await caktoGet<Page<{ status: string }>>(`/public_api/orders/?product=${id}`);
  const byStatus: Record<string, number> = {};
  for (const o of orders.results ?? []) byStatus[o.status] = (byStatus[o.status] ?? 0) + 1;
  return {
    product: { id: product.id, name: product.name, status: product.status, price: product.price, description: product.description },
    offers: (offers.results ?? []).map(({ id, name, price, status }) => ({ id, name, price, status })),
    ordersTotal: orders.count ?? (orders.results ?? []).length,
    ordersFirstPageByStatus: byStatus,
  };
}
