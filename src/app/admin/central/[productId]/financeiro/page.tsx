import { requireAdminSession } from "@/lib/admin/auth";
import { getProduct } from "@/lib/central/repo";
import { computeFinance, type Calc } from "@/lib/central/logic";
import { metaConfig } from "@/lib/central/integrations/meta";
import type { FinanceInputs } from "@/lib/central/model";
import { Badge, Card, Flash, Help, TextLink, btnSecondary, formatDate, inputCls, labelCls, readFlash, type SP } from "@/components/central/ui";
import { SubmitButton } from "@/components/central/submit-button";
import { metaReportAction, saveFinanceAction } from "../../actions";

const money = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function Result({ label, calc, kind = "money", help }: { label: string; calc: Calc; kind?: "money" | "ratio"; help: string }) {
  return (
    <div className="rounded-lg border border-black/10 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-black/50">{label}</p>
      {calc.known ? (
        <p className={`mt-1 text-xl font-bold ${calc.value < 0 ? "text-red-700" : ""}`}>{kind === "money" ? money(calc.value) : calc.value.toFixed(2)}</p>
      ) : (
        <p className="mt-1 text-sm font-medium text-amber-800">Não calculado</p>
      )}
      <p className="mt-1 text-xs text-black/55">{calc.known ? help : calc.reason}</p>
    </div>
  );
}

const FIELDS: { key: keyof FinanceInputs; label: string; suffix?: string; group: "unit" | "period" | "cash" }[] = [
  { key: "preco", label: "Preço recebido por compra (R$)", group: "unit" },
  { key: "taxaPercentual", label: "Taxa da plataforma (%)", group: "unit" },
  { key: "taxaFixa", label: "Taxa fixa por venda (R$)", group: "unit" },
  { key: "tributosPercentual", label: "Tributos provisionados (%)", group: "unit" },
  { key: "custoVariavel", label: "Custo variável de entrega e suporte (R$)", group: "unit" },
  { key: "reembolsoPercentual", label: "Provisão de reembolsos e disputas (%)", group: "unit" },
  { key: "contribuicaoDesejada", label: "Contribuição desejada por compra (R$)", group: "unit" },
  { key: "custosFixosMensais", label: "Custos fixos mensais (R$)", group: "unit" },
  { key: "gastoAnuncios", label: "Gasto com anúncios no período (R$)", group: "period" },
  { key: "comprasAprovadas", label: "Compras aprovadas (pagamento confirmado)", group: "period" },
  { key: "receitaAprovada", label: "Receita aprovada (R$)", group: "period" },
  { key: "reembolsosValor", label: "Reembolsos no período (R$)", group: "period" },
  { key: "saldoAReceber", label: "Saldo a receber (R$)", group: "cash" },
  { key: "caixaDisponivel", label: "Caixa disponível (R$)", group: "cash" },
];

