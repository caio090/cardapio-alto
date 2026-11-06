import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStore } from "../store";
import { caktoApiConfig } from "./cakto-api";
import { driveConfig, hasDriveToken } from "./google-drive";
import { metaMissing } from "./meta";
import { getIntegration, type IntegrationDoc, type IntegrationKey, type IntegrationStatus } from "./state";

export interface IntegrationView {
  key: IntegrationKey;
  name: string;
  what: string;
  status: IntegrationStatus;
  statusNote: string;
  needs: string[];
  doc: IntegrationDoc;
  canTest: boolean;
}

// O status nunca é "testado" só porque uma variável existe: depende do
// último teste real registrado e de ele ter ocorrido com a configuração atual.
function fromLastTest(doc: IntegrationDoc, configured: boolean): { status: IntegrationStatus; note: string } {
  if (!configured) return { status: "desconectado", note: "Sem credencial no servidor." };
  if (!doc.lastTest) return { status: "credencial_presente", note: "Configurado, mas ainda não testado." };
  return { status: doc.lastTest.status, note: doc.lastTest.message };
}

export async function integrationsOverview(): Promise<IntegrationView[]> {
  const keys: IntegrationKey[] = ["armazenamento", "google_drive", "cakto_api", "cakto_webhook", "meta", "gerador_imagem"];
  const docs = Object.fromEntries(await Promise.all(keys.map(async (k) => [k, await getIntegration(k)] as const))) as Record<
    IntegrationKey,
    IntegrationDoc
  >;

  let storeInfo;
  try {
    storeInfo = getStore().info();
  } catch (e) {
    storeInfo = null;
    docs.armazenamento.lastTest = { ok: false, status: "erro", at: new Date().toISOString(), message: String(e) };
  }

  const driveCfg = Boolean(driveConfig());
  const driveConnected = driveCfg && (await hasDriveToken().catch(() => false));
  const driveState = !driveCfg
    ? { status: "desconectado" as const, note: "Credenciais OAuth do Google não configuradas no servidor." }
    : !driveConnected
      ? { status: "credencial_presente" as const, note: "App OAuth configurado; falta autorizar uma conta Google." }
      : fromLastTest(docs.google_drive, true);

  const webhookSecret = Boolean(process.env.CAKTO_WEBHOOK_SECRET);
  let webhookState: { status: IntegrationStatus; note: string } = webhookSecret
    ? { status: "credencial_presente", note: "Segredo configurado; nenhum evento recebido verificado." }
    : { status: "desconectado", note: "CAKTO_WEBHOOK_SECRET não configurado: o receptor recusa tudo (401)." };
  if (webhookSecret) {
    try {
      const admin = createAdminClient();
      const { data, error } = await admin
        .from("cakto_events")
        .select("event,processed,error,received_at")
        .order("received_at", { ascending: false })
        .limit(5);
      if (error) webhookState = { status: "erro", note: `Não foi possível ler cakto_events: ${error.message}` };
      else if (data && data.length) {
        const last = data[0];
        webhookState = last.error
          ? { status: "erro", note: `Último evento (${last.event}) falhou: ${last.error}` }
          : { status: "testado", note: `Último evento recebido: ${last.event} em ${new Date(last.received_at).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}` };
      }
    } catch {
      webhookState = { ...webhookState, note: webhookState.note + " (Supabase indisponível neste ambiente para conferir eventos.)" };
    }
  }

  const metaMiss = metaMissing();

  return [
    {
      key: "armazenamento",
      name: "Armazenamento da Central",
      what: storeInfo
        ? `${storeInfo.label} · ${storeInfo.location} · ambiente de ${storeInfo.environment}`
        : "Indisponível",
      ...(() => {
        const st = fromLastTest(docs.armazenamento, Boolean(storeInfo));
        return { status: st.status, statusNote: storeInfo?.warning ?? st.note };
      })(),
      needs: storeInfo?.kind === "supabase" ? ["Migração 00000000000006_central_produtos.sql aplicada no Supabase"] : [],
      doc: docs.armazenamento,
      canTest: Boolean(storeInfo),
    },
    {
      key: "google_drive",
      name: "Google Drive",
      what: "Uma pasta por produto; envio e atualização de arquivos sem duplicar; link do Drive anexado ao entregável. Escopo mínimo drive.file. Nada é compartilhado publicamente.",
      status: driveState.status,
      statusNote: driveState.note,
      needs: driveCfg
        ? driveConnected
          ? []
          : ["Clicar em “Conectar conta Google” e autorizar"]
        : [
            "Projeto no Google Cloud com a Google Drive API ativada",
            "Cliente OAuth (aplicativo web) com o endereço de retorno mostrado abaixo",
            "Variáveis no servidor: GOOGLE_OAUTH_CLIENT_ID e GOOGLE_OAUTH_CLIENT_SECRET",
          ],
      doc: docs.google_drive,
      canTest: driveConnected,
    },
    {
      key: "cakto_api",
      name: "Cakto — API (backend da aplicação)",
      what: "Leitura de produtos, ofertas e contagem de pedidos pelo servidor desta aplicação (OAuth client_credentials). Não cria nem altera nada.",
      ...(() => {
        const st = fromLastTest(docs.cakto_api, Boolean(caktoApiConfig()));
        return { status: st.status, statusNote: st.note };
      })(),
      needs: caktoApiConfig()
        ? []
        : [
            "Chave de API criada no painel da Cakto (Integrações → Cakto API) só com escopos de leitura: read, products, offers, orders",
            "Variáveis no servidor: CAKTO_CLIENT_ID e CAKTO_CLIENT_SECRET",
          ],
      doc: docs.cakto_api,
      canTest: Boolean(caktoApiConfig()),
    },
    {
      key: "cakto_webhook",
      name: "Cakto — receptor de webhooks",
      what: "Recebe eventos em /api/integrations/cakto/webhook com verificação de assinatura, proteção contra repetição e ordem. Pix gerado não conta como compra.",
      status: webhookState.status,
      statusNote: webhookState.note,
      needs: [
        ...(webhookSecret ? [] : ["Variável CAKTO_WEBHOOK_SECRET no servidor (gerada pela Cakto ao criar o webhook)"]),
        "Webhook cadastrado na Cakto apontando para https://<seu-domínio>/api/integrations/cakto/webhook (em 06/11/2026 não havia nenhum cadastrado via API)",
        "Migração 00000000000007 aplicada (novos estados: cancelado, reembolso solicitado)",
      ],
      doc: docs.cakto_webhook,
      canTest: false,
    },
    {
      key: "meta",
      name: "Meta (anúncios) — somente leitura",
      what: "Gasto, impressões, cliques no link, visualizações da página, compras atribuídas e valor, por período. Separado dos pagamentos da Cakto.",
      ...(() => {
        const st = fromLastTest(docs.meta, metaMiss.length === 0);
        return { status: st.status, statusNote: st.note };
      })(),
      needs: metaMiss.length
        ? [
            "Acesso à conta de anúncios com permissão ads_read (token de usuário de sistema do Business Manager)",
            `Variáveis no servidor: ${metaMiss.join(", ")}`,
            "Conectar a Cakto não conecta a Meta",
          ]
        : [],
      doc: docs.meta,
      canTest: metaMiss.length === 0,
    },
    {
      key: "gerador_imagem",
      name: "Geração de imagens",
      what: "Nenhum provedor de geração está configurado neste projeto. Gerações feitas em ferramentas externas são registradas manualmente (prompt, provedor, modelo, data, custo) com o arquivo resultante.",
      status: "nao_configurado",
      statusNote: "Sem chamadas pagas. Nenhuma imagem é gerada automaticamente nem simulada.",
      needs: ["Escolher um provedor e um teto de custo antes de qualquer integração de geração"],
      doc: docs.gerador_imagem,
      canTest: false,
    },
  ];
}
