import { NextResponse, type NextRequest } from "next/server";
import { hasValidAdminSession } from "@/lib/admin/auth";
import { driveWhoAmI, exchangeCode } from "@/lib/central/integrations/google-drive";
import { errorMessage, recordTest } from "@/lib/central/integrations/state";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const back = (kind: "msg" | "err", text: string) => {
    const res = NextResponse.redirect(new URL(`/admin/central/integracoes?${kind}=${encodeURIComponent(text)}`, request.url));
    res.cookies.delete({ name: "central_google_state", path: "/admin/central/integracoes/google" });
    return res;
  };
  if (!(await hasValidAdminSession())) return NextResponse.redirect(new URL("/admin", request.url));

  const sp = request.nextUrl.searchParams;
  if (sp.get("error")) return back("err", `Google recusou a autorização: ${sp.get("error")}`);
  const state = sp.get("state");
  const expected = request.cookies.get("central_google_state")?.value;
  if (!state || !expected || state !== expected) return back("err", "Autorização expirada ou inválida. Tente conectar de novo.");
  const code = sp.get("code");
  if (!code) return back("err", "Retorno do Google sem código de autorização.");

  try {
    const scope = await exchangeCode(request.nextUrl.origin, code);
    const user = await driveWhoAmI();
    await recordTest("google_drive", {
      ok: true,
      status: "testado",
      message: `Conta: ${user.displayName} <${user.emailAddress}>. Escopo concedido: ${scope || "drive.file"}.`,
    });
    return back("msg", "Google Drive conectado e testado.");
  } catch (e) {
    await recordTest("google_drive", { ok: false, status: "erro", message: errorMessage(e) });
    return back("err", `Google Drive: ${errorMessage(e)}`);
  }
}
