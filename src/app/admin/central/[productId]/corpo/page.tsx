import { requireAdminSession } from "@/lib/admin/auth";
import { getProduct, listEvidences } from "@/lib/central/repo";
import {
  BODY_FIELDS,
  BODY_GROUPS,
  DECISION_STATUS,
  EVIDENCE_KINDS,
  VALIDATION_FIELDS,
  type DecisionStatus,
} from "@/lib/central/model";
import { Badge, Card, DecisionBadge, Empty, Flash, Help, btnDanger, inputCls, labelCls, readFlash, type SP } from "@/components/central/ui";
import { SubmitButton } from "@/components/central/submit-button";
import { addEvidenceAction, removeEvidenceAction, saveBodyFieldAction } from "../../actions";

export default async function CorpoPage({ params, searchParams }: { params: Promise<{ productId: string }>; searchParams: SP }) {
  await requireAdminSession();
  const { productId } = await params;
  const { msg, err } = await readFlash(searchParams);
  const product = (await getProduct(productId))!;
  const evidences = await listEvidences(product.id);
  const counts = Object.values(product.body).reduce<Record<string, number>>((acc, f) => ((acc[f.status] = (acc[f.status] ?? 0) + 1), acc), {});

  return (
    <main className="space-y-6">
      <Flash msg={msg} err={err} />
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Help
          label="O que é o Corpo do Produto"
          oQueE="Documento interno com as decisões, hipóteses, evidências, funil, custos e próximos testes deste produto. Não é o material vendido."
          quandoUsar="Antes de produzir e a cada mudança relevante. Salve uma versão depois de mudanças importantes."
          oQuePreparar="O que você já sabe. Campo sem informação fica como Pendente — não preencha com suposições convincentes."
          comoAvaliar="“Testado” exige método, período e resultado. “Validado” exige também fonte, público, amostra e limitações."
        />
        <Card className="text-sm">
          <p className={labelCls}>Situação dos campos</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {(Object.keys(DECISION_STATUS) as DecisionStatus[]).map((s) => (
              <span key={s} className="inline-flex items-center gap-1">
                <DecisionBadge status={s} /> <span className="text-black/60">{counts[s] ?? 0}</span>
              </span>
            ))}
          </div>
        </Card>
      </div>

      {BODY_GROUPS.map((group) => (
        <section key={group}>
          <h2 className="mb-2 text-lg font-bold">{group}</h2>
          <div className="space-y-3">
            {BODY_FIELDS.filter((f) => f.group === group).map((f) => {
              const v = product.body[f.key] ?? { value: "", status: "pendente" as const };
              const needsRecord = v.status === "testado" || v.status === "validado";
              return (
                <Card key={f.key} id={`campo-${f.key}`} className="scroll-mt-6">
                  <form action={saveBodyFieldAction.bind(null, product.id, f.key)} className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label htmlFor={`val-${f.key}`} className="font-semibold">{f.label}</label>
                      <DecisionBadge status={v.status} />
                    </div>
                    <p className="-mt-2 text-xs text-black/55">{f.help}</p>
                    <textarea id={`val-${f.key}`} name="value" defaultValue={v.value} rows={f.key === "entregaveis" ? 4 : 3} placeholder={f.placeholder} className={inputCls} />
                    <div className="flex flex-wrap items-end gap-3">
                      <div>
                        <label className={labelCls}>Estado</label>
                        <select name="status" defaultValue={v.status} className={inputCls}>
                          {Object.entries(DECISION_STATUS).map(([k, d]) => (
                            <option key={k} value={k}>{d.label}</option>
                          ))}
                        </select>
                      </div>
                      <SubmitButton>Salvar</SubmitButton>
                    </div>
                    <details open={needsRecord} className="rounded-lg bg-black/[0.025] px-3 py-2">
                      <summary className="list-none [&::-webkit-details-marker]:hidden cursor-pointer text-sm font-medium text-black/70">
                        Registro do teste / validação {needsRecord ? "" : "(necessário para “Testado” e “Validado”)"}
                      </summary>
                      <div className="mt-2 grid gap-2 sm:grid-cols-2">
                        {VALIDATION_FIELDS.map((vf) => (
                          <div key={vf.key}>
                            <label className={labelCls}>{vf.label}</label>
                            <input name={`v_${vf.key}`} defaultValue={v.validation?.[vf.key] ?? ""} placeholder={vf.placeholder} className={inputCls} />
                          </div>
                        ))}
                      </div>
                    </details>
                  </form>
                </Card>
              );
            })}
          </div>
        </section>
      ))}

      <section id="evidencias" className="scroll-mt-6">
        <h2 className="mb-2 text-lg font-bold">Evidências</h2>
        <p className="mb-3 max-w-3xl text-sm text-black/60">
          Cada evidência responde a uma pergunta diferente: conversa ajuda a entender, uso verifica aplicação, compra verifica disposição de pagar.
          Pesquisa superficial e pontuação gerada por IA ficam registradas, mas nunca contam como comprovação de demanda.
        </p>
        {evidences.length === 0 ? (
          <Empty title="Nenhuma evidência registrada">Nenhuma conclusão deste produto está apoiada em uso ou compra registrados.</Empty>
        ) : (
          <div className="space-y-2">
            {evidences.map((e) => (
              <Card key={e.id}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{e.title}</p>
                    <p className="text-xs text-black/55">
                      {EVIDENCE_KINDS[e.kind].label} · {EVIDENCE_KINDS[e.kind].strength}
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    {e.ficticio && <Badge tone="orange">Fictícia</Badge>}
                    {!EVIDENCE_KINDS[e.kind].provesDemand && <Badge tone="gray">não comprova demanda</Badge>}
                  </div>
                </div>
                <dl className="mt-2 grid gap-x-4 gap-y-1 text-sm sm:grid-cols-2">
                  {VALIDATION_FIELDS.map((vf) => (
                    <div key={vf.key}>
                      <dt className="inline font-medium text-black/60">{vf.label}: </dt>
                      <dd className="inline">{e[vf.key] || <span className="text-black/40">não informado</span>}</dd>
                    </div>
                  ))}
                </dl>
                <form action={removeEvidenceAction.bind(null, product.id, e.id)} className="mt-2">
                  <SubmitButton className={btnDanger} pendingText="Removendo…" confirmText="Remover esta evidência?">Remover</SubmitButton>
                </form>
              </Card>
            ))}
          </div>
        )}
        <Card className="mt-3">
          <h3 className="font-semibold">Registrar evidência</h3>
          <form action={addEvidenceAction.bind(null, product.id)} className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelCls}>Resumo</label>
              <input name="title" required className={inputCls} placeholder="Ex.: Teste de aplicação com 4 donos de lanchonete" />
            </div>
            <div>
              <label className={labelCls}>Tipo</label>
              <select name="kind" className={inputCls}>
                {Object.entries(EVIDENCE_KINDS).map(([k, d]) => <option key={k} value={k}>{d.label}</option>)}
              </select>
            </div>
            <label className="flex items-center gap-2 self-end pb-2 text-sm">
              <input type="checkbox" name="ficticio" /> Exemplo fictício
            </label>
            {VALIDATION_FIELDS.map((vf) => (
              <div key={vf.key}>
                <label className={labelCls}>{vf.label}</label>
                <input name={vf.key} placeholder={vf.placeholder} className={inputCls} />
              </div>
            ))}
            <div className="sm:col-span-2">
              <SubmitButton>Registrar evidência</SubmitButton>
            </div>
          </form>
        </Card>
      </section>
    </main>
  );
}
