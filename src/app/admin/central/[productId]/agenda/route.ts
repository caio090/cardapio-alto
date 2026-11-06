import { NextResponse, type NextRequest } from "next/server";
import { hasValidAdminSession } from "@/lib/admin/auth";
import { getProduct, listTasks, safeFileName } from "@/lib/central/repo";
import { buildIcs } from "@/lib/central/logic";

export const runtime = "nodejs";

export async function GET(_req: NextRequest, ctx: RouteContext<"/admin/central/[productId]/agenda">) {
  if (!(await hasValidAdminSession())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { productId } = await ctx.params;
  const product = await getProduct(productId);
  if (!product) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const ics = buildIcs(product.name, await listTasks(product.id));
  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="agenda-${safeFileName(product.name)}.ics"`,
      "Cache-Control": "private, no-store",
    },
  });
}
