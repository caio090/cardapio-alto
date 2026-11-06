import { NextResponse, type NextRequest } from "next/server";
import { hasValidAdminSession } from "@/lib/admin/auth";
import { getFile, readBinary, safeFileName } from "@/lib/central/repo";

export const runtime = "nodejs";

// Serve arquivos guardados na Central somente para quem tem sessão de admin.
// Não existe link público: o bucket é privado e esta rota exige sessão.
export async function GET(request: NextRequest, ctx: RouteContext<"/admin/central/arquivo/[fileId]">) {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { fileId } = await ctx.params;
  const file = await getFile(fileId).catch(() => null);
  if (!file || file.kind !== "arquivo") return NextResponse.json({ error: "not_found" }, { status: 404 });
  const bytes = await readBinary(file);
  if (!bytes) return NextResponse.json({ error: "conteudo_ausente" }, { status: 404 });

  // Só tipos seguros abrem no navegador; o resto (HTML, SVG...) é sempre baixado.
  const SAFE_INLINE = ["application/pdf", "image/png", "image/jpeg", "image/webp", "image/gif", "text/plain"];
  const type = file.contentType ?? "application/octet-stream";
  const download = request.nextUrl.searchParams.get("download") === "1" || !SAFE_INLINE.includes(type);
  const name = safeFileName(file.name);
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": type,
      "Content-Length": String(bytes.byteLength),
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${name}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
