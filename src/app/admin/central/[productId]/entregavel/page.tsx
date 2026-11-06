import { requireAdminSession } from "@/lib/admin/auth";
import { getProduct, listFiles } from "@/lib/central/repo";
import { Card, Empty, Flash, Help, btnDanger, btnSecondary, inputCls, labelCls, readFlash, type SP } from "@/components/central/ui";
import { SubmitButton } from "@/components/central/submit-button";
import { saveDeliverableAction } from "../../actions";

export default async function EntregavelPage({ params, searchParams }: { params: Promise<{ productId: string }>; searchParams: SP }) {
  await requireAdminSession();
  const { productId } = await params;
  const { msg, err } = await readFlash(searchParams);
  const product = (await getProduct(productId))!;
  const d = product.deliverable;
  const images = (await listFiles(product.id)).filter((f) => f.kind === "arquivo" && (f.contentType === "image/png" || f.contentType === "image/jpeg"));
  const action = saveDeliverableAction.bind(null, product.id);

  return (
    <main className="space-y-6">
      <Flash msg={msg} err={err} />
      <Help
        label="Entregável vendido (não é o Corpo do Produto)"
        oQueE="O conteúdo do PDF que o comprador recebe. Cada seção vira uma página com texto, passos em diagrama, tabela, checklist, prompt copiável, nota e imagem."
        quandoUsar="Depois de fechar o escopo da oferta. Gere, revise no celular e só então aprove em Arquivos."
        oQuePreparar="Imagens PNG ou JPG em Arquivos (fotos reais com direito de uso). Demonstrações fictícias precisam dizer que são fictícias no texto."
        comoAvaliar="Uma pessoa do público consegue aplicar sem sua ajuda constante; prompts copiáveis; nada de promessa de vendas ou de tempo sem evidência."
      />

      <form action={action} className="space-y-4">
        <Card>
          <h2 className="font-semibold">Capa</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Título</label>
              <input name="title" defaultValue={d.title} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Versão exibida</label>
              <input name="versionLabel" defaultValue={d.versionLabel} className={inputCls} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Subtítulo</label>
              <input name="subtitle" defaultValue={d.subtitle} className={inputCls} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Aviso (o que inclui e não inclui)</label>
              <textarea name="disclaimer" defaultValue={d.disclaimer} rows={2} className={inputCls} />
            </div>
          </div>
        </Card>

        {d.sections.length === 0 && <Empty title="Nenhuma seção">Adicione a primeira seção do material.</Empty>}

        {d.sections.map((s, i) => (
          <Card key={s.id} id={`sec-${s.id}`} className="scroll-mt-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold">Seção {i + 1}</p>
              <div className="flex gap-1.5">
                <SubmitButton className={btnSecondary} name="op" value={`up:${s.id}`} pendingText="…">↑</SubmitButton>
                <SubmitButton className={btnSecondary} name="op" value={`down:${s.id}`} pendingText="…">↓</SubmitButton>
                <SubmitButton className={btnDanger} name="op" value={`remove:${s.id}`} pendingText="…" confirmText="Remover esta seção?">Remover</SubmitButton>
              </div>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-[180px_1fr]">
              <div>
                <label className={labelCls}>Rótulo</label>
                <input name={`${s.id}_kicker`} defaultValue={s.kicker} className={inputCls} placeholder="Capítulo 1" />
              </div>
              <div>
                <label className={labelCls}>Título</label>
                <input name={`${s.id}_title`} defaultValue={s.title} className={inputCls} />
              </div>
            </div>
            <div className="mt-3">
              <label className={labelCls}>Texto (parágrafos separados por linha em branco; “- ” para listas)</label>
              <textarea name={`${s.id}_body`} defaultValue={s.body} rows={5} className={inputCls} />
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Passos em diagrama (um por linha)</label>
                <textarea name={`${s.id}_steps`} defaultValue={s.steps} rows={3} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Checklist (um item por linha)</label>
                <textarea name={`${s.id}_checklist`} defaultValue={s.checklist} rows={3} className={inputCls} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>Tabela (colunas separadas por “|”; primeira linha = cabeçalho)</label>
                <textarea name={`${s.id}_table`} defaultValue={s.table} rows={3} className={`${inputCls} font-mono text-xs`} />
              </div>
              <div>
                <label className={labelCls}>Rótulo do prompt</label>
                <input name={`${s.id}_promptLabel`} defaultValue={s.promptLabel} className={inputCls} placeholder="PROMPT-BASE" />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>Prompt copiável</label>
                <textarea name={`${s.id}_prompt`} defaultValue={s.prompt} rows={4} className={`${inputCls} font-mono text-xs`} />
              </div>
              <div>
                <label className={labelCls}>Nota</label>
                <textarea name={`${s.id}_note`} defaultValue={s.note} rows={2} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Tipo da nota</label>
                <select name={`${s.id}_noteTone`} defaultValue={s.noteTone} className={inputCls}>
                  <option value="dica">Dica</option>
                  <option value="atencao">Atenção</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Imagem (PNG/JPG de Arquivos)</label>
                <select name={`${s.id}_imageFileId`} defaultValue={s.imageFileId} className={inputCls}>
                  <option value="">Sem imagem</option>
                  {images.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.ficticio ? "[fictícia] " : ""}
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Legenda da imagem</label>
                <input name={`${s.id}_imageCaption`} defaultValue={s.imageCaption} className={inputCls} placeholder="Ex.: Foto real do lanche, antes da edição" />
              </div>
            </div>
          </Card>
        ))}

        <div className="sticky bottom-0 z-10 -mx-4 flex flex-wrap gap-2 border-t border-black/10 bg-[#f4f5f3]/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-lg sm:border">
          <SubmitButton name="op" value="save">Salvar conteúdo</SubmitButton>
          <SubmitButton className={btnSecondary} name="op" value="add">+ Adicionar seção</SubmitButton>
          <SubmitButton className={btnSecondary} name="op" value="generate" pendingText="Gerando PDF…">Salvar e gerar PDF</SubmitButton>
        </div>
      </form>
    </main>
  );
}
