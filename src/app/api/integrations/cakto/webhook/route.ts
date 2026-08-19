import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sanitizeCaktoPayload } from "@/lib/cakto/sanitize";
import { processCaktoWebhook } from "@/lib/cakto/process";
import type { CaktoWebhookPayload } from "@/lib/cakto/types";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 300_000;

export async function POST(request: NextRequest) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false, error: "payload_too_large" }, { status: 413 });
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  if (typeof rawBody !== "object" || rawBody === null) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }

  const payload = rawBody as Partial<CaktoWebhookPayload>;

  // Cakto sends the shared secret in the BODY (payload.secret), not a
  // header — confirmed from Cakto's own webhook model. Never log it,
  // either side.
  const expectedSecret = process.env.CAKTO_WEBHOOK_SECRET;
  if (!expectedSecret || payload.secret !== expectedSecret) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  if (typeof payload.event !== "string" || !Array.isArray(payload.data)) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch (error) {
    console.error("[cakto-webhook] Supabase admin client indisponível:", error);
    return NextResponse.json({ ok: false, error: "storage_unavailable" }, { status: 500 });
  }

  // Logged for every call received, replays included — that's useful
  // auditing (shows Cakto retried), separate from orders/order_items
  // idempotency below which must never duplicate a sale.
  const sanitizedPayload = sanitizeCaktoPayload(payload);
  const firstCheckoutId =
    payload.data.length > 0 ? String(payload.data[0]?.checkout ?? "") || null : null;

  const { data: eventRow, error: eventLogError } = await admin
    .from("cakto_events")
    .insert({
      event: payload.event,
      cakto_checkout_id: firstCheckoutId,
      item_count: payload.data.length,
      payload: sanitizedPayload,
    })
    .select("id")
    .single();

  if (eventLogError) {
    console.error("[cakto-webhook] falha ao registrar evento:", eventLogError);
  }

  try {
    const result = await processCaktoWebhook(payload as CaktoWebhookPayload, admin);

    if (eventRow) {
      await admin.from("cakto_events").update({ processed: true }).eq("id", eventRow.id);
    }

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("[cakto-webhook] falha ao processar payload:", error);
    if (eventRow) {
      const message = error instanceof Error ? error.message : "unknown_error";
      await admin.from("cakto_events").update({ error: message }).eq("id", eventRow.id);
    }
    return NextResponse.json({ ok: false, error: "processing_failed" }, { status: 500 });
  }
}
