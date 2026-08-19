import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_SESSION_COOKIE, isValidAdminSessionToken } from "./session";

// SHA-256 digest compare instead of a raw string compare — digests are a
// fixed 32 bytes regardless of input length, which sidesteps length-based
// timing leaks without needing node:crypto's timingSafeEqual (see
// session.ts for why this module sticks to Web Crypto throughout).
async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// CARDAPIO_ADMIN_PASSWORD lives server-side only (never NEXT_PUBLIC_*, never
// sent to the client). If it isn't set, every login attempt fails — admin
// stays locked rather than silently open.
export async function verifyAdminPassword(candidate: string): Promise<boolean> {
  const expected = process.env.CARDAPIO_ADMIN_PASSWORD;
  if (!expected || !candidate) return false;

  const [a, b] = await Promise.all([sha256Hex(candidate), sha256Hex(expected)]);
  return constantTimeEqual(a, b);
}

export async function hasValidAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  return isValidAdminSessionToken(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
}

// Defense in depth alongside proxy.ts's /admin/* gate — every protected
// page and server action calls this itself instead of trusting that the
// request already passed through the proxy matcher.
export async function requireAdminSession(): Promise<void> {
  if (!(await hasValidAdminSession())) {
    redirect("/admin");
  }
}
