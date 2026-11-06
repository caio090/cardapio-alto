# Criador PNG — ficha da oferta e textos da página

> Situação: **hipótese para testar**. Nenhum texto abaixo foi validado com compradores.
> Sem promessa de vendas, sem tempo fixo por imagem, sem depoimentos inventados.

## Ficha da oferta (1 página)

| Campo | Definição |
|---|---|
| Para quem | Dono ou equipe de pequena lanchonete que prepara a própria divulgação |
| Tarefa | Transformar a foto real de um lanche e os dados de uma promoção em uma imagem utilizável para postar |
| Entrega | PDF de 12 páginas: método em 5 passos, prompt-base com campos explicados, rota de recorte em PNG, variações (promoção, combo, destaque, aviso), prompts de correção, exemplo completo, tabela de problemas, rotina semanal e anexo de prompts para copiar |
| Pré-requisitos | Celular ou computador; acesso a uma ferramenta de IA que gere ou edite imagem a partir de foto (alguns planos são pagos); editor de imagem simples; fotos reais dos lanches |
| Não inclui | Artes prontas, design personalizado, postagem automática, gestão de anúncios, cardápio, garantia de vendas |
| Preço | **A definir.** Ver a ficha financeira no Corpo do Produto, seção 05 |
| Suporte | **A definir** (canal, prazo, escopo) |
| Acesso | Cakto, com modalidade de entrega a confirmar no painel |

## Campos para a tabela `products` (página `/produtos/criador-png`)

Já estão no `seed-produto.sql`. Copiados aqui para revisão:

- **name:** Criador PNG
- **headline:** Imagens dos seus lanches, com a cara da sua lanchonete.
- **short_description:** Um guia em PDF com processo passo a passo e prompts adaptáveis para preparar imagens de lanches e promoções usando suas próprias fotos e sua marca.
- **problem_headline:** A divulgação do dia a dia não pode depender de sorte.
- **problem_items:**
  - Promoção pronta, mas sem imagem à altura do lanche.
  - Cada post sai com uma cara diferente.
  - A IA inventa ingrediente, porção ou preço errado.
  - Pouco tempo entre a chapa e o celular.
- **deliverables_headline:** O que você recebe.
- **deliverables:**
  - Guia em PDF com o método em 5 passos, do preparo das fotos à publicação.
  - Prompt-base explicado campo por campo, para adaptar a qualquer lanche.
  - Rota de recorte em PNG para manter o lanche 100% original.
  - Variações prontas: promoção do dia, combo, destaque e aviso rápido.
  - Prompts de correção e tabela de problemas comuns.
  - Checklists de fidelidade e de publicação, mais um exemplo completo.
- **deliverables_note:** Você recebe orientação para executar, não artes prontas. É preciso ter acesso a uma ferramenta de IA de imagem e a um editor simples; alguns planos dessas ferramentas são pagos.
- **how_it_works:**
  1. *Prepare suas referências.* Fotos dos lanches, logo, cores e lista de ingredientes. Você faz isso uma vez.
  2. *Gere o rascunho.* Preencha o prompt-base e envie a foto real do lanche para a ferramenta.
  3. *Revise e finalize.* Confira a fidelidade, corrija o que for preciso e coloque preço e logo no editor.
- **offer_description:** Guia em PDF + prompts para copiar. Pagamento único.
- **seo_title:** Criador PNG | Imagens de lanches e promoções com IA
- **seo_description:** Guia em PDF para donos de lanchonete prepararem imagens dos próprios lanches e promoções com IA, usando fotos reais e a identidade da marca.

## Mensagens para o primeiro teste de anúncio (hipóteses)

- **Variação A, demonstração:** "Da foto do balcão ao post da promoção. Um guia em PDF mostra o passo a passo com a foto real do seu lanche."
- **Variação B, consistência:** "Todas as promoções da semana com a mesma cara da sua lanchonete. Guia em PDF com prompts adaptáveis."
- As duas deixam claro: **é um guia em PDF, não um serviço de artes**.

## Descrição curta para a Cakto

"Guia em PDF com prompts e exemplos para criar imagens de lanches e promoções com sua marca."
