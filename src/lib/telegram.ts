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

function buildMessage(input: DiagnosticNotificationInput): string {
  const location = [input.city, input.state].filter(Boolean).join(" / ");

  return [
    "🍽️ <b>NOVO DIAGNÓSTICO</b>",
    "CARDÁPIO ALTO",
    "",
    `<b>Nome:</b>\n${field(input.name)}`,
    "",
    `<b>Negócio:</b>\n${field(input.businessName)}`,
    "",
    `<b>Tipo:</b>\n${field(input.businessType)}`,
    "",
    `<b>WhatsApp:</b>\n${field(input.phone)}`,
    "",
    `<b>Instagram:</b>\n${field(input.instagram)}`,
    "",
    `<b>Cidade:</b>\n${location ? escapeHtml(location) : FALLBACK}`,
    "",
    `<b>Origem:</b>\n${field(input.source)}`,
    "",
    "<b>Status:</b>\nNovo lead",
  ].join("\n");
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
