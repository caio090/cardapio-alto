-- DIG-CA-001 · schema MVP: profiles, businesses, leads, diagnostics, plans, resources.
-- RLS is enabled on every table. Tables with no client-facing use case yet
-- (leads, diagnostics pre-conversion, diagnostic_answers, crm_notes) get zero
-- policies for anon/authenticated — only the service role (server-only) can
-- touch them. That is the "leads não ficam publicamente disponíveis" rule,
-- enforced structurally instead of by convention.

create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── profiles ────────────────────────────────────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select to authenticated
  using (id = auth.uid());

create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ── businesses ──────────────────────────────────────────────────────────
create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  business_type text,
  instagram text,
  phone text,
  city text,
  state text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.businesses enable row level security;

create trigger businesses_set_updated_at
  before update on public.businesses
  for each row execute function public.set_updated_at();

-- ── business_members ───────────────────────────────────────────────────
create table public.business_members (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'manager', 'member')),
  created_at timestamptz not null default now(),
  unique (business_id, user_id)
);

alter table public.business_members enable row level security;

create policy "business_members_select_own" on public.business_members
  for select to authenticated
  using (user_id = auth.uid());

-- Now that business_members exists, businesses can be scoped by membership.
create policy "businesses_select_member" on public.businesses
  for select to authenticated
  using (
    exists (
      select 1 from public.business_members bm
      where bm.business_id = businesses.id
        and bm.user_id = auth.uid()
    )
  );

-- ── leads (staff-only — no anon/authenticated policies, service role only) ─
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  name text,
  business_name text,
  business_type text,
  phone text,
  email text,
  instagram text,
  city text,
  state text,
  status text not null default 'new'
    check (status in ('new', 'contacted', 'qualified', 'proposal', 'won', 'lost')),
  source text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  gclid text,
  fbclid text,
  landing_page text,
  referrer text,
  typebot_result_id text,
  converted_business_id uuid references public.businesses(id),
  converted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.leads enable row level security;

create trigger leads_set_updated_at
  before update on public.leads
  for each row execute function public.set_updated_at();

-- ── diagnostics ─────────────────────────────────────────────────────────
create table public.diagnostics (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete set null,
  business_id uuid references public.businesses(id) on delete set null,
  typebot_result_id text,
  status text not null default 'submitted'
    check (status in ('submitted', 'reviewed', 'archived')),
  summary text,
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.diagnostics enable row level security;

-- Client-visible once linked to their business (Fase 18: "cliente deve
-- visualizar o próprio diagnóstico"). Diagnostics still only tied to a
-- lead (business_id null) stay staff-only until conversion.
create policy "diagnostics_select_business_member" on public.diagnostics
  for select to authenticated
  using (
    business_id is not null
    and exists (
      select 1 from public.business_members bm
      where bm.business_id = diagnostics.business_id
        and bm.user_id = auth.uid()
    )
  );

create trigger diagnostics_set_updated_at
  before update on public.diagnostics
  for each row execute function public.set_updated_at();

-- ── diagnostic_answers (staff-only) ────────────────────────────────────
create table public.diagnostic_answers (
  id uuid primary key default gen_random_uuid(),
  diagnostic_id uuid not null references public.diagnostics(id) on delete cascade,
  question_key text not null,
  question_label text,
  answer text,
  sort_order integer not null default 0
);

alter table public.diagnostic_answers enable row level security;

create policy "diagnostic_answers_select_business_member" on public.diagnostic_answers
  for select to authenticated
  using (
    exists (
      select 1 from public.diagnostics d
      join public.business_members bm on bm.business_id = d.business_id
      where d.id = diagnostic_answers.diagnostic_id
        and bm.user_id = auth.uid()
    )
  );

-- ── crm_notes (staff-only) ──────────────────────────────────────────────
create table public.crm_notes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  author_user_id uuid references auth.users(id),
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.crm_notes enable row level security;

-- ── client_plans ────────────────────────────────────────────────────────
create table public.client_plans (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'a_fazer'
    check (status in ('a_fazer', 'em_andamento', 'concluido')),
  priority text not null default 'media'
    check (priority in ('baixa', 'media', 'alta')),
  responsible_party text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.client_plans enable row level security;

create policy "client_plans_select_business_member" on public.client_plans
  for select to authenticated
  using (
    exists (
      select 1 from public.business_members bm
      where bm.business_id = client_plans.business_id
        and bm.user_id = auth.uid()
    )
  );

create trigger client_plans_set_updated_at
  before update on public.client_plans
  for each row execute function public.set_updated_at();

-- ── resources / business_resources ─────────────────────────────────────
create table public.resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text,
  resource_type text,
  content text,
  external_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.resources enable row level security;

create trigger resources_set_updated_at
  before update on public.resources
  for each row execute function public.set_updated_at();

create table public.business_resources (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  resource_id uuid not null references public.resources(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (business_id, resource_id)
);

alter table public.business_resources enable row level security;

create policy "business_resources_select_business_member" on public.business_resources
  for select to authenticated
  using (
    exists (
      select 1 from public.business_members bm
      where bm.business_id = business_resources.business_id
        and bm.user_id = auth.uid()
    )
  );

-- v1: only resources explicitly assigned via business_resources are visible.
create policy "resources_select_assigned" on public.resources
  for select to authenticated
  using (
    is_active
    and exists (
      select 1 from public.business_resources br
      join public.business_members bm on bm.business_id = br.business_id
      where br.resource_id = resources.id
        and bm.user_id = auth.uid()
    )
  );
