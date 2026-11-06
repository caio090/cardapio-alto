-- Novos estados conforme o catálogo oficial de eventos da Cakto
-- (lido em 06/11/2026): pix_expirado → canceled; refund_requested →
-- refund_requested (o comprador ainda pode desistir e a venda volta a paid).

alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders add constraint orders_status_check
  check (status in ('pending', 'paid', 'refused', 'abandoned', 'refunded', 'chargeback', 'canceled', 'refund_requested', 'unknown'));

alter table public.order_items drop constraint if exists order_items_status_check;
alter table public.order_items add constraint order_items_status_check
  check (status in ('pending', 'paid', 'refused', 'abandoned', 'refunded', 'chargeback', 'canceled', 'refund_requested', 'unknown'));
