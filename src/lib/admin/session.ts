// Signed admin session token — HMAC-SHA256 via Web Crypto (`crypto.subtle`),
// not `node:crypto`. This module is imported both from Server Actions
// (Node runtime) and from proxy.ts (Edge runtime), and Web Crypto is the
// one crypto API guaranteed on both — `node:crypto`/`Buffer` are not. No JWT
// library: the token is just `${expiresAt}.${signature}`, verified by
// recomputing the HMAC and checking expiry.

export const ADMIN_SESSION_COOKIE = "ca_admin_session";
const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8h
export const ADMIN_SESSION_MAX_AGE_SECONDS = SESSION_TTL_MS / 1000;

function bufferToBase64Url(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToBytes(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const base64 = padded.padEnd(padded.length + ((4 - (padded.length % 4)) % 4), "=");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function getHmacKey(): Promise<CryptoKey> {
  const secret = process.env.CARDAPIO_ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error("CARDAPIO_ADMIN_SESSION_SECRET não configurada.");
  }
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function issueAdminSessionToken(): Promise<string> {
  const key = await getHmacKey();
  const payload = String(Date.now() + SESSION_TTL_MS);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return `${payload}.${bufferToBase64Url(signature)}`;
}

export async function isValidAdminSessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  const expiresAt = Number(payload);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;

  let key: CryptoKey;
  try {
    key = await getHmacKey();
  } catch {
    return false; // secret not configured — admin stays locked
  }

  try {
    return await crypto.subtle.verify(
      "HMAC",
      key,
      base64UrlToBytes(signature).buffer as ArrayBuffer,
      new TextEncoder().encode(payload)
    );
  } catch {
    return false; // malformed signature
  }
}
