-- "O que você recebe." varies per product (Campanhas uses "O que pode
-- compor a entrega.") — needed its own column instead of a hardcoded string
-- to avoid losing that already-approved copy.
alter table public.products add column deliverables_headline text;
