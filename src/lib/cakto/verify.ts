import { createHmac, timingSafeEqual } from "node:crypto";

export const SIGNATURE_TOLERANCE_SECONDS = 5 * 60;

function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export type VerifyResult =
  | { ok: true; method: "assinatura" | "secret_no_corpo" }
  | { ok: false; reason: "secret_nao_configurado" | "assinatura_invalida" | "timestamp_fora_da_janela" | "secret_invalido" };

// Validação oficial (docs.cakto.com.br/conceitos/webhooks, lido em 06/11/2026):
//   X-Cakto-Signature: v1=<hmac-sha256(secret, `${timestamp}.${corpo cru}`)>
//   X-Cakto-Timestamp: unix seconds — rejeita entregas fora de 5 min (replay)
// Se os headers não vierem, aceita o `secret` do corpo (método antigo, ainda
// enviado em toda entrega), com comparação em tempo constante.
export function verifyCaktoRequest(input: {
  rawBody: string;
  signatureHeader: string | null;
  timestampHeader: string | null;
  bodySecret: unknown;
  secret: string | undefined;
  nowSeconds?: number;
}): VerifyResult {
  const { secret } = input;
  if (!secret) return { ok: false, reason: "secret_nao_configurado" };

  if (input.signatureHeader) {
    const ts = Number(input.timestampHeader);
    const now = input.nowSeconds ?? Math.floor(Date.now() / 1000);
    if (!Number.isFinite(ts) || Math.abs(now - ts) > SIGNATURE_TOLERANCE_SECONDS) {
      return { ok: false, reason: "timestamp_fora_da_janela" };
    }
    const expected = `v1=${createHmac("sha256", secret).update(`${input.timestampHeader}.`).update(input.rawBody).digest("hex")}`;
    // Em transição de versão o header pode trazer várias assinaturas separadas por vírgula.
    const candidates = input.signatureHeader.split(",").map((s) => s.trim());
    return candidates.some((c) => c.startsWith("v1=") && safeEqual(c, expected))
      ? { ok: true, method: "assinatura" }
      : { ok: false, reason: "assinatura_invalida" };
  }

  return typeof input.bodySecret === "string" && safeEqual(input.bodySecret, secret)
    ? { ok: true, method: "secret_no_corpo" }
    : { ok: false, reason: "secret_invalido" };
}
