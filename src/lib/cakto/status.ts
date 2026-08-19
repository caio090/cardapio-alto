import type { OrderStatus } from "./types";

const EVENT_STATUS_MAP: Record<string, OrderStatus> = {
  purchase_approved: "paid",
  pix_gerado: "pending",
  "PicPay gerado": "pending",
  purchase_refused: "refused",
  checkout_abandonment: "abandoned",
  refund: "refunded",
  chargeback: "chargeback",
};

// Unrecognized events map to "unknown" rather than throwing — the webhook
// must never fail just because Cakto adds a new event name later.
export function mapCaktoEventToStatus(event: string): OrderStatus {
  return EVENT_STATUS_MAP[event] ?? "unknown";
}
