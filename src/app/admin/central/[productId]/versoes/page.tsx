import Link from "next/link";
import { requireAdminSession } from "@/lib/admin/auth";
import { getProduct, getVersion, listExperiments, listHistory, listVersions } from "@/lib/central/repo";
import { diffProducts } from "@/lib/central/logic";
import { Badge, Card, Empty, Flash, Help, btnSecondary, formatDate, inputCls, labelCls, readFlash, type SP } from "@/components/central/ui";
import { SubmitButton } from "@/components/central/submit-button";
import { saveExperimentAction, saveVersionAction } from "../../actions";

const CONCLUSAO: Record<string, { label: string; tone: string }> = {
  em_andamento: { label: "Em andamento", tone: "amber" },
  confirmada: { label: "Hipótese confirmada no contexto", tone: "green" },
  refutada: { label: "Hipótese refutada", tone: "red" },
  inconclusiva: { label: "Inconclusivo", tone: "gray" },
};

export default async function VersoesPage({ params, searchParams }: { params: Promise<{ productId: string }>; searchParams: SP }) {
  await requireAdminSession();
  const { productId } = await params;
  const { msg, err, one } = await readFlash(searchParams);
  const product = (await getProduct(productId))!;
  const [versions, history, experiments] = await Promise.all([listVersions(product.id), listHistory(product.id), listExperiments(product.id)]);

  const a = one("a");
  const b = one("b");
  const va = a ? await getVersion(a) : null;
  const vb = b && b !== "atual" ? await getVersion(b) : null;
  const diffs = va ? diffProducts(va.snapshot.product, vb ? vb.snapshot.product : product) : null;

  return (
    <main className="space-y-6">
      <Flash msg={msg} err={err} />
      <Help
        label="Versões, testes e histórico"
        oQueE="Versão = foto completa do produto (Corpo, etapas, tarefas, evidências) num momento. Registro de teste = pergunta, hipótese, método, limite, resultado e conclusão."
        quandoUsar="Salve uma versão antes e depois de mudanças importantes. Registre todo teste, inclusive os inconclusivos."
        oQuePreparar="Uma nota curta do que mudou e por quê."
        comoAvaliar="Compare duas versões para ver o que mudou de valor ou de estado. Um teste sem evidência suficiente é registrado como inconclusivo — sem inventar vencedor."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="font-semibold">Salvar versão</h2>
          <form action={saveVersionAction.bind(null, product.id)} className="mt-3 grid gap-2">
            <input name="label" placeholder={`Rótulo (atual: ${product.versionLabel})`} className={inputCls} />
            <input name="note" placeholder="O que mudou e por quê" className={inputCls} />
            <div><SubmitButton>Salvar versão</SubmitButton></div>
          </form>
        </Card>
        <Card>
          <h2 className="font-semibold">Comparar</h2>
          {versions.length === 0 ? (
            <p className="mt-2 text-sm text-black/55">Salve uma versão para comparar.</p>
          ) : (
            <form className="mt-3 flex flex-wrap items-end gap-2">
              <div>
                <label className={labelCls}>De</label>
                <select name="a" defaultValue={a ?? versions.at(-1)?.id} className={inputCls}>
                  {versions.map((v) => <option key={v.id} value={v.id}>v{v.number} — {v.label}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Para</label>
                <select name="b" defaultValue={b ?? "atual"} className={inputCls}>
                  <option value="atual">Estado atual</option>
                  {versions.map((v) => <option key={v.id} value={v.id}>v{v.number} — {v.label}</option>)}
                </select>
              </div>
              <button type="submit" className={btnSecondary}>Comparar</button>
            </form>
          )}
        </Card>
      </div>

      {diffs && (
        <Card>
          <h2 className="font-semibold">
            Diferenças: v{va!.number} → {vb ? `v${vb.number}` : "estado atual"}
          </h2>
          {diffs.length === 0 ? (
            <p className="mt-2 text-sm text-black/55">Nenhuma diferença nos campos e etapas.</p>
          ) : (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="text-black/50">
                  <tr>
                    <th className="py-1.5 pr-3 font-medium">Campo</th>
                    <th className="py-1.5 pr-3 font-medium">Antes</th>
                    <th className="py-1.5 pr-3 font-medium">Depois</th>
                    <th className="py-1.5 font-medium">Mudou</th>
                  </tr>
                </thead>
                <tbody>
                  {diffs.map((d) => (
                    <tr key={d.label} className="border-t border-black/5 align-top">
                      <td className="py-2 pr-3 font-medium">{d.label}</td>
                      <td className="py-2 pr-3 text-black/60">{d.before}</td>
                      <td className="py-2 pr-3">{d.after}</td>
                      <td className="py-2"><Badge tone="blue">{d.kind}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      <section>
        <h2 className="mb-2 text-lg font-bold">Versões salvas</h2>
        {versions.length === 0 ? (
          <Empty title="Nenhuma versão salva" />
        ) : (
          <div className="space-y-2">
            {versions.map((v) => (
              <Card key={v.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div>
                  <p className="font-semibold">v{v.number} — {v.label}</p>
                  <p className="text-xs text-black/55">{formatDate(v.createdAt)} · {v.note || "sem nota"} · {v.snapshot.tasks.length} tarefas · {v.snapshot.evidences.length} evidências</p>
                </div>
                <Link className={btnSecondary} href={`?a=${v.id}&b=atual`}>Comparar com o atual</Link>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section id="experimentos" className="scroll-mt-6">
        <h2 className="mb-2 text-lg font-bold">Registros de teste</h2>
        {experiments.length === 0 && <Empty title="Nenhum teste registrado">Use o formulário abaixo para planejar o primeiro teste antes de executá-lo.</Empty>}
        <div className="space-y-2">
          {experiments.map((e) => (
            <Card key={e.id}>
              <details>
                <summary className="list-none [&::-webkit-details-marker]:hidden flex cursor-pointer flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold">{e.pergunta}</span>
                  <Badge tone={CONCLUSAO[e.conclusao].tone}>{CONCLUSAO[e.conclusao].label}</Badge>
                </summary>
                <ExperimentForm productId={product.id} e={e} />
              </details>
            </Card>
          ))}
          <Card>
            <h3 className="font-semibold">Novo registro de teste</h3>
            <ExperimentForm productId={product.id} />
          </Card>
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-bold">Histórico de ações</h2>
        {history.length === 0 ? (
          <Empty title="Nada registrado ainda" />
        ) : (
          <Card className="p-0">
            <ul className="divide-y divide-black/5 text-sm">
              {history.slice(0, 80).map((h) => (
                <li key={h.id} className="flex flex-wrap gap-x-3 px-4 py-2">
                  <span className="w-32 shrink-0 text-xs text-black/45">{formatDate(h.createdAt)}</span>
                  <span className="font-medium">{h.action}</span>
                  {h.detail && <span className="text-black/60">{h.detail}</span>}
                </li>
              ))}
            </ul>
          </Card>
        )}
      </section>
    </main>
  );
}

function ExperimentForm({ productId, e }: { productId: string; e?: import("@/lib/central/model").ExperimentDoc }) {
  const fields: [keyof import("@/lib/central/model").ExperimentDoc, string, string][] = [
    ["pergunta", "Pergunta", "O que queremos descobrir?"],
    ["hipotese", "Hipótese", "O que esperamos e por quê"],
    ["metodo", "Método", "Como vamos testar"],
    ["limite", "Limite (verba, tempo)", "Ex.: até R$ 150, 7 dias"],
    ["criterioParada", "Critério de parada", "Falha técnica, teto atingido..."],
    ["periodo", "Período", ""],
    ["resultado", "Resultado", "O que aconteceu (com denominador)"],
    ["proximoPasso", "Próximo passo", ""],
  ];
  return (
    <form action={saveExperimentAction.bind(null, productId)} className="mt-3 grid gap-2 sm:grid-cols-2">
      {e && <input type="hidden" name="id" value={e.id} />}
      {e && <input type="hidden" name="createdAt" value={e.createdAt} />}
      {fields.map(([k, label, ph]) => (
        <div key={k}>
          <label className={labelCls}>{label}</label>
          <input name={k} defaultValue={e ? String(e[k] ?? "") : ""} placeholder={ph} className={inputCls} />
        </div>
      ))}
      <div>
        <label className={labelCls}>Conclusão</label>
        <select name="conclusao" defaultValue={e?.conclusao ?? "em_andamento"} className={inputCls}>
          {Object.entries(CONCLUSAO).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>
      <div className="flex items-end"><SubmitButton>Salvar registro</SubmitButton></div>
    </form>
  );
}