export default async function FinanceiroPage({ params, searchParams }: { params: Promise<{ productId: string }>; searchParams: SP }) {
  await requireAdminSession();
  const { productId } = await params;
  const { msg, err } = await readFlash(searchParams);
  const product = (await getProduct(productId))!;
  const f = product.finance;
  const r = computeFinance(f);
  const metaReady = Boolean(metaConfig());
  const today = new Date().toISOString().slice(0, 10);
  const weekAgo = new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10);

  const input = (key: keyof FinanceInputs, label: string) => (
    <div key={key}>
      <label className={labelCls} htmlFor={key}>{label}</label>
      <input id={key} name={key} inputMode="decimal" defaultValue={f[key] === null ? "" : String(f[key]).replace(".", ",")} placeholder="desconhecido" className={inputCls} />
    </div>
  );

  return (
    <main className="space-y-6">
      <Flash msg={msg} err={err} />
      <Help
        label="Como ler os números"
        oQueE="Conta por compra (margem antes do anúncio, CPA alvo) e resultado de um período. Campo em branco = desconhecido, nunca zero."
        quandoUsar="Antes de definir preço e antes de colocar dinheiro em anúncios."
        oQuePreparar="Taxas reais da plataforma, tributos, custo de suporte. Para o período: compras APROVADAS (Pix gerado não conta)."
        comoAvaliar="CPA alvo = margem − contribuição desejada. CPA sem compra é indefinido. ROAS não é lucro. Saldo a receber não é caixa disponível."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Result label="Margem antes do anúncio" calc={r.margemAntesAnuncio} help="Preço menos taxas, tributos, custo variável e provisão de reembolso." />
        <Result label="CPA alvo" calc={r.cpaAlvo} help="Quanto pode custar cada compra preservando a contribuição desejada." />
        <Result label="ROAS de equilíbrio" calc={r.roasEquilibrio} kind="ratio" help="Abaixo disso a venda paga menos que o anúncio (antes dos custos fixos)." />
        <Result label="Contribuição no período" calc={r.contribuicaoPeriodo} help="Margem × compras aprovadas − gasto com anúncios." />
        <Result label="CPA observado" calc={r.cpaReal} help="Gasto ÷ compras aprovadas no período." />
        <Result label="ROAS observado" calc={r.roasReal} kind="ratio" help="Receita aprovada ÷ gasto. Não é lucro." />
        <Result label="Ticket médio" calc={r.ticketMedio} help="Receita ÷ compras." />
        <div className="rounded-lg border border-black/10 p-3 text-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-black/50">Caixa</p>
          <p className="mt-1">A receber: {f.saldoAReceber === null ? "desconhecido" : money(f.saldoAReceber)}</p>
          <p>Disponível: {f.caixaDisponivel === null ? "desconhecido" : money(f.caixaDisponivel)}</p>
          <p className="mt-1 text-xs text-black/55">Saldo a receber não pode financiar anúncios até cair.</p>
        </div>
      </div>

      <form action={saveFinanceAction.bind(null, product.id)} className="space-y-4">
        <Card>
          <h2 className="font-semibold">Premissas por compra</h2>
          <p className="mt-1 text-xs text-black/55">Confira taxas atuais na sua conta da plataforma. Valores informados aqui são premissas, não resultados.</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{FIELDS.filter((x) => x.group === "unit").map((x) => input(x.key, x.label))}</div>
        </Card>
        <Card>
          <h2 className="font-semibold">Resultado de um período (pagamentos)</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className={labelCls}>Período e fuso</label>
              <input name="periodo" defaultValue={f.periodo} placeholder="01/11 a 07/11/2026, Brasília" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Fonte dos dados</label>
              <input name="fonteDados" defaultValue={f.fonteDados} placeholder="Ex.: pedidos aprovados na Cakto" className={inputCls} />
            </div>
            {FIELDS.filter((x) => x.group !== "unit").map((x) => input(x.key, x.label))}
          </div>
        </Card>
        <SubmitButton>Salvar números</SubmitButton>
      </form>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold">Métricas da Meta (anúncios)</h2>
          <Badge tone="gray">somente leitura · separado dos pagamentos</Badge>
        </div>
        <p className="mt-1 text-sm text-black/60">
          Compras atribuídas pela Meta, pedidos pagos na Cakto e lucro não são a mesma medida. Totais podem divergir por período, fuso, atribuição e bloqueios.
        </p>
        {metaReady ? (
          <form action={metaReportAction.bind(null, product.id)} className="mt-3 flex flex-wrap items-end gap-2">
            <div>
              <label className={labelCls}>De</label>
              <input type="date" name="since" defaultValue={weekAgo} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Até</label>
              <input type="date" name="until" defaultValue={today} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Campanhas contendo</label>
              <input name="campaign" placeholder="ex.: criador_png" className={inputCls} />
            </div>
            <SubmitButton className={btnSecondary} pendingText="Lendo…">Ler relatório</SubmitButton>
          </form>
        ) : (
          <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900">
            Meta desconectada nesta aplicação. Veja o que falta em <TextLink href="/admin/central/integracoes">Integrações</TextLink>.
          </p>
        )}
        {(product.metaReports ?? []).length > 0 && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="text-black/50">
                <tr>
                  {["Período", "Gasto", "Impressões", "Cliques no link", "Visualizações da página", "Compras atribuídas", "Valor atribuído", "Lido em"].map((h) => (
                    <th key={h} className="py-1.5 pr-3 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {product.metaReports!.map((m) => {
                  const v = (n: number | null, isMoney = false) => (n === null ? "não medido" : isMoney ? n.toLocaleString("pt-BR", { style: "currency", currency: m.currency }) : n.toLocaleString("pt-BR"));
                  return (
                    <tr key={m.fetchedAt} className="border-t border-black/5">
                      <td className="py-2 pr-3">
                        {m.since} a {m.until}
                        <span className="block text-xs text-black/45">{m.timezone}{m.campaignFilter && ` · “${m.campaignFilter}”`}</span>
                      </td>
                      <td className="pr-3">{v(m.spend, true)}</td>
                      <td className="pr-3">{v(m.impressions)}</td>
                      <td className="pr-3">{v(m.linkClicks)}</td>
                      <td className="pr-3">{v(m.landingPageViews)}</td>
                      <td className="pr-3">{v(m.purchases)}</td>
                      <td className="pr-3">{v(m.purchaseValue, true)}</td>
                      <td className="pr-3 text-xs">{formatDate(m.fetchedAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="mt-2 text-xs text-black/50">Atribuição: configuração padrão da conta de anúncios. Não alegamos atribuição exata.</p>
          </div>
        )}
      </Card>
    </main>
  );
}
