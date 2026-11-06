import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sanitizeCaktoPayload } from "@/lib/cakto/sanitize";
import { processCaktoWebhook } from "@/lib/cakto/process";
import { verifyCaktoRequest } from "@/lib/cakto/verify";
import type { CaktoDataItem, CaktoWebhookPayload } from "@/lib/cakto/types";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 300_000;

// Receptor de webhooks da Cakto. Comportamento conforme a documentação
// oficial (docs.cakto.com.br/conceitos/webhooks, lida em 06/11/2026):
//  - origem: assinatura HMAC no header (preferida) ou `secret` no corpo;
//  - `data` é objeto (V1) ou lista (V2) — os dois são aceitos;
//  - checkout_abandonment não tem `data.id`: só é registrado, não vira pedido;
//  - entregas repetidas e fora de ordem: idempotência por `data.id` e
//    precedência de status (ver src/lib/cakto/status.ts);
//  - resposta não-2xx NÃO é reenviada automaticamente pela Cakto: falhas
//    ficam registradas em cakto_events e no histórico da Cakto para reenvio manual.
export async function POST(request: NextRequest) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false, error: "payload_too_large" }, { status: 413 });
  }

  // Corpo cru: a assinatura é calculada sobre os bytes recebidos, antes do parse.
  const rawBody = await request.text();
  if (rawBody.length > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false, error: "payload_too_large" }, { status: 413 });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  if (typeof parsed !== "object" || parsed === null) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }

  const body = parsed as { secret?: unknown; event?: unknown; data?: unknown };

  const verification = verifyCaktoRequest({
    rawBody,
    signatureHeader: request.headers.get("x-cakto-signature"),
    timestampHeader: request.headers.get("x-cakto-timestamp"),
    bodySecret: body.secret,
    secret: process.env.CAKTO_WEBHOOK_SECRET,
  });
  if (!verification.ok) {
    // Nunca registrar o corpo de uma requisição não autenticada.
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const isList = Array.isArray(body.data);
  const isObject = typeof body.data === "object" && body.data !== null && !isList;
  if (typeof body.event !== "string" || (!isList && !isObject)) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }

  const items = (isList ? body.data : [body.data]) as CaktoDataItem[];
  const payload: CaktoWebhookPayload = { secret: "", event: body.event, data: items };

  let admin;
  try {
    admin = createAdminClient();
  } catch (error) {
    console.error("[cakto-webhook] Supabase admin client indisponível:", error instanceof Error ? error.message : error);
    return NextResponse.json({ ok: false, error: "storage_unavailable" }, { status: 500 });
  }

  // Registrado a cada chamada, inclusive repetições — mostra reenvios da Cakto.
  const sanitizedPayload = sanitizeCaktoPayload({ ...body, data: items });
  const firstCheckoutId = items.length > 0 ? String(items[0]?.checkout ?? items[0]?.id ?? "") || null : null;

  const { data: eventRow, error: eventLogError } = await admin
    .from("cakto_events")
    .insert({
      event: payload.event,
      cakto_checkout_id: firstCheckoutId,
      item_count: items.length,
      payload: sanitizedPayload,
    })
    .select("id")
    .single();

  if (eventLogError) {
    console.error("[cakto-webhook] falha ao registrar evento:", eventLogError.message);
  }

  if (payload.event === "checkout_abandonment") {
    // Forma própria, sem pedido: só fica no registro de eventos.
    if (eventRow) await admin.from("cakto_events").update({ processed: true }).eq("id", eventRow.id);
    return NextResponse.json({ ok: true, ordersUpserted: 0, itemsUpserted: 0, note: "abandono_registrado" });
  }

  try {
    const result = await processCaktoWebhook(payload, admin);

    if (eventRow) {
      await admin.from("cakto_events").update({ processed: true }).eq("id", eventRow.id);
    }

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown_error";
    console.error("[cakto-webhook] falha ao processar payload:", message);
    if (eventRow) {
      await admin.from("cakto_events").update({ error: message }).eq("id", eventRow.id);
    }
    return NextResponse.json({ ok: false, error: "processing_failed" }, { status: 500 });
  }
}
