# Criador PNG — pasta do produto

Primeiro infoproduto da operação digital. Guia em PDF para que donos de pequenas
lanchonetes preparem imagens dos próprios lanches e promoções com IA, a partir de
fotos reais e da identidade da marca.

Documentos de origem (fora do repositório): *Corpo do Produto — Criador PNG v1*
e *Guia prático de operação digital*, os dois de 5/11/2026.

## O que está aqui

| Arquivo | O que é | Estado |
|---|---|---|
| `guia/criador-png-guia.html` | Fonte editável do PDF vendido ao cliente | Rascunho v0.1 |
| `guia/criador-png-guia-v0.1.pdf` | PDF gerado a partir do HTML (12 páginas) | Rascunho, **não vender ainda** |
| `oferta.md` | Ficha da oferta + textos da página de venda | Hipótese para testar |
| `validacao.md` | Roteiro de conversa, teste de aplicação e registro | Pronto para usar |
| `seed-produto.sql` | Cadastra o produto como `draft` na tabela `products` | Pronto, rodar manualmente |

## Como gerar o PDF de novo

Depois de editar o HTML, gere o PDF com o Chromium/Playwright (qualquer navegador:
Imprimir → Salvar como PDF, A4, com gráficos de fundo, também funciona).

## Pendências que impedem vender (do Corpo do Produto, seção 12)

- [ ] Testar o prompt-base e a Rota B em pelo menos uma ferramenta real; registrar
      ferramenta, data, plano e resultado.
- [ ] Inserir imagens reais de antes e depois no exemplo (com permissão de uso, ou
      com produção própria identificada como didática).
- [ ] Teste de aplicação com 3 a 5 donos de lanchonete (`validacao.md`).
- [ ] Definir preço, canal e prazo de suporte e política de atualização. Hoje estão
      como `[a definir]` no anexo do PDF.
- [ ] Capa, imagem do produto na Cakto e demonstração.
- [ ] Alinhar o nome público: o cadastro na Cakto está como **LKT PNG**.
- [ ] Preencher a ficha financeira com custos reais antes de definir o CPA alvo.
