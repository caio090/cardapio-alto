import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createFakeSupabase } from "@/lib/cakto/__tests__/fake-supabase";

const ADMIN_MOCK = vi.hoisted(() => ({ createAdminClient: vi.fn() }));
vi.mock("@/lib/supabase/admin", () => ADMIN_MOCK);

async function importRoute() {
  const mod = await import("../route");
  return mod.POST;
}

function makeRequest(body: unknown, headers: Record<string, string> = {}): Request {
  const json = typeof body === "string" ? body : JSON.stringify(body);
  return new Request("http://localhost/api/integrations/cakto/webhook", {
    method: "POST",
    headers: { "content-type": "application/json", "content-length": String(json.length), ...headers },
    body: json,
  });
}

const VALID_SECRET = "test-cakto-secret";
const VALID_ITEM = {
  id: "item-1",
  refId: "ref-1",
  customer: { name: "Ana", email: "ana@example.com", phone: "5589999999999" },
  offer: { id: "offer-1", name: "Engenharia de Cardápio", price: 147 },
  offer_type: "main",
  product: { name: "Engenharia de Cardápio", id: "prod-1", short_id: "short-1" },
  checkout: 12345,
  parent_order: null,
  status: "paid",
  baseAmount: 147,
  discount: 0,
  amount: 147,
  fees: 7.35,
};

describe("POST /api/integrations/cakto/webhook", () => {
  const originalSecret = process.env.CAKTO_WEBHOOK_SECRET;

  beforeEach(() => {
    process.env.CAKTO_WEBHOOK_SECRET = VALID_SECRET;
    ADMIN_MOCK.createAdminClient.mockReset();
    ADMIN_MOCK.createAdminClient.mockReturnValue(createFakeSupabase());
  });

  afterEach(() => {
    process.env.CAKTO_WEBHOOK_SECRET = originalSecret;
    vi.resetModules();
  });

  it("rejects invalid JSON with 400", async () => {
    const POST = await importRoute();
    const res = await POST(makeRequest("{not json") as never);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("invalid_json");
  });

  it("rejects a mismatched secret with 401 and never processes the payload", async () => {
    const POST = await importRoute();
    const res = await POST(
      makeRequest({ secret: "wrong-secret", event: "purchase_approved", data: [VALID_ITEM] }) as never
    );
    expect(res.status).toBe(401);
    expect(ADMIN_MOCK.createAdminClient).not.toHaveBeenCalled();
  });

  it("rejects when CAKTO_WEBHOOK_SECRET is not configured server-side, even with a matching body", async () => {
    delete process.env.CAKTO_WEBHOOK_SECRET;
    const POST = await importRoute();
    const res = await POST(
      makeRequest({ secret: undefined, event: "purchase_approved", data: [VALID_ITEM] }) as never
    );
    expect(res.status).toBe(401);
  });

  it("rejects a payload missing event/data with 400", async () => {
    const POST = await importRoute();
    const res = await POST(makeRequest({ secret: VALID_SECRET }) as never);
    expect(res.status).toBe(400);
  });

  it("accepts a valid purchase_approved payload and reports upserts", async () => {
    const POST = await importRoute();
    const res = await POST(
      makeRequest({ secret: VALID_SECRET, event: "purchase_approved", data: [VALID_ITEM] }) as never
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ ok: true, ordersUpserted: 1, itemsUpserted: 1 });
  });

  it("logs an unknown event without failing the request", async () => {
    const POST = await importRoute();
    const res = await POST(
      makeRequest({ secret: VALID_SECRET, event: "something_new", data: [VALID_ITEM] }) as never
    );
    expect(res.status).toBe(200);
  });

  it("never includes the secret in the logged cakto_events payload", async () => {
    const fake = createFakeSupabase();
    ADMIN_MOCK.createAdminClient.mockReturnValue(fake);

    const POST = await importRoute();
    await POST(
      makeRequest({ secret: VALID_SECRET, event: "purchase_approved", data: [VALID_ITEM] }) as never
    );

    expect(fake.tables.cakto_events).toHaveLength(1);
    expect(JSON.stringify(fake.tables.cakto_events[0].payload)).not.toContain(VALID_SECRET);
  });
});

import { createHmac } from "node:crypto";

