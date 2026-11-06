# Central de Produtos (uso interno)

Ferramenta em `/admin/central` para estruturar, produzir, lançar e acompanhar
produtos digitais — um espaço por produto. Protegida pela mesma senha do admin.

## Rodar no seu computador (sem custo, sem banco de dados)

1. Instale o Node.js 20+ e rode `npm install` na pasta do projeto.
2. Crie o arquivo `.env.local` (ele não vai para o git):

   ```
   CARDAPIO_ADMIN_PASSWORD=escolha-uma-senha
   CARDAPIO_ADMIN_SESSION_SECRET=uma-frase-longa-e-aleatoria
   CENTRAL_STORAGE=local
   ```

3. Rode `npm run dev` e abra `http://localhost:3000/admin`.

Os dados ficam na pasta `.central-data/` (produtos, versões, arquivos e PDFs).
Faça cópia dessa pasta para não perder nada — ou conecte o Google Drive para
guardar os entregáveis lá. O Supabase não é necessário nesse modo.

Para usar online (Vercel), defina `CENTRAL_STORAGE=supabase` e aplique as
migrações `00000000000006_central_produtos.sql` e `00000000000007_cakto_status_ciclo.sql`.
No Vercel o disco não é persistente: o modo local não serve lá.

## Fluxo principal

Criar produto → preencher Corpo do Produto → planejar tarefas (com data, vira
agenda .ics) → salvar versão → gerar PDFs (Corpo interno e entregável) →
organizar arquivos e links → aprovar entregável → enviar ao Drive (o link fica
anexado ao arquivo).

Regras embutidas:
- "Testado" exige método, período e resultado; "Validado" exige também fonte,
  público, amostra e limitações.
- Etapa só conclui com evidência de conclusão; tarefa só fecha com evidência e
  sem dependência aberta.
- Finanças: campo em branco é desconhecido, nunca zero; CPA sem compra é indefinido.
- Placeholder de imagem não pode ser aprovado; imagens originais não podem ser apagadas.
- Duplicar um produto copia só a estrutura.
- Nada é publicado, enviado ou cobrado automaticamente.

## Integrações (configuradas no servidor, nunca no navegador)

| Integração | Variáveis | Observação |
|---|---|---|
| Google Drive | `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET` | Cliente OAuth "aplicativo web" no Google Cloud, Drive API ativada, endereço de retorno `…/admin/central/integracoes/google/callback`. Escopo `drive.file`. Sem compartilhamento público. |
| Cakto (API) | `CAKTO_CLIENT_ID`, `CAKTO_CLIENT_SECRET` | Chave criada em Integrações → Cakto API, só com escopos de leitura. Diferente do MCP usado pelo assistente. |
| Cakto (webhook) | `CAKTO_WEBHOOK_SECRET` | URL `https://<domínio>/api/integrations/cakto/webhook`. Verifica `X-Cakto-Signature` (HMAC) ou o `secret` do corpo. Precisa de endereço público (não funciona em localhost sem túnel). |
| Meta (leitura) | `META_ACCESS_TOKEN`, `META_AD_ACCOUNT_ID`, `META_GRAPH_VERSION` | Token com `ads_read`. Somente leitura. |
| Google Agenda | — | Exporte o `.ics` em Tarefas → Agenda e importe no Google Agenda. |

O status de cada integração só vira "Testado" depois de um teste real na tela
de Integrações.
