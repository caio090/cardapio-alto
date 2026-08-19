-- Products catalog for the Cardápio Alto admin panel. Public pages
-- (/produtos, /produtos/[slug], Home) read this table directly — adding or
-- editing a product happens through /admin/produtos, not through code or a
-- new deploy.
--
-- Field set follows the DIG-CA-catalog spec plus a few additions (headline,
-- problem_headline/problem_items, deliverables_note, how_it_works) needed
-- to carry over the already-approved landing page copy for the three
-- initial products without losing content. Those extra fields aren't
-- editable from the v1 admin form yet — new products created there simply
-- render without those optional sections until that's built.

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique
    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,

  -- Marketing headline for the landing hero — distinct from `name`
  -- (e.g. name "Engenharia de Cardápio", headline "Seu cardápio pode
  -- estar vendendo menos do que deveria."). Falls back to `name` if null.
  headline text,

  short_description text,
  offer_description text,
  description text,

  problem_headline text,
  problem_items jsonb not null default '[]'::jsonb,

  deliverables jsonb not null default '[]'::jsonb,
  deliverables_note text,

  how_it_works jsonb not null default '[]'::jsonb,

  price_cents integer
    check (price_cents is null or price_cents >= 0),
  compare_at_price_cents integer
    check (compare_at_price_cents is null or compare_at_price_cents >= 0),

  checkout_provider text,
  checkout_url text,

  cover_image_url text,
  banner_image_url text,

  whatsapp_message text,

  seo_title text,
  seo_description text,

  status text not null default 'draft'
    check (status in ('draft', 'published', 'coming_soon')),
  is_indexable boolean not null default false,
  featured boolean not null default false,
  sort_order integer not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products enable row level security;

-- Public storefront only ever sees published products. Drafts and
-- coming_soon rows are invisible to anon/authenticated — the admin panel
-- reads/writes through the service role instead (same pattern as `leads`).
create policy "products_select_published" on public.products
  for select to anon, authenticated
  using (status = 'published');

create index products_status_sort_idx on public.products (status, sort_order);

create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();
