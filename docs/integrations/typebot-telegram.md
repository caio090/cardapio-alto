# Typebot → API Cardápio Alto → Telegram

Documento para quem for configurar o bloco **HTTP Request** dentro do fluxo
do Typebot (`diagn-stico-card-pio-alto-u8npp5o`). Não contém segredos —
os valores reais vivem em `.env.local` (ambiente local) e nas env vars da
plataforma de deploy (Vercel), nunca aqui.

## 1. Endpoint

```
POST /api/integrations/typebot/diagnostic
```

Em produção: `https://<domínio-do-projeto>/api/integrations/typebot/diagnostic`.

## 2. Headers obrigatórios

| Header | Valor |
|---|---|
| `Content-Type` | `application/json` |
| `x-typebot-secret` | o valor de `TYPEBOT_WEBHOOK_SECRET` (pegue com quem tem acesso ao `.env.local` ou às env vars do deploy — nunca cole o valor em texto neste arquivo) |

Sem esse header (ou com o valor errado), o endpoint responde `401` e não
grava nada.

## 3. Body esperado

JSON, campos no nível raiz (o endpoint também aceita os mesmos campos
aninhados em `variables`, caso seja mais fácil montar assim no editor do
Typebot):

```json
{
  "name": "{{Nome}}",
  "phone": "{{WhatsApp}}",
  "businessName": "{{Nome do negócio}}",
  "businessType": "{{Tipo de negócio}}",
  "instagram": "{{Instagram}}",
  "city": "{{Cidade}}",
  "state": "{{Estado}}",
  "email": "{{E-mail}}",
  "utm_source": "{{utm_source}}",
  "utm_medium": "{{utm_medium}}",
  "utm_campaign": "{{utm_campaign}}",
  "utm_content": "{{utm_content}}",
  "utm_term": "{{utm_term}}",
  "typebot_result_id": "{{typebot result id}}"
}
```

Nenhum campo é obrigatório — o endpoint aceita payload parcial. Os nomes de
variável entre `{{ }}` acima são os nomes **sugeridos**; ajuste para os
nomes reais das variáveis já existentes no fluxo do Typebot.

### UTMs

Se o Typebot foi aberto a partir de `/diagnostico?utm_source=...`, o
Typebot já injeta automaticamente esses query params como variáveis com o
mesmo nome (comportamento nativo do `@typebot.io/js`) — normalmente não é
preciso configurar nada além de referenciar `{{utm_source}}` etc. no body
acima, se essas variáveis existirem no fluxo.

## 4. Comportamento do endpoint

1. Valida o header `x-typebot-secret`.
2. Valida e normaliza o payload (strings aparadas, limitadas a 500
   caracteres, sem quebrar em payload vazio ou parcial).
3. Grava um registro em `leads` (Supabase).
4. Grava um registro em `diagnostics` vinculado ao lead, com o payload
   bruto preservado em `raw_payload` (nada se perde, mesmo que os nomes de
   variável não batam exatamente com o esperado).
5. Envia uma notificação para o Telegram do responsável comercial.
6. Responde `{ "ok": true, "lead_id": "...", "notified": true|false }`.

Uma falha ao enviar a notificação do Telegram **não** desfaz o lead já
gravado — `notified: false` só indica que a notificação não saiu.

## 5. Variáveis de ambiente necessárias no ambiente de deploy

| Variável | Onde é usada |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | client Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | client Supabase (browser) |
| `SUPABASE_SERVICE_ROLE_KEY` | server-only — grava lead/diagnóstico ignorando RLS |
| `TYPEBOT_WEBHOOK_SECRET` | valida a origem da chamada do Typebot |
| `TELEGRAM_BOT_TOKEN` | server-only — Bot API |
| `TELEGRAM_CHAT_ID` | chat que recebe a notificação |

Nenhuma dessas variáveis pode ter o prefixo `NEXT_PUBLIC_` além das duas já
marcadas como tal.

## 6. Teste rápido (sem o Typebot)

```bash
curl -X POST http://localhost:3000/api/integrations/typebot/diagnostic \
  -H "content-type: application/json" \
  -H "x-typebot-secret: <valor de TYPEBOT_WEBHOOK_SECRET>" \
  -d '{"name":"Teste","businessName":"Restaurante Teste","phone":"(89) 90000-0000"}'
```
