import { describe, expect, it } from "vitest";
import { processCaktoWebhook } from "../process";
import { createFakeSupabase } from "./fake-supabase";
import type { CaktoDataItem, CaktoWebhookPayload } from "../types";

function makeItem(overrides: Partial<CaktoDataItem>): CaktoDataItem {
  return {
    id: "item-default",
    refId: "ref-default",
    customer: { name: "Ana Silva", email: "ana@example.com", phone: "5589999999999" },
    offer: { id: "offer-1", name: "Engenharia de Cardápio", price: 147 },
    offer_type: "main",
    product: { name: "Engenharia de Cardápio", id: "prod-cakto-1", short_id: "short-1" },
    checkout: 12345,
    parent_order: null,
    status: "paid",
    baseAmount: 147,
    discount: 0,
    amount: 147,
    fees: 7.35,
    installments: 1,
    paymentMethod: "credit_card",
    paymentMethodName: "Cartão de Crédito",
    paidAt: "2026-08-19T10:00:00.000Z",
    utm_source: "instagram",
    utm_campaign: "engenharia_v1",
    ...overrides,
  };
}

function makePayload(event: string, data: CaktoDataItem[]): CaktoWebhookPayload {
  return { secret: "irrelevant-here", event, data };
}

describe("processCaktoWebhook", () => {
  it("creates 1 order + 1 order_item for a single main item", async () => {
    const admin = createFakeSupabase();
    const payload = makePayload("purchase_approved", [makeItem({ id: "item-1" })]);

    const result = await processCaktoWebhook(payload, admin);

    expect(result).toEqual({ ordersUpserted: 1, itemsUpserted: 1 });
    expect(admin.tables.orders).toHaveLength(1);
    expect(admin.tables.order_items).toHaveLength(1);
    expect(admin.tables.orders[0].status).toBe("paid");
    expect(admin.tables.orders[0].cakto_checkout_id).toBe("12345");
  });

  it("main + orderbump on the same checkout = 1 order + 2 order_items", async () => {
    const admin = createFakeSupabase();
    const main = makeItem({ id: "item-main", offer_type: "main", parent_order: null });
    const bump = makeItem({
      id: "item-bump",
      refId: "ref-bump",
      offer_type: "orderbump",
      parent_order: main.refId,
      offer: { id: "offer-2", name: "Adicional", price: 30 },
    });
    const payload = makePayload("purchase_approved", [main, bump]);

    const result = await processCaktoWebhook(payload, admin);

    expect(result).toEqual({ ordersUpserted: 1, itemsUpserted: 2 });
    expect(admin.tables.orders).toHaveLength(1);
    expect(admin.tables.order_items).toHaveLength(2);

    const orderId = admin.tables.orders[0].id;
    expect(admin.tables.order_items.every((item) => item.order_id === orderId)).toBe(true);

    const offerTypes = admin.tables.order_items.map((item) => item.offer_type).sort();
    expect(offerTypes).toEqual(["main", "orderbump"]);
  });

  it("does not duplicate the order or items when the same webhook is resent", async () => {
    const admin = createFakeSupabase();
    const payload = makePayload("purchase_approved", [makeItem({ id: "item-1" })]);

    await processCaktoWebhook(payload, admin);
    const result = await processCaktoWebhook(payload, admin);

    expect(result).toEqual({ ordersUpserted: 1, itemsUpserted: 1 });
    expect(admin.tables.orders).toHaveLength(1);
    expect(admin.tables.order_items).toHaveLength(1);
  });

  it("a later status update on a resend overwrites the item's status (upsert, not insert)", async () => {
    const admin = createFakeSupabase();
    const pending = makePayload("pix_gerado", [makeItem({ id: "item-1" })]);
    const paid = makePayload("purchase_approved", [makeItem({ id: "item-1" })]);

    await processCaktoWebhook(pending, admin);
    expect(admin.tables.order_items[0].status).toBe("pending");

    await processCaktoWebhook(paid, admin);
    expect(admin.tables.order_items).toHaveLength(1);
    expect(admin.tables.order_items[0].status).toBe("paid");
  });

  it("maps pix_gerado to pending", async () => {
    const admin = createFakeSupabase();
    await processCaktoWebhook(makePayload("pix_gerado", [makeItem({ id: "item-1" })]), admin);
    expect(admin.tables.orders[0].status).toBe("pending");
  });

  it("maps refund to refunded", async () => {
    const admin = createFakeSupabase();
    await processCaktoWebhook(makePayload("refund", [makeItem({ id: "item-1" })]), admin);
    expect(admin.tables.orders[0].status).toBe("refunded");
  });

  it("processes an unknown event without throwing, status 'unknown'", async () => {
    const admin = createFakeSupabase();
    await expect(
      processCaktoWebhook(makePayload("something_new", [makeItem({ id: "item-1" })]), admin)
    ).resolves.toEqual({ ordersUpserted: 1, itemsUpserted: 1 });
    expect(admin.tables.orders[0].status).toBe("unknown");
  });

  it("converts baseAmount/discount/amount/fees to cents", async () => {
    const admin = createFakeSupabase();
    const item = makeItem({ id: "item-1", baseAmount: 100, discount: 10, amount: 90, fees: 4.5 });
    await processCaktoWebhook(makePayload("purchase_approved", [item]), admin);

    const stored = admin.tables.order_items[0];
    expect(stored.base_amount_cents).toBe(10000);
    expect(stored.discount_cents).toBe(1000);
    expect(stored.amount_cents).toBe(9000);
    expect(stored.fees_cents).toBe(450);
  });

  it("converts decimal-string amounts (Cakto's official docs format) to cents", async () => {
    const admin = createFakeSupabase();
    const item = makeItem({
      id: "item-1",
      baseAmount: "33.00",
      discount: "0",
      amount: "34.35",
      fees: "1.52",
    });
    await processCaktoWebhook(makePayload("purchase_approved", [item]), admin);

    const stored = admin.tables.order_items[0];
    expect(stored.base_amount_cents).toBe(3300);
    expect(stored.discount_cents).toBe(0);
    expect(stored.amount_cents).toBe(3435);
    expect(stored.fees_cents).toBe(152);
  });

  it("links order_items.product_id when cakto_product_id matches a known product", async () => {
    const admin = createFakeSupabase();
    admin.tables.products.push({ id: "product-uuid-1", cakto_product_id: "prod-cakto-1" });

    await processCaktoWebhook(
      makePayload("purchase_approved", [makeItem({ id: "item-1" })]),
      admin
    );

    expect(admin.tables.order_items[0].product_id).toBe("product-uuid-1");
  });

  it("leaves product_id null when there is no match yet, without failing", async () => {
    const admin = createFakeSupabase();
    await expect(
      processCaktoWebhook(makePayload("purchase_approved", [makeItem({ id: "item-1" })]), admin)
    ).resolves.toBeTruthy();
    expect(admin.tables.order_items[0].product_id).toBeNull();
  });
});
