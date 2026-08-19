import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendDiagnosticNotification } from "@/lib/telegram";
import { ATTRIBUTION_COOKIE, parseAttributionCookie } from "@/lib/attribution";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 100_000;
const MAX_FIELD_LENGTH = 500;

interface DiagnosticPayload {
  // Contato / negócio
  name?: unknown;
  phone?: unknown;
  email?: unknown;
  businessName?: unknown;
  businessType?: unknown;
  instagram?: unknown;
  city?: unknown;
  state?: unknown;
  // Diagnóstico — preservados em diagnostics.raw_payload/summary, não
  // viram colunas novas em leads nesta execução.
  principalChallenge?: unknown;
  averageTicket?: unknown;
  orderChannel?: unknown;
  paidTraffic?: unknown;
  // Aquisição
  source?: unknown;
  utm_source?: unknown;
  utm_medium?: unknown;
  utm_campaign?: unknown;
  utm_content?: unknown;
  utm_term?: unknown;
  gclid?: unknown;
  fbclid?: unknown;
  landing_page?: unknown;
  referrer?: unknown;
  // Identificador
  typebot_result_id?: unknown;
  variables?: Record<string, unknown>;
}

function normalizeString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim().replace(/\s+/g, " ");
  if (!trimmed) return undefined;
  return trimmed.slice(0, MAX_FIELD_LENGTH);
}

// The Typebot flow in production sends its own variable names (Portuguese,
// snake_case) instead of our internal contract — mapped here so the flow
// itself never needs to be rebuilt to match our naming.
const TYPEBOT_ALIASES: Partial<Record<keyof DiagnosticPayload, string>> = {
  businessName: "empresa_nome",
  businessType: "segmento",
  principalChallenge: "principal_desafio",
  phone: "whatsapp",
  source: "origem",
};

// Typebot's HTTP Request block can send fields at the top level or nested
// under a "variables" object depending on how the request body is built in
// the flow — accept either shape so we don't depend on one exact layout.
// Checked in order: internal name at top level, internal name in
// `variables`, Typebot alias at top level, Typebot alias in `variables` —
// the old normalized-name contract still wins if a caller sends both.
function pick(payload: DiagnosticPayload, key: keyof DiagnosticPayload): string | undefined {
  const raw = payload as Record<string, unknown>;
  const alias = TYPEBOT_ALIASES[key];

  return (
    normalizeString(payload[key]) ??
    normalizeString(payload.variables?.[key as string]) ??
    (alias ? normalizeString(raw[alias]) : undefined) ??
    (alias ? normalizeString(payload.variables?.[alias]) : undefined)
  );
}

export async function POST(request: NextRequest) {
  const expectedSecret = process.env.TYPEBOT_WEBHOOK_SECRET;
  const receivedSecret = request.headers.get("x-typebot-secret");

  if (expectedSecret) {
    if (receivedSecret !== expectedSecret) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }
  } else {
    console.warn(
      "[typebot-webhook] TYPEBOT_WEBHOOK_SECRET não configurada — endpoint aceitando requisições sem validação de origem."
    );
  }

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

  const payload = rawBody as DiagnosticPayload;

  const lead = {
    name: pick(payload, "name"),
    phone: pick(payload, "phone"),
    email: pick(payload, "email"),
    business_name: pick(payload, "businessName"),
    business_type: pick(payload, "businessType"),
    instagram: pick(payload, "instagram"),
    city: pick(payload, "city"),
    state: pick(payload, "state"),
    source: pick(payload, "source") ?? "typebot",
    typebot_result_id: pick(payload, "typebot_result_id"),
  };

  // Diagnostic-specific answers — not lead columns, preserved on the
  // diagnostics row (raw_payload always; summary as a readable digest).
  const diagnosticAnswers = {
    principalChallenge: pick(payload, "principalChallenge"),
    averageTicket: pick(payload, "averageTicket"),
    orderChannel: pick(payload, "orderChannel"),
    paidTraffic: pick(payload, "paidTraffic"),
  };
  const summary = Object.entries(diagnosticAnswers)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}: ${v}`)
    .join(" | ") || null;

  // UTMs / click IDs / landing page / referrer: prefer whatever Typebot
  // passed through in the payload (only possible if the flow was
  // configured with prefilled variables from /diagnostico's query string);
  // fall back to our own first-touch cookie, which is only present when
  // the caller is the visitor's own browser — a server-to-server call
  // from Typebot's backend won't have it.
  const cookieStore = await cookies();
  const cookieAttribution = parseAttributionCookie(
    cookieStore.get(ATTRIBUTION_COOKIE)?.value
  );

  const attribution = {
    utm_source: pick(payload, "utm_source") ?? cookieAttribution?.utm_source,
    utm_medium: pick(payload, "utm_medium") ?? cookieAttribution?.utm_medium,
    utm_campaign: pick(payload, "utm_campaign") ?? cookieAttribution?.utm_campaign,
    utm_content: pick(payload, "utm_content") ?? cookieAttribution?.utm_content,
    utm_term: pick(payload, "utm_term") ?? cookieAttribution?.utm_term,
    gclid: pick(payload, "gclid") ?? cookieAttribution?.gclid,
    fbclid: pick(payload, "fbclid") ?? cookieAttribution?.fbclid,
    landing_page: pick(payload, "landing_page") ?? cookieAttribution?.landing_page,
    referrer: pick(payload, "referrer") ?? cookieAttribution?.referrer,
  };

  let admin;
  try {
    admin = createAdminClient();
  } catch (error) {
    console.error("[typebot-webhook] Supabase admin client indisponível:", error);
    return NextResponse.json({ ok: false, error: "storage_unavailable" }, { status: 500 });
  }

  const { data: insertedLead, error: leadError } = await admin
    .from("leads")
    .insert({ ...lead, ...attribution })
    .select("id")
    .single();

  if (leadError || !insertedLead) {
    console.error("[typebot-webhook] falha ao gravar lead:", leadError);
    return NextResponse.json({ ok: false, error: "storage_failed" }, { status: 500 });
  }

  const { error: diagnosticError } = await admin.from("diagnostics").insert({
    lead_id: insertedLead.id,
    typebot_result_id: lead.typebot_result_id,
    status: "submitted",
    submitted_at: new Date().toISOString(),
    summary,
    raw_payload: payload,
  });

  if (diagnosticError) {
    // Lead is already saved — a diagnostic-row failure is logged but not
    // fatal to the response; the lead itself is never lost.
    console.error("[typebot-webhook] falha ao gravar diagnóstico:", diagnosticError);
  }

  const notification = await sendDiagnosticNotification({
    name: lead.name,
    businessName: lead.business_name,
    businessType: lead.business_type,
    phone: lead.phone,
    instagram: lead.instagram,
    city: lead.city,
    state: lead.state,
    source: lead.source,
    principalChallenge: diagnosticAnswers.principalChallenge,
    averageTicket: diagnosticAnswers.averageTicket,
    orderChannel: diagnosticAnswers.orderChannel,
    paidTraffic: diagnosticAnswers.paidTraffic,
  });

  return NextResponse.json({
    ok: true,
    lead_id: insertedLead.id,
    notified: notification.sent,
  });
}
