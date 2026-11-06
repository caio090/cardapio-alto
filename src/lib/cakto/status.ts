import type { OrderStatus } from "./types";

// Eventos conforme o catálogo oficial (cakto_list_webhook_events / docs.cakto.com.br/conceitos/webhooks,
// lido em 06/11/2026). "Pix gerado" e similares NÃO são compra aprovada: viram "pending".
const EVENT_STATUS_MAP: Record<string, OrderStatus> = {
  purchase_approved: "paid",
  pix_gerado: "pending",
  boleto_gerado: "pending",
  picpay_gerado: "pending",
  "PicPay gerado": "pending", // rótulo antigo, mantido por compatibilidade
  openfinance_nubank_gerado: "pending",
  oxxo_gerado: "pending",
  spei_gerado: "pending",
  pse_gerado: "pending",
  nequi_gerado: "pending",
  pix_expirado: "canceled",
  purchase_refused: "refused",
  checkout_abandonment: "abandoned",
  refund_requested: "refund_requested",
  refund: "refunded",
  chargeback: "chargeback",
  dispute_defense_requested: "chargeback",
};

// Unrecognized events map to "unknown" rather than throwing — the webhook
// must never fail just because Cakto adds a new event name later.
export function mapCaktoEventToStatus(event: string): OrderStatus {
  return EVENT_STATUS_MAP[event] ?? "unknown";
}

// A Cakto não garante ordem nem entrega única: um pix_gerado reenviado pode
// chegar depois do purchase_approved, e um purchase_approved pode chegar
// depois do pix_expirado (pagamento confirmado perto do vencimento). A
// regra: um evento "mais avançado" no ciclo de vida sempre vence; um
// evento atrasado de fase anterior nunca rebaixa o status.
const RANK: Record<OrderStatus, number> = {
  unknown: 0,
  abandoned: 1,
  pending: 2,
  canceled: 3,
  refused: 3,
  paid: 5,
  refund_requested: 6,
  refunded: 8,
  chargeback: 8,
};

export function resolveStatus(current: OrderStatus | null | undefined, incoming: OrderStatus): OrderStatus {
  if (!current) return incoming;
  if (incoming === "unknown") return current;
  // O comprador pode desistir do reembolso: a venda volta a "paid".
  if (current === "refund_requested" && incoming === "paid") return "paid";
  return RANK[incoming] >= RANK[current] ? incoming : current;
}
