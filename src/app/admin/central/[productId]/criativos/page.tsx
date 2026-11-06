import Link from "next/link";
import { requireAdminSession } from "@/lib/admin/auth";
import { getProduct, listCreatives, listFiles } from "@/lib/central/repo";
import { APPROVAL, CREATIVE_OPERATIONS, CREATIVE_REVIEW, type CreativeDoc } from "@/lib/central/model";
import { Badge, Card, Empty, Flash, Help, inputCls, labelCls, readFlash, type SP } from "@/components/central/ui";
import { SubmitButton } from "@/components/central/submit-button";
import { addAttemptAction, createCreativeAction, saveCreativeAction } from "../../actions";

const TONE: Record<string, string> = { rascunho: "gray", em_revisao: "amber", aprovado: "green", reprovado: "red" };

export default async function CriativosPage({ params, searchParams }: { params: Promise<{ productId: string }>; searchParams: SP }) {
  await requireAdminSession();
  const { productId } = await params;
  const { msg, err, one } = await readFlash(searchParams);
  const product = (await getProduct(productId))!;
  const [creatives, files] = await Promise.all([listCreatives(product.id), listFiles(product.id)]);
  const selected = creatives.find((c) => c.id === one("c")) ?? null;
  const images = files.filter((f) => f.kind === "arquivo" && f.contentType?.startsWith("image/"));
  const fileById = Object.fromEntries(files.map((f) => [f.id, f]));

  return (
    <main className="space-y-6">
      <Flash msg={msg} err={err} />
      <Help
        label="Fluxo de imagens e criativos"
        oQueE="Briefing → referências → formato e texto → restrições → geração ou edição → comparação → revisão → aprovação. Geração (imagem nova), edição (sobre imagem existente), montagem (texto e logo no editor) e exportação são operações diferentes."
        quandoUsar="Para imagens do entregável, da página e dos anúncios."
        oQuePreparar="Fotos reais e logo em Arquivos como “Imagens originais” — elas nunca são sobrescritas."
        comoAvaliar="Fidelidade ao produto real, texto e logo corretos, direitos de uso registrados, sem promessa de venda. Nenhum provedor de geração está integrado: registre aqui gerações feitas fora, com prompt, provedor, modelo, data e custo."
      />

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <aside className="space-y-3">
          {creatives.length === 0 ? (
            <Empty title="Nenhum criativo">Crie um a partir de um conceito.</Empty>
          ) : (
            creatives.map((c) => (
              <Link key={c.id} href={`?c=${c.id}`} className="block">
                <Card className={c.id === selected?.id ? "border-teal-700/50 ring-2 ring-teal-700/15" : "hover:border-black/20"}>
                  <p className="font-semibold">{c.conceito}</p>
                  <p className="text-xs text-black/55">
                    Variante {c.variante} · {c.formato || "formato não definido"} · {c.attempts.length} tentativa(s)
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    <Badge tone={TONE[c.reviewStatus]}>{APPROVAL[c.reviewStatus]}</Badge>
                    {c.demonstracaoFicticia && <Badge tone="orange">demonstração fictícia</Badge>}
                  </div>
                </Card>
              </Link>
            ))
          )}
          <Card>
            <h2 className="font-semibold">Novo criativo</h2>
            <form action={createCreativeAction.bind(null, product.id)} className="mt-2 grid gap-2">
              <input name="conceito" required placeholder="Conceito (ex.: foto real → promoção)" className={inputCls} />
              <input name="mensagem" placeholder="Mensagem principal" className={inputCls} />
              <input name="publico" placeholder="Público" className={inputCls} />
              <div className="grid grid-cols-2 gap-2">
                <input name="formato" placeholder="Formato (ex.: 4:5)" className={inputCls} />
                <input name="variante" placeholder="Variante (A, B…)" className={inputCls} />
              </div>
              <input name="hipotese" placeholder="Hipótese de teste" className={inputCls} />
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="demonstracaoFicticia" /> Demonstração fictícia</label>
              <SubmitButton>Criar</SubmitButton>
            </form>
          </Card>
        </aside>

        <section>
          {!selected ? (
            <Empty title="Selecione um criativo">Ou crie um novo. Cada criativo guarda briefing, tentativas, revisão e aprovação.</Empty>
          ) : (
            <CreativeDetail c={selected} productId={product.id} images={images} fileById={fileById} />
          )}
        </section>
      </div>
    </main>
  );
}

