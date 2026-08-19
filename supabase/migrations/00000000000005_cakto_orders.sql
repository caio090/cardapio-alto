-- Cakto webhook storage: orders (one row per checkout) + order_items (one
-- row per data[] entry — a checkout can carry a main offer plus an
-- orderbump) + cakto_events (raw sanitized audit log of every webhook
-- call received). Staff-only like `leads` — no anon/authenticated
-- policies, service role only (the webhook route and /admin both use
-- createAdminClient()).

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'cakto',
  cakto_checkout_id text not null,

  customer_name text,
  customer_email text,
  customer_phone text,

  status text not null default 'pending'
    check (status in ('pending', 'paid', 'refused', 'abandoned', 'refunded', 'chargeback', 'unknown')),

  payment_method text,
  payment_method_name text,
  installments integer,

  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  sck text,
  fbc text,
  fbp text,

  paid_at timestamptz,
  refunded_at timestamptz,
  chargedback_at timestamptz,
  canceled_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (provider, cakto_checkout_id)
);

alter table public.orders enable row level security;

create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,

  -- Cakto's own item identifier — the idempotency key. A resend of the
  -- same webhook must upsert the same row, never insert a duplicate.
  cakto_item_id text not null unique,
  ref_id text,

  cakto_product_id text,
  cakto_product_short_id text,
  cakto_offer_id text,
  product_id uuid references public.products(id),

  product_name text,
  offer_name text,
  offer_type text,
  parent_order_ref text,

  base_amount_cents integer,
  discount_cents integer,
  amount_cents integer,
  fees_cents integer,

  status text not null default 'pending'
    check (status in ('pending', 'paid', 'refused', 'abandoned', 'refunded', 'chargeback', 'unknown')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.order_items enable row level security;

create index order_items_order_id_idx on public.order_items (order_id);
create index order_items_product_id_idx on public.order_items (product_id);

create trigger order_items_set_updated_at
  before update on public.order_items
  for each row execute function public.set_updated_at();

create table public.cakto_events (
  id uuid primary key default gen_random_uuid(),
  event text not null,
  cakto_checkout_id text,
  item_count integer not null default 0,
  -- Sanitized before insert — never contains docNumber, birthDate, or card
  -- details. See src/lib/cakto/sanitize.ts (the only place allowed to
  -- write this column).
  payload jsonb not null,
  processed boolean not null default false,
  error text,
  received_at timestamptz not null default now()
);

alter table public.cakto_events enable row level security;

create index cakto_events_checkout_idx on public.cakto_events (cakto_checkout_id);

-- Links a webhook item back to our own catalog once the real Cakto
-- product/offer IDs are known — nullable, never blocks processing while
-- unset.
alter table public.products add column cakto_product_id text;
alter table public.products add column cakto_offer_id text;

create index products_cakto_product_id_idx on public.products (cakto_product_id)
  where cakto_product_id is not null;
