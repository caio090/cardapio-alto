import { headers } from "next/headers";
import { requireAdminSession } from "@/lib/admin/auth";
import { integrationsOverview } from "@/lib/central/integrations/overview";
import { STATUS_LABEL } from "@/lib/central/integrations/state";
import { driveConfig, redirectUri } from "@/lib/central/integrations/google-drive";
import { Badge, Card, Flash, Help, btnDanger, btnPrimary, formatDate, readFlash, type SP } from "@/components/central/ui";
import { SubmitButton } from "@/components/central/submit-button";
import { driveDisconnectAction, testIntegrationAction } from "../actions";

export const dynamic = "force-dynamic";

// Conexões avaliadas e ainda não ligadas. Mostradas para planejar o
// "pacote low ticket" inteiro sem fingir que já funcionam.
const PLANNED: { name: string; what: string; needs: string; cost: string }[] = [
  {
    name: "Google Agenda",
    what: "Rotina e cronograma de lançamento a partir das tarefas com data.",
    needs: "Já disponível sem conexão: exporte o arquivo .ics em cada produto (Tarefas → Agenda) e importe no Google Agenda. Sincronização automática exigiria outra autorização OAuth (escopo de agenda).",
    cost: "Sem custo.",
  },
  {
    name: "Área de membros / entrega",
    what: "Onde o comprador acessa o PDF depois do pagamento.",
    needs: "Decidir entre entrega da própria Cakto (área de membros ou e-mail) e link do Drive. Testar como comprador antes de vender.",
    cost: "Incluso na plataforma de pagamento (confirmar no painel).",
  },
  {
    name: "n8n (automações)",
    what: "Ex.: ao receber compra aprovada, registrar na planilha, avisar no WhatsApp, enviar e-mail de boas-vindas.",
    needs: "Instância n8n (local é gratuita) e um fluxo que leia os eventos já validados por este receptor — nunca o “Pix gerado” como venda.",
    cost: "Gratuito se rodar localmente; nuvem é paga.",
  },
  {
    name: "WhatsApp (relacionamento)",
    what: "Suporte e mensagens pós-compra.",
    needs: "Número dedicado, consentimento do cliente para receber mensagens e modelos aprovados. Começar manual (link wa.me) antes de automatizar.",
    cost: "API oficial cobra por conversa; definir teto antes.",
  },
];

export default async function IntegracoesPage({ searchParams }: { searchParams: SP }) {
  await requireAdminSession();
  const { msg, err } = await readFlash(searchParams);
  const items = await integrationsOverview();
  const h = await headers();
  const origin = `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host")}`;

  return (
    <main className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-orange-700">Central de Produtos</p>
        <h1 className="mt-1 text-2xl font-bold">Integrações</h1>
        <p className="mt-2 max-w-3xl text-sm text-black/65">
          “Conectado” só aparece depois de um teste real. Credenciais ficam no servidor (variáveis de ambiente ou armazenamento interno) e nunca aparecem nesta tela,
          em PDFs ou em registros.
        </p>
      </div>
      <Flash msg={msg} err={err} />
      <Help
        label="Assistente × aplicação"
        oQueE="Conexões usadas pelo assistente (ex.: o MCP da Cakto no Claude Code) não são integrações desta aplicação. A aplicação tem credenciais próprias, no servidor."
        quandoUsar="Configure cada integração só quando for usá-la."
        oQuePreparar="O mínimo pedido em cada cartão. Comece pelas leituras."
        comoAvaliar="O cartão mostra o resultado do último teste real, com data. Erro e permissão insuficiente aparecem como tal."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {items.map((it) => (
          <Card key={it.key}>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h2 className="font-semibold">{it.name}</h2>
              <Badge tone={STATUS_LABEL[it.status].tone}>{STATUS_LABEL[it.status].label}</Badge>
            </div>
            <p className="mt-1 text-sm text-black/65">{it.what}</p>
            <p className="mt-2 text-sm">
              <span className="font-medium">Situação:</span> {it.statusNote}
            </p>
            {it.doc.lastTest && (
              <p className="mt-1 text-xs text-black/50">
                Último teste: {formatDate(it.doc.lastTest.at)} — {it.doc.lastTest.ok ? "ok" : "falhou"}
              </p>
            )}
            {it.needs.length > 0 && (
              <div className="mt-3 rounded-md bg-black/[0.03] px-3 py-2 text-sm">
                <p className="font-medium">O que falta</p>
                <ul className="mt-1 list-disc pl-5 text-black/70">{it.needs.map((n) => <li key={n}>{n}</li>)}</ul>
              </div>
            )}
            {it.key === "google_drive" && driveConfig() && (
              <p className="mt-2 break-all text-xs text-black/50">Endereço de retorno OAuth: {redirectUri(origin)}</p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              {it.canTest && (
                <form action={testIntegrationAction.bind(null, it.key)}>
                  <SubmitButton pendingText="Testando…">Testar agora</SubmitButton>
                </form>
              )}
              {it.key === "google_drive" && driveConfig() && (
                // Rota de servidor que redireciona para o consentimento do Google: precisa de navegação completa.
                // eslint-disable-next-line @next/next/no-html-link-for-pages
                <a className={btnPrimary} href="/admin/central/integracoes/google/iniciar">
                  {it.status === "credencial_presente" ? "Conectar conta Google" : "Reconectar conta Google"}
                </a>
              )}
              {it.key === "google_drive" && it.canTest && (
                <form action={driveDisconnectAction}>
                  <SubmitButton className={btnDanger} pendingText="…" confirmText="Desconectar o Google Drive desta aplicação?">Desconectar</SubmitButton>
                </form>
              )}
            </div>
            {it.key === "cakto_api" && (
              <p className="mt-3 text-xs text-black/50">
                Leitura feita pelo assistente via MCP oficial da Cakto em 06/11/2026 (não é desta aplicação): escopos read, products, offers, orders,
                subscriptions, webhooks, payments, nfse; produto “LKT PNG” ativo a R$ 19,90, 0 pedidos; nenhum webhook cadastrado via API.
              </p>
            )}
          </Card>
        ))}
      </div>

      <section>
        <h2 className="text-lg font-bold">Mapa de conexões do pacote low ticket (planejadas, não ligadas)</h2>
        <p className="mb-3 max-w-3xl text-sm text-black/60">
          Ordem sugerida: entrega testada → medição → relacionamento. Nada abaixo envia mensagens ou gasta dinheiro.
        </p>
        <div className="grid gap-3 lg:grid-cols-2">
          {PLANNED.map((p) => (
            <Card key={p.name}>
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold">{p.name}</h3>
                <Badge tone="gray">Não iniciado</Badge>
              </div>
              <p className="mt-1 text-sm text-black/65">{p.what}</p>
              <p className="mt-2 text-sm"><span className="font-medium">Como:</span> {p.needs}</p>
              <p className="mt-1 text-sm"><span className="font-medium">Custo:</span> {p.cost}</p>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