function CreativeDetail({
  c,
  productId,
  images,
  fileById,
}: {
  c: CreativeDoc;
  productId: string;
  images: { id: string; name: string; category: string }[];
  fileById: Record<string, { id: string; name: string; contentType?: string }>;
}) {
  return (
    <div className="space-y-4">
      <Card>
        <form action={saveCreativeAction.bind(null, productId, c.id)} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelCls}>Conceito</label>
              <input name="conceito" defaultValue={c.conceito} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Mensagem</label>
              <input name="mensagem" defaultValue={c.mensagem} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Público</label>
              <input name="publico" defaultValue={c.publico} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Formato</label>
              <input name="formato" defaultValue={c.formato} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Variante</label>
              <input name="variante" defaultValue={c.variante} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Hipótese de teste</label>
              <input name="hipotese" defaultValue={c.hipotese} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Direitos de uso</label>
              <input name="direitosUso" defaultValue={c.direitosUso} className={inputCls} placeholder="Ex.: foto própria; logo do cliente com autorização" />
            </div>
          </div>
          <fieldset className="rounded-lg bg-black/[0.025] p-3">
            <legend className={labelCls}>Briefing</legend>
            <div className="grid gap-2 sm:grid-cols-3">
              <textarea name="b_referencias" defaultValue={c.briefing.referencias} rows={3} className={inputCls} placeholder="Referências" />
              <textarea name="b_texto" defaultValue={c.briefing.texto} rows={3} className={inputCls} placeholder="Texto que vai na peça" />
              <textarea name="b_restricoes" defaultValue={c.briefing.restricoes} rows={3} className={inputCls} placeholder="Restrições (o que não pode)" />
            </div>
            <label className={`${labelCls} mt-2`}>Imagens de referência</label>
            <select name="referenceFileIds" multiple defaultValue={c.referenceFileIds} className={`${inputCls} h-24`}>
              {images.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </fieldset>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="demonstracaoFicticia" defaultChecked={c.demonstracaoFicticia} /> Demonstração fictícia (precisa estar identificada na peça)
          </label>
          <fieldset>
            <legend className={labelCls}>Revisão</legend>
            <div className="mt-1 grid gap-1 sm:grid-cols-2">
              {CREATIVE_REVIEW.map((r) => (
                <label key={r.id} className="flex items-start gap-2 text-sm">
                  <input type="checkbox" name={`rev_${r.id}`} defaultChecked={Boolean(c.review[r.id])} className="mt-0.5" /> {r.text}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Tentativa escolhida</label>
              <select name="approvedAttemptId" defaultValue={c.approvedAttemptId} className={inputCls}>
                <option value="">—</option>
                {c.attempts.map((a, i) => <option key={a.id} value={a.id}>Tentativa {i + 1}{a.placeholder ? " (placeholder)" : ""}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Estado da revisão</label>
              <select name="reviewStatus" defaultValue={c.reviewStatus} className={inputCls}>
                {Object.entries(APPROVAL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>
          <SubmitButton>Salvar criativo</SubmitButton>
        </form>
      </Card>

      <section>
        <h3 className="mb-2 font-semibold">Comparação de tentativas</h3>
        {c.attempts.length === 0 ? (
          <Empty title="Nenhuma tentativa registrada">Registre abaixo o resultado de uma geração, edição ou montagem feita numa ferramenta.</Empty>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {c.attempts.map((a, i) => {
              const f = fileById[a.fileId];
              return (
                <Card key={a.id} className={a.id === c.approvedAttemptId ? "border-emerald-400" : ""}>
                  {f?.contentType?.startsWith("image/") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`/admin/central/arquivo/${a.fileId}`} alt={`Tentativa ${i + 1}`} className="aspect-square w-full rounded-md bg-black/5 object-contain" />
                  ) : (
                    <p className="text-sm text-black/50">Arquivo não é imagem.</p>
                  )}
                  <p className="mt-2 text-sm font-semibold">
                    Tentativa {i + 1} · {CREATIVE_OPERATIONS[a.operation]}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {a.placeholder && <Badge tone="red">PLACEHOLDER — não é geração real</Badge>}
                    {a.id === c.approvedAttemptId && <Badge tone="green">escolhida</Badge>}
                  </div>
                  <p className="mt-1 text-xs text-black/55">
                    {a.provedor || "provedor ?"} · {a.modelo || "modelo ?"} · {a.data} · custo: {a.custo || "não informado"}
                  </p>
                  {a.prompt && (
                    <details className="mt-1 text-xs">
                      <summary className="list-none [&::-webkit-details-marker]:hidden cursor-pointer text-black/60">Prompt</summary>
                      <pre className="mt-1 whitespace-pre-wrap rounded bg-black/[0.04] p-2 font-mono">{a.prompt}</pre>
                    </details>
                  )}
                  {a.observacao && <p className="mt-1 text-xs text-black/60">{a.observacao}</p>}
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <Card>
        <h3 className="font-semibold">Registrar tentativa</h3>
        <form action={addAttemptAction.bind(null, productId, c.id)} className="mt-2 grid gap-2 sm:grid-cols-2">
          <input type="file" name="file" accept="image/*" required className="text-sm sm:col-span-2" />
          <select name="operation" className={inputCls} aria-label="Operação">
            {Object.entries(CREATIVE_OPERATIONS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <input name="data" type="date" className={inputCls} aria-label="Data" />
          <input name="provedor" placeholder="Provedor/ferramenta" className={inputCls} />
          <input name="modelo" placeholder="Modelo" className={inputCls} />
          <input name="custo" placeholder="Custo (se houver)" className={inputCls} />
          <input name="observacao" placeholder="Observação" className={inputCls} />
          <textarea name="prompt" rows={3} placeholder="Prompt usado" className={`${inputCls} font-mono text-xs sm:col-span-2`} />
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input type="checkbox" name="placeholder" /> É um marcador de posição (não é resultado real)
          </label>
          <div><SubmitButton pendingText="Enviando…">Registrar tentativa</SubmitButton></div>
        </form>
      </Card>
    </div>
  );
}
