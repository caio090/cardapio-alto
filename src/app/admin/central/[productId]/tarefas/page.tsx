import { requireAdminSession } from "@/lib/admin/auth";
import { getProduct, listTasks } from "@/lib/central/repo";
import { STAGES, type TaskDoc } from "@/lib/central/model";
import { Badge, Card, Empty, Flash, Help, btnDanger, btnSecondary, inputCls, labelCls, readFlash, type SP } from "@/components/central/ui";
import { SubmitButton } from "@/components/central/submit-button";
import { createTaskAction, deleteTaskAction, updateTaskAction } from "../../actions";

const STATUS: Record<TaskDoc["status"], { label: string; tone: string }> = {
  a_fazer: { label: "A fazer", tone: "gray" },
  fazendo: { label: "Fazendo", tone: "orange" },
  feito: { label: "Feito", tone: "green" },
};

export default async function TarefasPage({ params, searchParams }: { params: Promise<{ productId: string }>; searchParams: SP }) {
  await requireAdminSession();
  const { productId } = await params;
  const { msg, err } = await readFlash(searchParams);
  const product = (await getProduct(productId))!;
  const tasks = (await listTasks(product.id)).sort((a, b) => a.order - b.order);
  const byId = Object.fromEntries(tasks.map((t) => [t.id, t]));
  const dated = tasks.filter((t) => t.prazo).sort((a, b) => a.prazo!.localeCompare(b.prazo!));
  const today = new Date().toISOString().slice(0, 10);

  return (
    <main className="space-y-6">
      <Flash msg={msg} err={err} />
      <Help
        label="Como planejar as tarefas"
        oQueE="Lista do que precisa ser feito, organizada pelas etapas do mapa da operação."
        quandoUsar="Sempre que surgir algo concreto a fazer. Uma tarefa = uma ação verificável."
        oQuePreparar="Quem faz e do que a tarefa depende."
        comoAvaliar="Só marque como feita com evidência (ex.: “comprador de teste abriu o PDF no celular em 10/11”). Cadastrar não é o mesmo que testar como comprador."
      />

      <Card id="agenda">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold">Agenda</h2>
          <a className={btnSecondary} href={`/admin/central/${product.id}/agenda`} download>Baixar agenda (.ics) para o Google Agenda</a>
        </div>
        {dated.length === 0 ? (
          <p className="mt-2 text-sm text-black/55">Nenhuma tarefa com data. Coloque uma data prevista nas tarefas para montar o cronograma — o cronograma do lançamento ainda não foi definido.</p>
        ) : (
          <ol className="mt-3 space-y-1 text-sm">
            {dated.map((t) => (
              <li key={t.id} className="flex flex-wrap gap-x-3">
                <span className={`w-24 shrink-0 font-mono ${t.status !== "feito" && t.prazo! < today ? "text-red-700" : "text-black/60"}`}>{t.prazo!.split("-").reverse().join("/")}</span>
                <a href={`#${t.id}`} className="font-medium hover:underline">{t.title}</a>
                <Badge tone={STATUS[t.status].tone}>{STATUS[t.status].label}</Badge>
                {t.status !== "feito" && t.prazo! < today && <Badge tone="red">atrasada</Badge>}
              </li>
            ))}
          </ol>
        )}
        <p className="mt-2 text-xs text-black/50">No Google Agenda: Configurações → Importar e exportar → Importar. Reimportar atualiza os mesmos eventos (mesmo identificador).</p>
      </Card>

      {tasks.length === 0 && <Empty title="Nenhuma tarefa ainda">Crie a primeira tarefa da etapa atual logo abaixo.</Empty>}

      {STAGES.map((s) => {
        const list = tasks.filter((t) => t.stageKey === s.key);
        if (!list.length) return null;
        return (
          <section key={s.key}>
            <h2 className="mb-2 flex items-center gap-2 text-lg font-bold">
              {s.label} {s.key === product.currentStage && <Badge tone="orange">etapa atual</Badge>}
            </h2>
            <div className="space-y-2">
              {list.map((t) => {
                const blockedBy = t.dependsOn.map((d) => byId[d]).filter((d) => d && d.status !== "feito");
                return (
                  <Card key={t.id} id={t.id} className="scroll-mt-6">
                    <form action={updateTaskAction.bind(null, product.id, t.id)} className="space-y-3">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <input name="title" defaultValue={t.title} aria-label="Título da tarefa" className={`${inputCls} max-w-2xl font-medium`} />
                        <div className="flex gap-1.5">
                          <Badge tone={STATUS[t.status].tone}>{STATUS[t.status].label}</Badge>
                          {blockedBy.length > 0 && <Badge tone="red" title={blockedBy.map((b) => b!.title).join("; ")}>bloqueada</Badge>}
                        </div>
                      </div>
                      {blockedBy.length > 0 && (
                        <p className="text-xs text-red-700">Depende de: {blockedBy.map((b) => b!.title).join("; ")}</p>
                      )}
                      <div className="grid gap-3 sm:grid-cols-5">
                        <div>
                          <label className={labelCls}>Data prevista</label>
                          <input type="date" name="prazo" defaultValue={t.prazo ?? ""} className={inputCls} />
                        </div>
                        <div>
                          <label className={labelCls}>Situação</label>
                          <select name="status" defaultValue={t.status} className={inputCls}>
                            {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className={labelCls}>Responsável</label>
                          <input name="responsavel" defaultValue={t.responsavel} className={inputCls} />
                        </div>
                        <div>
                          <label className={labelCls}>Etapa</label>
                          <select name="stageKey" defaultValue={t.stageKey} className={inputCls}>
                            {STAGES.map((x) => <option key={x.key} value={x.key}>{x.label}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className={labelCls}>Depende de</label>
                          <select name="dependsOn" multiple defaultValue={t.dependsOn} className={`${inputCls} h-[38px] focus:h-28`}>
                            {tasks.filter((x) => x.id !== t.id).map((x) => <option key={x.id} value={x.id}>{x.title}</option>)}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className={labelCls}>Evidência de conclusão</label>
                        <input name="evidencia" defaultValue={t.evidencia} className={inputCls} placeholder="Obrigatória para marcar como feita" />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <SubmitButton>Salvar tarefa</SubmitButton>
                      </div>
                    </form>
                    <form action={deleteTaskAction.bind(null, product.id, t.id)} className="mt-2 text-right">
                      <SubmitButton className={btnDanger} pendingText="Removendo…" confirmText="Remover esta tarefa?">Remover</SubmitButton>
                    </form>
                  </Card>
                );
              })}
            </div>
          </section>
        );
      })}

      <Card>
        <h2 className="font-semibold">Nova tarefa</h2>
        <form action={createTaskAction.bind(null, product.id)} className="mt-3 grid gap-3 sm:grid-cols-4">
          <div className="sm:col-span-2">
            <label className={labelCls}>Tarefa</label>
            <input name="title" required className={inputCls} placeholder="Ex.: Revisar o PDF no celular" />
          </div>
          <div>
            <label className={labelCls}>Etapa</label>
            <select name="stageKey" defaultValue={product.currentStage} className={inputCls}>
              {STAGES.map((x) => <option key={x.key} value={x.key}>{x.label}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Responsável</label>
            <input name="responsavel" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Data prevista</label>
            <input type="date" name="prazo" className={inputCls} />
          </div>
          <div className="sm:col-span-4">
            <SubmitButton>Criar tarefa</SubmitButton>
          </div>
        </form>
      </Card>
    </main>
  );
}
