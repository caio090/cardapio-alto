import type { SupabaseClient } from "@supabase/supabase-js";
import { reaisToCents } from "./money";
import { mapCaktoEventToStatus, resolveStatus } from "./status";
import type { CaktoDataItem, CaktoWebhookPayload, OrderStatus } from "./types";

export interface ProcessResult {
  ordersUpserted: number;
  itemsUpserted: number;
}

function parseCaktoDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

// Order-level fields (customer, UTMs, timestamps) come from whichever item
// in the checkout is the main offer — an orderbump's own copy of these is
// redundant, and "first array element" isn't guaranteed to be the main one.
function pickMainItem(items: CaktoDataItem[]): CaktoDataItem {
  return items.find((item) => item.offer_type === "main") ?? items[0];
}

function groupByCheckout(items: CaktoDataItem[]): Map<string, CaktoDataItem[]> {
  const groups = new Map<string, CaktoDataItem[]>();
  for (const item of items) {
    // `checkout` pode vir nulo (doc oficial: integer | null). Sem ele, cada
    // pedido é seu próprio grupo — nunca juntar pedidos diferentes sob "null".
    const key = item.checkout !== null && item.checkout !== undefined && item.checkout !== "" ? String(item.checkout) : `order:${item.id}`;
    const list = groups.get(key);
    if (list) {
      list.push(item);
    } else {
      groups.set(key, [item]);
    }
  }
  return groups;
}

async function findProductIdByCaktoId(
  admin: SupabaseClient,
  caktoProductId: string | null | undefined
): Promise<string | null> {
  if (!caktoProductId) return null;

  const { data, error } = await admin
    .from("products")
    .select("id")
    .eq("cakto_product_id", caktoProductId)
    .maybeSingle();

  // No match yet is expected (external IDs not linked) — never blocks
  // processing, we just leave order_items.product_id null.
  if (error || !data) return null;
  return data.id as string;
}

// One checkout (`orders`) can carry several data[] entries (`order_items`)
// — a main offer plus an orderbump, both sharing the same `checkout`. This
// groups by checkout so "main + bump" always resolves to exactly one order
// row with two order_items rows, never two separate orders.
export async function processCaktoWebhook(
  payload: CaktoWebhookPayload,
  admin: SupabaseClient
): Promise<ProcessResult> {
  const incoming = mapCaktoEventToStatus(payload.event);
  // Itens sem id (ex.: checkout_abandonment) não são pedidos e não entram aqui.
  const groups = groupByCheckout(payload.data.filter((item) => typeof item?.id === "string" && item.id));

  let ordersUpserted = 0;
  let itemsUpserted = 0;

  for (const [checkoutId, items] of groups) {
    const main = pickMainItem(items);

    const { data: existingOrder } = await admin
      .from("orders")
      .select("id,status")
      .eq("provider", "cakto")
      .eq("cakto_checkout_id", checkoutId)
      .maybeSingle();
    const status = resolveStatus((existingOrder?.status as OrderStatus | undefined) ?? null, incoming);

    const orderRow = {
      provider: "cakto",
      cakto_checkout_id: checkoutId,
      customer_name: main.customer?.name ?? null,
      customer_email: main.customer?.email ?? null,
      customer_phone: main.customer?.phone ?? null,
      status,
      payment_method: main.paymentMethod ?? null,
      payment_method_name: main.paymentMethodName ?? null,
      installments: main.installments ?? null,
      utm_source: main.utm_source ?? null,
      utm_medium: main.utm_medium ?? null,
      utm_campaign: main.utm_campaign ?? null,
      utm_content: main.utm_content ?? null,
      utm_term: main.utm_term ?? null,
      sck: main.sck ?? null,
      fbc: main.fbc ?? null,
      fbp: main.fbp ?? null,
      paid_at: parseCaktoDate(main.paidAt),
      refunded_at: parseCaktoDate(main.refundedAt),
      chargedback_at: parseCaktoDate(main.chargedbackAt),
      canceled_at: parseCaktoDate(main.canceledAt),
    };

    const { data: order, error: orderError } = await admin
      .from("orders")
      .upsert(orderRow, { onConflict: "provider,cakto_checkout_id" })
      .select("id")
      .single();

    if (orderError || !order) {
      throw orderError ?? new Error("Upsert de order não retornou id.");
    }
    ordersUpserted++;

    for (const item of items) {
      const productId = await findProductIdByCaktoId(admin, item.product?.id);
      const { data: existingItem } = await admin
        .from("order_items")
        .select("id,status")
        .eq("cakto_item_id", item.id)
        .maybeSingle();
      const itemStatus = resolveStatus((existingItem?.status as OrderStatus | undefined) ?? null, incoming);

      const itemRow = {
        order_id: order.id,
        // Idempotency key — a resent webhook upserts this same row instead
        // of inserting a duplicate item (unique constraint on the column).
        cakto_item_id: item.id,
        ref_id: item.refId ?? null,
        cakto_product_id: item.product?.id ?? null,
        cakto_product_short_id: item.product?.short_id ?? null,
        cakto_offer_id: item.offer?.id ?? null,
        product_id: productId,
        product_name: item.product?.name ?? null,
        offer_name: item.offer?.name ?? null,
        offer_type: item.offer_type ?? null,
        parent_order_ref: item.parent_order ?? null,
        base_amount_cents: reaisToCents(item.baseAmount),
        discount_cents: reaisToCents(item.discount),
        amount_cents: reaisToCents(item.amount),
        fees_cents: reaisToCents(item.fees),
        status: itemStatus,
      };

      const { error: itemError } = await admin
        .from("order_items")
        .upsert(itemRow, { onConflict: "cakto_item_id" });

      if (itemError) throw itemError;
      itemsUpserted++;
    }
  }

  return { ordersUpserted, itemsUpserted };
}
