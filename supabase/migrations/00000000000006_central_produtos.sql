-- Central de Produtos (ferramenta interna em /admin/central).
--
-- Armazena documentos JSON por coleção (produtos, versões, evidências,
-- tarefas, arquivos, criativos, histórico, integrações...). Acesso somente
-- pelo service role, usado no servidor — sem policies para anon/authenticated,
-- igual a leads/orders. Nada aqui é público.

create table public.central_docs (
  collection text not null,
  id text not null,
  product_id text,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (collection, id)
);

alter table public.central_docs enable row level security;

create index central_docs_product_idx on public.central_docs (collection, product_id);

-- Bucket privado para arquivos (referências, imagens, PDFs gerados).
-- public = false: nenhum link público é criado; os arquivos são servidos
-- pela própria aplicação, depois da verificação de sessão do admin.
insert into storage.buckets (id, name, public)
values ('central-files', 'central-files', false)
on conflict (id) do nothing;
