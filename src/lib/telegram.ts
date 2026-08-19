import "server-only";

// Telegram is notification only, never persistence. A failed send here must
// never undo or block a lead that already made it into the database — the
// caller decides what to do with the returned result, this never throws.

export interface DiagnosticNotificationInput {
  name?: string;
  businessName?: string;
  businessType?: string;
  phone?: string;
  instagram?: string;
  city?: string;
  state?: string;
  source?: string;
  principalChallenge?: string;
  averageTicket?: string;
  orderChannel?: string;
  paidTraffic?: string;
}

const FALLBACK = "Não informado";

function field(value: string | undefined): string {
  const trimmed = value?.trim();
  return trimmed ? escapeHtml(trimmed) : FALLBACK;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Presentation-only: builds a wa.me link. Never mutates the phone value
// that gets stored — this is purely for the "ABRIR WHATSAPP" link text.
function whatsappLink(phone: string | undefined): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  // Already has a country code (13 digits: 55 + 2-digit DDD + 9-digit
  // mobile, or 12 without the mobile "9") — use as-is. Otherwise assume a
  // Brazilian local number and prefix 55.
  const withCountry = digits.startsWith("55") && digits.length >= 12 ? digits : `55${digits}`;
  return `https://wa.me/${withCountry}`;
}

// Presentation-only: strips a full profile URL down to "@handle".
function instagramHandle(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const stripped = value
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
    .replace(/\/$/, "")
    .replace(/^@/, "");
  return stripped ? `@${stripped}` : undefined;
}

function buildMessage(input: DiagnosticNotificationInput): string {
  const location = [input.city, input.state].filter(Boolean).join(" - ");
  const waLink = whatsappLink(input.phone);
  const igHandle = instagramHandle(input.instagram);
  const name = input.name?.trim();
  const orderChannel = input.orderChannel?.trim();
  const paidTraffic = input.paidTraffic?.trim();

  // Negócio/WhatsApp/Segmento/Principal desafio/Ticket médio/Origem/Status
  // are always shown (fallback to "Não informado" if somehow empty).
  // Contato/Cidade/Instagram/Canal de pedidos/Tráfego pago only appear once
  // the Typebot flow actually starts collecting them — showing "Não
  // informado" for fields nothing ever sends just adds noise.
  const contactLines: string[] = [];
  if (name) contactLines.push(`👤 <b>Contato:</b> ${escapeHtml(name)}`);
  contactLines.push(`🏪 <b>Negócio:</b> ${field(input.businessName)}`);
  if (location) contactLines.push(`📍 <b>Cidade:</b> ${escapeHtml(location)}`);
  contactLines.push(
    waLink
      ? `📱 <b>WhatsApp:</b> ${field(input.phone)} — <a href="${waLink}">ABRIR WHATSAPP</a>`
      : `📱 <b>WhatsApp:</b> ${field(input.phone)}`
  );
  if (igHandle) contactLines.push(`📷 <b>Instagram:</b> ${escapeHtml(igHandle)}`);

  const diagnosticLines: string[] = [
    `Segmento: ${field(input.businessType)}`,
    `Principal desafio: ${field(input.principalChallenge)}`,
    `Ticket médio: ${field(input.averageTicket)}`,
  ];
  if (orderChannel) diagnosticLines.push(`Canal de pedidos: ${escapeHtml(orderChannel)}`);
  if (paidTraffic) diagnosticLines.push(`Tráfego pago: ${escapeHtml(paidTraffic)}`);

  const lines = [
    "🍽️ <b>NOVO DIAGNÓSTICO</b>",
    "CARDÁPIO ALTO",
    "",
    ...contactLines,
    "",
    "<b>DIAGNÓSTICO</b>",
    "",
    ...diagnosticLines,
    "",
    `Origem: ${field(input.source)}`,
    "Status: NOVO LEAD",
  ];

  return lines.join("\n");
}

export type SendDiagnosticNotificationResult =
  | { sent: true }
  | { sent: false; reason: "missing_env" | "telegram_error" };

export async function sendDiagnosticNotification(
  input: DiagnosticNotificationInput
): Promise<SendDiagnosticNotificationResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn(
      "[telegram] TELEGRAM_BOT_TOKEN ou TELEGRAM_CHAT_ID ausente — notificação pulada."
    );
    return { sent: false, reason: "missing_env" };
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: buildMessage(input),
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });

    if (!response.ok) {
      // Never log the token. The response body from Telegram's API doesn't
      // echo it back, so it's safe to log for debugging.
      const body = await response.text().catch(() => "");
      console.error("[telegram] sendMessage falhou", response.status, body);
      return { sent: false, reason: "telegram_error" };
    }

    return { sent: true };
  } catch (error) {
    console.error("[telegram] erro de rede ao enviar notificação", error);
    return { sent: false, reason: "telegram_error" };
  }
}

export async function sendTestMessage(text: string): Promise<SendDiagnosticNotificationResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return { sent: false, reason: "missing_env" };
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
    if (!response.ok) return { sent: false, reason: "telegram_error" };
    return { sent: true };
  } catch {
    return { sent: false, reason: "telegram_error" };
  }
}
