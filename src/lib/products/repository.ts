import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Product, ProductStep, ProductWriteInput } from "./types";

// Single place every product query goes through — pages and admin actions
// import from here, never from `@supabase/*` directly.

const PRODUCT_COLUMNS = [
  "id",
  "slug",
  "name",
  "headline",
  "short_description",
  "offer_description",
  "description",
  "problem_headline",
  "problem_items",
  "deliverables_headline",
  "deliverables",
  "deliverables_note",
  "how_it_works",
  "price_cents",
  "compare_at_price_cents",
  "checkout_provider",
  "checkout_url",
  "cover_image_url",
  "banner_image_url",
  "whatsapp_message",
  "seo_title",
  "seo_description",
  "status",
  "is_indexable",
  "featured",
  "sort_order",
  "created_at",
  "updated_at",
].join(", ");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: any): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    headline: row.headline,
    shortDescription: row.short_description,
    offerDescription: row.offer_description,
    description: row.description,
    problemHeadline: row.problem_headline,
    problemItems: (row.problem_items ?? []) as string[],
    deliverablesHeadline: row.deliverables_headline,
    deliverables: (row.deliverables ?? []) as string[],
    deliverablesNote: row.deliverables_note,
    howItWorks: (row.how_it_works ?? []) as ProductStep[],
    priceCents: row.price_cents,
    compareAtPriceCents: row.compare_at_price_cents,
    checkoutProvider: row.checkout_provider,
    checkoutUrl: row.checkout_url,
    coverImageUrl: row.cover_image_url,
    bannerImageUrl: row.banner_image_url,
    whatsappMessage: row.whatsapp_message,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    status: row.status,
    isIndexable: row.is_indexable,
    featured: row.featured,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toRow(input: Partial<ProductWriteInput>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (input.slug !== undefined) row.slug = input.slug;
  if (input.name !== undefined) row.name = input.name;
  if (input.headline !== undefined) row.headline = input.headline;
  if (input.shortDescription !== undefined) row.short_description = input.shortDescription;
  if (input.offerDescription !== undefined) row.offer_description = input.offerDescription;
  if (input.description !== undefined) row.description = input.description;
  if (input.checkoutProvider !== undefined) row.checkout_provider = input.checkoutProvider;
  if (input.checkoutUrl !== undefined) row.checkout_url = input.checkoutUrl;
  if (input.coverImageUrl !== undefined) row.cover_image_url = input.coverImageUrl;
  if (input.bannerImageUrl !== undefined) row.banner_image_url = input.bannerImageUrl;
  if (input.whatsappMessage !== undefined) row.whatsapp_message = input.whatsappMessage;
  if (input.deliverables !== undefined) row.deliverables = input.deliverables;
  if (input.seoTitle !== undefined) row.seo_title = input.seoTitle;
  if (input.seoDescription !== undefined) row.seo_description = input.seoDescription;
  if (input.priceCents !== undefined) row.price_cents = input.priceCents;
  if (input.compareAtPriceCents !== undefined) row.compare_at_price_cents = input.compareAtPriceCents;
  if (input.status !== undefined) row.status = input.status;
  if (input.isIndexable !== undefined) row.is_indexable = input.isIndexable;
  if (input.featured !== undefined) row.featured = input.featured;
  if (input.sortOrder !== undefined) row.sort_order = input.sortOrder;
  return row;
}

// ── Public reads — anon/RLS-scoped client, only ever sees status='published' ──
// (the `.eq("status", "published")` below is belt-and-suspenders on top of
// the RLS policy itself, not a substitute for it.)

export async function getPublishedProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_COLUMNS)
    .eq("status", "published")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("[products] falha ao buscar produtos publicados:", error);
    return [];
  }
  return (data ?? []).map(mapRow);
}

export async function getPublishedProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_COLUMNS)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    console.error("[products] falha ao buscar produto:", error);
    return null;
  }
  return data ? mapRow(data) : null;
}

// ── Admin reads/writes — service role, bypasses RLS on purpose. Every
// caller here must already be behind requireAdminSession() (see
// src/lib/admin/auth.ts) — this module does not check that itself. ──

export async function getAllProductsAdmin(): Promise<Product[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("products")
    .select(PRODUCT_COLUMNS)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapRow);
}

export async function getProductByIdAdmin(id: string): Promise<Product | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("products")
    .select(PRODUCT_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapRow(data) : null;
}

export async function createProductAdmin(input: ProductWriteInput): Promise<Product> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("products")
    .insert(toRow(input))
    .select(PRODUCT_COLUMNS)
    .single();
  if (error) throw error;
  return mapRow(data);
}

export async function updateProductAdmin(
  id: string,
  input: Partial<ProductWriteInput>
): Promise<Product> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("products")
    .update(toRow(input))
    .eq("id", id)
    .select(PRODUCT_COLUMNS)
    .single();
  if (error) throw error;
  return mapRow(data);
}
