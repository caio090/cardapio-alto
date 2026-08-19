export type ProductStatus = "draft" | "published" | "coming_soon";

export interface ProductStep {
  title: string;
  description: string;
}

// Mirrors public.products (see supabase/migrations/00000000000003_products_catalog.sql
// and 00000000000004_products_deliverables_headline.sql). camelCase here,
// snake_case in the DB — the repository maps between the two.
export interface Product {
  id: string;
  slug: string;
  name: string;
  headline: string | null;
  shortDescription: string | null;
  offerDescription: string | null;
  description: string | null;
  problemHeadline: string | null;
  problemItems: string[];
  deliverablesHeadline: string | null;
  deliverables: string[];
  deliverablesNote: string | null;
  howItWorks: ProductStep[];
  priceCents: number | null;
  compareAtPriceCents: number | null;
  checkoutProvider: string | null;
  checkoutUrl: string | null;
  coverImageUrl: string | null;
  bannerImageUrl: string | null;
  whatsappMessage: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  status: ProductStatus;
  isIndexable: boolean;
  featured: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

// Fields the v1 admin form (see /admin/produtos) actually edits. The richer
// per-product sections (problem_items, how_it_works, deliverables_note,
// deliverables_headline) carry over from the initial seed but aren't
// editable here yet — new products created through this form simply render
// without those optional landing-page sections.
export interface ProductWriteInput {
  slug: string;
  name: string;
  headline?: string | null;
  shortDescription?: string | null;
  offerDescription?: string | null;
  description?: string | null;
  checkoutProvider?: string | null;
  checkoutUrl?: string | null;
  coverImageUrl?: string | null;
  bannerImageUrl?: string | null;
  whatsappMessage?: string | null;
  deliverables?: string[];
  seoTitle?: string | null;
  seoDescription?: string | null;
  priceCents?: number | null;
  compareAtPriceCents?: number | null;
  status?: ProductStatus;
  isIndexable?: boolean;
  featured?: boolean;
  sortOrder?: number;
}