describe("POST /api/integrations/cakto/webhook — regras da documentação oficial", () => {
  const originalSecret = process.env.CAKTO_WEBHOOK_SECRET;
  let fake: ReturnType<typeof createFakeSupabase>;

  beforeEach(() => {
    process.env.CAKTO_WEBHOOK_SECRET = VALID_SECRET;
    fake = createFakeSupabase();
    ADMIN_MOCK.createAdminClient.mockReset();
    ADMIN_MOCK.createAdminClient.mockReturnValue(fake);
  });

  afterEach(() => {
    process.env.CAKTO_WEBHOOK_SECRET = originalSecret;
    vi.resetModules();
  });

  function signed(body: object, opts: { ts?: number; secret?: string } = {}) {
    const raw = JSON.stringify(body);
    const ts = String(opts.ts ?? Math.floor(Date.now() / 1000));
    const sig = createHmac("sha256", opts.secret ?? VALID_SECRET).update(`${ts}.${raw}`).digest("hex");
    return makeRequest(raw, { "x-cakto-timestamp": ts, "x-cakto-signature": `v1=${sig}` });
  }

  it("aceita assinatura HMAC válida mesmo sem secret no corpo", async () => {
    const POST = await importRoute();
    const res = await POST(signed({ event: "purchase_approved", data: [VALID_ITEM] }) as never);
    expect(res.status).toBe(200);
  });

  it("rejeita assinatura inválida mesmo com secret correto no corpo", async () => {
    const POST = await importRoute();
    const res = await POST(
      signed({ secret: VALID_SECRET, event: "purchase_approved", data: [VALID_ITEM] }, { secret: "outro" }) as never
    );
    expect(res.status).toBe(401);
    expect(fake.tables.cakto_events).toHaveLength(0);
  });

  it("rejeita assinatura com timestamp antigo (proteção contra replay)", async () => {
    const POST = await importRoute();
    const res = await POST(
      signed({ event: "purchase_approved", data: [VALID_ITEM] }, { ts: Math.floor(Date.now() / 1000) - 3600 }) as never
    );
    expect(res.status).toBe(401);
  });

  it("aceita webhook V1 com data como objeto", async () => {
    const POST = await importRoute();
    const res = await POST(makeRequest({ secret: VALID_SECRET, event: "purchase_approved", data: VALID_ITEM }) as never);
    expect(res.status).toBe(200);
    expect(fake.tables.order_items).toHaveLength(1);
    expect(JSON.stringify(fake.tables.cakto_events[0].payload)).not.toContain(VALID_SECRET);
  });

  it("evento repetido não duplica pedido nem item, mas fica registrado como recebido", async () => {
    const POST = await importRoute();
    const body = { secret: VALID_SECRET, event: "purchase_approved", data: [VALID_ITEM] };
    await POST(makeRequest(body) as never);
    await POST(makeRequest(body) as never);
    expect(fake.tables.orders).toHaveLength(1);
    expect(fake.tables.order_items).toHaveLength(1);
    expect(fake.tables.cakto_events).toHaveLength(2);
  });

  it("pix_gerado atrasado não rebaixa compra aprovada", async () => {
    const POST = await importRoute();
    await POST(makeRequest({ secret: VALID_SECRET, event: "purchase_approved", data: [VALID_ITEM] }) as never);
    await POST(makeRequest({ secret: VALID_SECRET, event: "pix_gerado", data: [VALID_ITEM] }) as never);
    expect(fake.tables.orders[0].status).toBe("paid");
    expect(fake.tables.order_items[0].status).toBe("paid");
  });

  it("purchase_approved depois de pix_expirado vira pago", async () => {
    const POST = await importRoute();
    await POST(makeRequest({ secret: VALID_SECRET, event: "pix_expirado", data: [VALID_ITEM] }) as never);
    expect(fake.tables.orders[0].status).toBe("canceled");
    await POST(makeRequest({ secret: VALID_SECRET, event: "purchase_approved", data: [VALID_ITEM] }) as never);
    expect(fake.tables.orders[0].status).toBe("paid");
  });

  it("checkout_abandonment (sem data.id) só é registrado, sem criar pedido", async () => {
    const POST = await importRoute();
    const res = await POST(
      makeRequest({
        secret: VALID_SECRET,
        event: "checkout_abandonment",
        data: { offer: { id: "o1" }, product: { id: "p1" }, customerName: "Ana", customerEmail: "a@x.com", createdAt: "2026-11-06T10:00:00Z" },
      }) as never
    );
    expect(res.status).toBe(200);
    expect(fake.tables.orders).toHaveLength(0);
    expect(fake.tables.cakto_events).toHaveLength(1);
  });

  it("dados pessoais desnecessários não vão para o registro de eventos", async () => {
    const POST = await importRoute();
    await POST(
      makeRequest({
        secret: VALID_SECRET,
        event: "purchase_approved",
        data: { ...VALID_ITEM, customer: { ...VALID_ITEM.customer, docNumber: "12345678909" }, address: { street: "Rua X" } },
      }) as never
    );
    const logged = JSON.stringify(fake.tables.cakto_events[0].payload);
    expect(logged).not.toContain("12345678909");
    expect(logged).not.toContain("Rua X");
  });
});
