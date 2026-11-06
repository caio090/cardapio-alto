-- Criador PNG — cadastro inicial na tabela public.products.
-- Entra como 'draft': fica invisível no site até ser publicado em /admin/produtos.
-- Preço e checkout ficam nulos de propósito (ainda não foram definidos).
-- Rodar manualmente no SQL Editor do Supabase. Idempotente pelo slug.

insert into public.products (
  slug, name, headline, short_description, offer_description,
  problem_headline, problem_items,
  deliverables_headline, deliverables, deliverables_note,
  how_it_works,
  price_cents, checkout_provider, checkout_url,
  seo_title, seo_description,
  status, is_indexable, featured, sort_order
) values (
  'criador-png',
  'Criador PNG',
  'Imagens dos seus lanches, com a cara da sua lanchonete.',
  'Um guia em PDF com processo passo a passo e prompts adaptáveis para preparar imagens de lanches e promoções usando suas próprias fotos e sua marca.',
  'Guia em PDF + prompts para copiar. Pagamento único.',
  'A divulgação do dia a dia não pode depender de sorte.',
  '[
    "Promoção pronta, mas sem imagem à altura do lanche.",
    "Cada post sai com uma cara diferente.",
    "A IA inventa ingrediente, porção ou preço errado.",
    "Pouco tempo entre a chapa e o celular."
  ]'::jsonb,
  'O que você recebe.',
  '[
    "Guia em PDF com o método em 5 passos, do preparo das fotos à publicação.",
    "Prompt-base explicado campo por campo, para adaptar a qualquer lanche.",
    "Rota de recorte em PNG para manter o lanche 100% original.",
    "Variações prontas: promoção do dia, combo, destaque e aviso rápido.",
    "Prompts de correção e tabela de problemas comuns.",
    "Checklists de fidelidade e de publicação, mais um exemplo completo."
  ]'::jsonb,
  'Você recebe orientação para executar, não artes prontas. É preciso ter acesso a uma ferramenta de IA de imagem e a um editor simples; alguns planos dessas ferramentas são pagos.',
  '[
    {"title": "Prepare suas referências", "description": "Fotos dos lanches, logo, cores e lista de ingredientes. Você faz isso uma vez."},
    {"title": "Gere o rascunho", "description": "Preencha o prompt-base e envie a foto real do lanche para a ferramenta."},
    {"title": "Revise e finalize", "description": "Confira a fidelidade, corrija o que for preciso e coloque preço e logo no editor."}
  ]'::jsonb,
  null, 'cakto', null,
  'Criador PNG | Imagens de lanches e promoções com IA',
  'Guia em PDF para donos de lanchonete prepararem imagens dos próprios lanches e promoções com IA, usando fotos reais e a identidade da marca.',
  'draft', false, false, 10
)
on conflict (slug) do nothing;
