import Link from "next/link";
import { requireAdminSession } from "@/lib/admin/auth";
import { listProducts, listTasks } from "@/lib/central/repo";
import { getStore } from "@/lib/central/store";
import { STAGE_BY_KEY, STAGES } from "@/lib/central/model";
import { Badge, Card, Empty, Flash, Help, PageTitle, formatDate, inputCls, labelCls, readFlash, type SP } from "@/components/central/ui";
import { SubmitButton } from "@/components/central/submit-button";
import { createProductAction, importCriadorPngAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function CentralHome({ searchParams }: { searchParams: SP }) {
  await requireAdminSession();
  const { msg, err } = await readFlash(searchParams);

  let storeError: string | null = null;
  let products: Awaited<ReturnType<typeof listProducts>> = [];
  let info: ReturnType<ReturnType<typeof getStore>["info"]> | null = null;
  try {
    info = getStore().info();
    products = await listProducts();
  } catch (e) {
    storeError = e instanceof Error ? e.message : String(e);
  }
  const taskCounts = Object.fromEntries(
    await Promise.all(
      products.map(async (p) => {
        const t = await listTasks(p.id).catch(() => []);
        return [p.id, { open: t.filter((x) => x.status !== "feito").length, total: t.length }] as const;
      })
    )
  );
  const hasCriador = products.some((p) => p.name.toLowerCase() === "criador png");

  return (
    <main>
      <PageTitle kicker="Central de Produtos" title="Seus produtos digitais">
        Um espaço para cada produto: Corpo do Produto, tarefas, arquivos, entregável, página, criativos, números e decisões.
        Nada aqui é publicado ou enviado para fora sem você mandar.
      </PageTitle>
      <Flash msg={msg} err={err} />

      {storeError ? (
        <Card className="mb-6 border-red-200">
          <p className="font-semibold text-red-800">Armazenamento indisponível</p>
          <p className="mt-1 text-sm text-red-800/80">{storeError}</p>
          <p className="mt-2 text-sm text-black/60">
            Em desenvolvimento, use <code>CENTRAL_STORAGE=local</code>. Em produção, aplique a migração{" "}
            <code>00000000000006_central_produtos.sql</code> no Supabase.
          </p>
        </Card>
      ) : (
        info && (
          <p className="mb-5 text-xs text-black/50">
            Dados em: {info.label} ({info.location}) · ambiente de {info.environment}
            {info.warning && <span className="ml-2 font-semibold text-red-700">{info.warning}</span>}
          </p>
        )
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          {products.length === 0 ? (
            <Empty
              title="Nenhum produto ainda"
              action={
                !storeError && (
                  <form action={importCriadorPngAction}>
                    <SubmitButton pendingText="Importando…">Importar Criador PNG (Corpo do Produto v1)</SubmitButton>
                  </form>
                )
              }
            >
              Importe o Criador PNG com as decisões e pendências já registradas, ou crie um produto em branco ao lado.
            </Empty>
          ) : (
            products.map((p) => {
              const stage = STAGE_BY_KEY[p.currentStage];
              const idx = STAGES.findIndex((s) => s.key === p.currentStage);
              return (
                <Link key={p.id} href={`/admin/central/${p.id}`} className="block">
                  <Card className="transition hover:border-teal-700/40 hover:shadow-md">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-bold">{p.name}</p>
                        <p className="text-sm text-black/55">{p.niche || "Nicho não informado"} · versão {p.versionLabel}</p>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {p.dadosFicticios && <Badge tone="orange">Dados fictícios</Badge>}
                        <Badge tone="blue">
                          Etapa {idx + 1}/10: {stage.label}
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-1" aria-hidden>
                      {STAGES.map((s) => (
                        <span
                          key={s.key}
                          className={`h-1.5 flex-1 rounded-full ${
                            p.stages[s.key].status === "concluido"
                              ? "bg-emerald-500"
                              : s.key === p.currentStage
                                ? "bg-orange-500"
                                : p.stages[s.key].status === "em_andamento"
                                  ? "bg-orange-300"
                                  : "bg-black/10"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-black/50">
                      {taskCounts[p.id]?.open ?? 0} tarefa(s) em aberto · atualizado em {formatDate(p.updatedAt)}
                    </p>
                  </Card>
                </Link>
              );
            })
          )}
        </div>

        <aside className="space-y-4">
          <Card>
            <h2 className="font-semibold">Novo produto</h2>
            <form action={createProductAction} className="mt-3 space-y-3">
              <div>
                <label className={labelCls} htmlFor="name">Nome de trabalho</label>
                <input id="name" name="name" required className={inputCls} placeholder="Ex.: Planilha de fluxo de caixa" />
              </div>
              <div>
                <label className={labelCls} htmlFor="niche">Nicho / público</label>
                <input id="niche" name="niche" className={inputCls} placeholder="Ex.: pequenos salões de beleza" />
              </div>
              {products.length > 0 && (
                <div>
                  <label className={labelCls} htmlFor="sourceId">Começar com a estrutura de</label>
                  <select id="sourceId" name="sourceId" className={inputCls} defaultValue="">
                    <option value="">Em branco</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (só estrutura)
                      </option>
                    ))}
                  </select>
                  <label className="mt-2 flex items-center gap-2 text-sm text-black/70">
                    <input type="checkbox" name="copyTasks" /> Copiar títulos das tarefas como modelo
                  </label>
                  <p className="mt-1 text-xs text-black/50">
                    Duplicar copia campos, etapas e seções vazias — nenhuma conclusão, evidência, preço ou arquivo é herdado.
                  </p>
                </div>
              )}
              <label className="flex items-center gap-2 text-sm text-black/70">
                <input type="checkbox" name="ficticio" /> Produto de demonstração (dados fictícios)
              </label>
              <SubmitButton pendingText="Criando…">Criar produto</SubmitButton>
            </form>
          </Card>
          {!hasCriador && products.length > 0 && !storeError && (
            <Card>
              <form action={importCriadorPngAction}>
                <p className="mb-2 text-sm text-black/65">O Criador PNG ainda não está aqui.</p>
                <SubmitButton pendingText="Importando…">Importar Criador PNG</SubmitButton>
              </form>
            </Card>
          )}
          <Help
            label="Como funciona a Central"
            oQueE="Cada produto tem seu espaço: Corpo do Produto (decisões e hipóteses), mapa da operação, tarefas, arquivos, entregável, página, criativos e números."
            quandoUsar="Do primeiro esboço de ideia até o acompanhamento das vendas."
            oQuePreparar="Nada obrigatório. Comece com o nome e preencha aos poucos — a próxima ação aparece no topo do produto."
            comoAvaliar="Toda conclusão importante tem estado (hipótese, decidido, testado, validado) e, quando testada, o registro de como foi verificada."
          />
        </aside>
      </div>
    </main>
  );
}
