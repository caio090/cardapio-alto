"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/admin/auth";
import {
  createProductAdmin,
  getProductByIdAdmin,
  updateProductAdmin,
} from "@/lib/products/repository";
import type { ProductStatus, ProductWriteInput } from "@/lib/products/types";

export interface ProductFormState {
  error?: string;
}

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const STATUSES: ProductStatus[] = ["draft", "published", "coming_soon"];

function emptyToNull(value: FormDataEntryValue | null): string | null {
  const s = String(value ?? "").trim();
  return s || null;
}

function parsePriceToCents(raw: FormDataEntryValue | null): number | null {
  const s = String(raw ?? "").trim().replace(",", ".");
  if (!s) return null;
  const value = Math.round(parseFloat(s) * 100);
  return Number.isFinite(value) ? value : NaN;
}

function parseProductForm(formData: FormData): { input: ProductWriteInput } | { error: string } {
  const slug = String(formData.get("slug") ?? "").trim().toLowerCase();
  const name = String(formData.get("name") ?? "").trim();

  if (!name) return { error: "Nome é obrigatório." };
  if (!slug || !SLUG_RE.test(slug)) {
    return { error: "Slug inválido — use letras minúsculas, números e hífens (ex: novo-produto)." };
  }

  const checkoutUrl = String(formData.get("checkoutUrl") ?? "").trim();
  if (checkoutUrl) {
    try {
      const parsed = new URL(checkoutUrl);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") throw new Error("protocol");
    } catch {
      return { error: "URL de checkout inválida — inclua https://" };
    }
  }

  const priceCents = parsePriceToCents(formData.get("priceReais"));
  if (Number.isNaN(priceCents) || (priceCents !== null && priceCents < 0)) {
    return { error: "Preço inválido." };
  }

  const compareAtPriceCents = parsePriceToCents(formData.get("compareAtPriceReais"));
  if (Number.isNaN(compareAtPriceCents) || (compareAtPriceCents !== null && compareAtPriceCents < 0)) {
    return { error: "Preço anterior inválido." };
  }

  const statusRaw = String(formData.get("status") ?? "draft");
  const status = (STATUSES as string[]).includes(statusRaw) ? (statusRaw as ProductStatus) : "draft";

  const deliverables = String(formData.get("deliverables") ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const sortOrder = Number(formData.get("sortOrder") ?? 0);

  const input: ProductWriteInput = {
    slug,
    name,
    headline: emptyToNull(formData.get("headline")),
    shortDescription: emptyToNull(formData.get("shortDescription")),
    offerDescription: emptyToNull(formData.get("offerDescription")),
    description: emptyToNull(formData.get("description")),
    checkoutProvider: emptyToNull(formData.get("checkoutProvider")),
    checkoutUrl: checkoutUrl || null,
    coverImageUrl: emptyToNull(formData.get("coverImageUrl")),
    bannerImageUrl: emptyToNull(formData.get("bannerImageUrl")),
    whatsappMessage: emptyToNull(formData.get("whatsappMessage")),
    deliverables,
    seoTitle: emptyToNull(formData.get("seoTitle")),
    seoDescription: emptyToNull(formData.get("seoDescription")),
    priceCents,
    compareAtPriceCents,
    status,
    isIndexable: formData.get("isIndexable") === "on",
    featured: formData.get("featured") === "on",
    sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
  };

  return { input };
}

function friendlyDbError(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err);
  if (message.includes("products_slug_key") || message.includes("duplicate key")) {
    return "Já existe um produto com esse slug.";
  }
  return "Não foi possível salvar o produto. Tente novamente.";
}

function revalidateCatalog(slug?: string) {
  revalidatePath("/");
  revalidatePath("/produtos");
  revalidatePath("/admin/produtos");
  if (slug) revalidatePath(`/produtos/${slug}`);
}

export async function createProductAction(
  _prevState: ProductFormState | undefined,
  formData: FormData
): Promise<ProductFormState> {
  await requireAdminSession();

  const parsed = parseProductForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  try {
    await createProductAdmin(parsed.input);
  } catch (err) {
    return { error: friendlyDbError(err) };
  }

  revalidateCatalog(parsed.input.slug);
  redirect("/admin/produtos");
}

export async function updateProductAction(
  id: string,
  _prevState: ProductFormState | undefined,
  formData: FormData
): Promise<ProductFormState> {
  await requireAdminSession();

  const parsed = parseProductForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  try {
    await updateProductAdmin(id, parsed.input);
  } catch (err) {
    return { error: friendlyDbError(err) };
  }

  revalidateCatalog(parsed.input.slug);
  redirect("/admin/produtos");
}

export async function toggleProductStatusAction(id: string, nextStatus: ProductStatus) {
  await requireAdminSession();

  const product = await getProductByIdAdmin(id);
  if (!product) return;

  await updateProductAdmin(id, { status: nextStatus });
  revalidateCatalog(product.slug);
}
