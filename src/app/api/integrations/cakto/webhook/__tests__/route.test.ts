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
