// Shape confirmed directly from Cakto's own webhook payload example
// (AGRUPADO / grouped dispatch mode) — do not guess at fields beyond this.

export interface CaktoCustomer {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  docNumber?: string | null;
  birthDate?: string | null;
  docType?: string | null;
}

export interface CaktoOffer {
  id?: string | null;
  name?: string | null;
  price?: number | null;
  image?: string | null;
}

export interface CaktoProduct {
  name?: string | null;
  id?: string | null;
  short_id?: string | null;
  supportEmail?: string | null;
  type?: string | null;
  invoiceDescription?: string | null;
}

export interface CaktoDataItem {
  id: string;
  refId?: string | null;
  customer?: CaktoCustomer | null;
  offer?: CaktoOffer | null;
  offer_type?: string | null;
  product?: CaktoProduct | null;
  checkout: string | number;
  parent_order?: string | null;
  checkoutUrl?: string | null;
  status?: string | null;
  // Cakto's docs show these as decimal-string reais (e.g. "34.35"); the
  // live payload has also shown bare numbers (e.g. 4.5) — reaisToCents()
  // in money.ts accepts both, so the type reflects that instead of
  // silently narrowing to one.
  baseAmount?: number | string | null;
  discount?: number | string | null;
  amount?: number | string | null;
  fees?: number | string | null;
  installments?: number | null;
  paymentMethod?: string | null;
  paymentMethodName?: string | null;
  paidAt?: string | null;
  createdAt?: string | null;
  refundedAt?: string | null;
  chargedbackAt?: string | null;
  canceledAt?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_term?: string | null;
  utm_content?: string | null;
  sck?: string | null;
  fbc?: string | null;
  fbp?: string | null;
  // Cakto doesn't document a `card` object on this event, but other
  // providers sometimes add one later — typed loosely so sanitize.ts can
  // still strip it if it ever shows up.
  card?: Record<string, unknown> | null;
}

export interface CaktoWebhookPayload {
  secret: string;
  event: string;
  data: CaktoDataItem[];
}

export type OrderStatus =
  | "pending"
  | "paid"
  | "refused"
  | "abandoned"
  | "refunded"
  | "chargeback"
  | "unknown";
