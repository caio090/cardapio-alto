import { requireAdminSession } from "@/lib/admin/auth";
import { getProduct, listFiles, listTasks } from "@/lib/central/repo";
import { computeNextActions, unvalidatedEarlierStages } from "@/lib/central/logic";
import { STAGES, STAGE_BY_KEY, STAGE_STATUS, type StageStatus } from "@/lib/central/model";
import { Badge, Card, Flash, Help, TextLink, btnDanger, inputCls, labelCls, readFlash, type SP } from "@/components/central/ui";
import { SubmitButton } from "@/components/central/submit-button";
import { archiveProductAction, saveStageAction, updateProductMetaAction } from "../actions";

const STAGE_TONE: Record<StageStatus, string> = {
  nao_iniciado: "gray",
  em_andamento: "orange",
  concluido: "green",
  bloqueado: "red",
};

export default async function ProductOverview({ params, searchParams }: { params: Promise<{ productId: string }>; searchParams: SP }) {
  await requireAdminSession();
  const { productId } = await params;
  const { msg, err } = await readFlash(searchParams);
  const product = (await getProduct(productId))!;
  const [tasks, files] = await Promise.all([listTasks(product.id), listFiles(product.id)]);
  const actions = computeNextActions(product, tasks, files);
  const earlier = unvalidatedEarlierStages(product);

  return (
    <main className="space-y-6">
      <Flash msg={msg} err={err} />

      <Card className="border-teal-700/30 bg-gradient-to-br from-white to-teal-50/50">
        <p className="text-xs font-semibold uppercase tracking-wide text-orange-700">Próxima ação</p>
        <p className="mt-1 text-lg font-bold">{actions[0].title}</p>
        <p className="text-sm text-black/60">{actions[0].detail}</p>
        <div className="mt-3"><TextLink href={actions[0].href}>Ir para lá →</TextLink></div>
        {actions.length > 1 && (
          <ul className="mt-4 space-y-1 border-t border-black/10 pt-3 text-sm">
            {actions.slice(1).map((a) => (
              <li key={a.title}>
                <TextLink href={a.href}>{a.title}</TextLink> <span className="text-black/50">— {a.detail}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {earlier.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <strong>Etapas anteriores sem conclusão registrada:</strong> {earlier.map((s) => s.label).join(", ")}. Trabalhar na etapa atual é
          possível, mas não presuma que elas estão validadas.
        </div>
      )}

      <section>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <h2 className="text-lg font-bold">Mapa da operação</h2>
          <p className="text-xs text-black/50">Clique numa etapa para ver o que ela pede e registrar o andamento.</p>
        </div>
        <ol className="grid grid-cols-2 gap-2 sm:grid-cols-5" aria-label="Etapas">
          {STAGES.map((s, i) => {
            const st = product.stages[s.key];
            const current = s.key === product.currentStage;
            return (
              <li key={s.key}>
                <a
                  href={`#etapa-${s.key}`}
                  className={`flex h-full flex-col rounded-lg border px-3 py-2.5 text-sm transition hover:shadow ${
                    current ? "border-orange-500 bg-orange-50 ring-2 ring-orange-500/20" : "border-black/10 bg-white"
                  }`}
                >
                  <span className="text-[11px] font-semibold text-black/45">
                    {i + 1}
                    {current && " · atual"}
                  </span>
                  <span className="font-semibold leading-tight">{s.label}</span>
                  <span className="mt-1.5">
                    <Badge tone={STAGE_TONE[st.status]}>{STAGE_STATUS[st.status]}</Badge>
                  </span>
                </a>
              </li>
            );
          })}
        </ol>
      </section>

      <div className="space-y-3">
        {STAGES.map((s) => {
          const st = product.stages[s.key];
          const done = s.checklist.filter((c) => st.checklist[c.id]).length;
          return (
            <details key={s.key} id={`etapa-${s.key}`} className="group scroll-mt-6 rounded-xl border border-black/10 bg-white" open={s.key === product.currentStage}>
              <summary className="list-none [&::-webkit-details-marker]:hidden flex cursor-pointer flex-wrap items-center justify-between gap-2 px-5 py-3">
                <span className="font-semibold">
                  <span className="mr-1.5 inline-block transition-transform group-open:rotate-90">›</span>
                  {s.label}
                </span>
                <span className="flex items-center gap-2 text-xs text-black/50">
                  {done}/{s.checklist.length} verificações <Badge tone={STAGE_TONE[st.status]}>{STAGE_STATUS[st.status]}</Badge>
                </span>
              </summary>
              <div className="space-y-4 border-t border-black/10 px-5 py-4">
                <Help label="O que esta etapa pede" {...s.help} />
                <div className="grid gap-3 text-sm sm:grid-cols-3">
                  <div>
                    <p className={labelCls}>Insumos</p>
                    <ul className="mt-1 list-disc pl-5 text-black/75">{s.insumos.map((x) => <li key={x}>{x}</li>)}</ul>
                  </div>
                  <div>
                    <p className={labelCls}>Entregas</p>
                    <ul className="mt-1 list-disc pl-5 text-black/75">{s.entregas.map((x) => <li key={x}>{x}</li>)}</ul>
                  </div>
                  <div>
                    <p className={labelCls}>Depende de</p>
                    <p className="mt-1 text-black/75">
                      {s.dependencias.length
                        ? s.dependencias.map((d) => `${STAGE_BY_KEY[d].label} (${STAGE_STATUS[product.stages[d].status].toLowerCase()})`).join(", ")
                        : "—"}
                    </p>
                  </div>
                </div>
                <form action={saveStageAction.bind(null, product.id, s.key)} className="space-y-3">
                  <fieldset>
                    <legend className={labelCls}>Verificações</legend>
                    <div className="mt-1 space-y-1.5">
                      {s.checklist.map((c) => (
                        <label key={c.id} className="flex items-start gap-2 text-sm">
                          <input type="checkbox" name={`chk_${c.id}`} defaultChecked={Boolean(st.checklist[c.id])} className="mt-0.5" />
                          <span>
                            {c.text}{" "}
                            {c.kind === "teste_real" && <Badge tone="violet">teste real</Badge>}
                            {c.kind === "cadastro" && <Badge tone="gray">só cadastro</Badge>}
                          </span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div>
                      <label className={labelCls}>Situação</label>
                      <select name="status" defaultValue={st.status} className={inputCls}>
                        {Object.entries(STAGE_STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Responsável</label>
                      <input name="responsavel" defaultValue={st.responsavel} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Evidência de conclusão</label>
                      <input name="evidenciaConclusao" defaultValue={st.evidenciaConclusao} className={inputCls} placeholder="Obrigatória para concluir" />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Notas</label>
                    <textarea name="notas" defaultValue={st.notas} rows={2} className={inputCls} />
                  </div>
                  <SubmitButton>Salvar etapa</SubmitButton>
                </form>
              </div>
            </details>
          );
        })}
      </div>

      <Card>
        <h2 className="font-semibold">Dados do produto</h2>
        <form action={updateProductMetaAction.bind(null, product.id)} className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Nome</label>
            <input name="name" defaultValue={product.name} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Nicho</label>
            <input name="niche" defaultValue={product.niche} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Versão</label>
            <input name="versionLabel" defaultValue={product.versionLabel} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Responsáveis</label>
            <input name="responsaveis" defaultValue={product.responsaveis} className={inputCls} placeholder="Quem decide, quem executa" />
          </div>
          <div>
            <label className={labelCls}>Etapa atual</label>
            <select name="currentStage" defaultValue={product.currentStage} className={inputCls}>
              {STAGES.map((s, i) => <option key={s.key} value={s.key}>{i + 1}. {s.label}</option>)}
            </select>
          </div>
          <label className="flex items-center gap-2 self-end pb-2 text-sm">
            <input type="checkbox" name="dadosFicticios" defaultChecked={product.dadosFicticios} /> Dados fictícios (demonstração)
          </label>
          <div className="sm:col-span-2">
            <label className={labelCls}>Descrição curta</label>
            <textarea name="descricao" defaultValue={product.descricao} rows={2} className={inputCls} />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 sm:col-span-2">
            <SubmitButton>Salvar dados</SubmitButton>
          </div>
        </form>
        <form action={archiveProductAction.bind(null, product.id)} className="mt-4 border-t border-black/10 pt-3">
          <SubmitButton className={btnDanger} pendingText="Arquivando…" confirmText="Arquivar este produto? Os dados continuam guardados.">
            Arquivar produto
          </SubmitButton>
        </form>
      </Card>
    </main>
  );
}
