import { NextResponse, type NextRequest } from "next/server";
import { hasValidAdminSession } from "@/lib/admin/auth";
import { buildAuthUrl } from "@/lib/central/integrations/google-drive";

export const runtime = "nodejs";

// Inicia o OAuth do Google (fluxo oficial). O "state" aleatório vai num
// cookie httpOnly e é conferido no retorno (proteção contra CSRF).
export async function GET(request: NextRequest) {
  if (!(await hasValidAdminSession())) return NextResponse.redirect(new URL("/admin", request.url));
  const state = crypto.randomUUID();
  let url: string;
  try {
    url = buildAuthUrl(request.nextUrl.origin, state);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.redirect(new URL(`/admin/central/integracoes?err=${encodeURIComponent(msg)}`, request.url));
  }
  const res = NextResponse.redirect(url);
  res.cookies.set("central_google_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin/central/integracoes/google",
    maxAge: 600,
  });
  return res;
}
