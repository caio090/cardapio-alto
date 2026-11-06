import { requireAdminSession } from "@/lib/admin/auth";
import { getProduct } from "@/lib/central/repo";
import { caktoApiConfig } from "@/lib/central/integrations/cakto-api";
import { DECISION_STATUS, PAGE_CHECKS, SALES_PATHS, type SalesPath } from "@/lib/central/model";
import { Badge, Card, Flash, Help, TextLink, btnSecondary, formatDate, inputCls, labelCls, readFlash, type SP } from "@/components/central/ui";
import { SubmitButton } from "@/components/central/submit-button";
import { caktoReadProductAction, checkPageLinksAction, savePageAction } from "../../actions";

export default async function PaginaPage({ params, searchParams }: { params: Promise<{ productId: string }>; searchParams: SP }) {
  await requireAdminSession();
  const { productId } = await params;
  const { msg, err } = await readFlash(searchParams);
  const product = (await getProduct(productId))!;
  const pg = product.page;
  const priceField = product.body.preco;
  const checksDone = PAGE_CHECKS.filter((c) => pg.checks[c.id]?.ok).length;

  return (
    <main className="space-y-6">
      <Flash msg={msg} err={err} />
      <Help
        label="Página, checkout e caminho de venda"
        oQueE="Organiza o conteúdo da página de venda, os links de checkout e confirmação, e a escolha do caminho de compra."
        quandoUsar="Quando oferta e entregável estão definidos. Nada aqui é publicado automaticamente."
        oQuePreparar="Título, demonstração real do processo, requisitos, preço, dúvidas e o link do checkout."
        comoAvaliar="Página, checkout e PDF contam a mesma promessa; tudo funciona no celular; preço igual em todos os lugares."
      />

      <form action={savePageAction.bind(null, product.id)} className="space-y-4">
        <Card>
          <h2 className="font-semibold">Caminho de venda</h2>
          <div className="mt-3 grid gap-3 lg:grid-cols-3">
            {(Object.keys(SALES_PATHS) as SalesPath[]).filter((k) => k !== "indefinido").map((k) => (
              <label key={k} className={`rounded-lg border p-3 text-sm ${pg.caminho === k ? "border-teal-700 bg-teal-50/60" : "border-black/10"}`}>
                <span className="flex items-center gap-2 font-semibold">
                  <input type="radio" name="caminho" value={k} defaultChecked={pg.caminho === k} /> {SALES_PATHS[k].label}
                </span>
                <span className="mt-1 block text-black/60">{SALES_PATHS[k].when}</span>
              </label>
            ))}
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_200px]">
            <div>
              <label className={labelCls}>Justificativa (obrigatória)</label>
              <textarea name="justificativa" defaultValue={pg.justificativa} rows={2} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Estado da escolha</label>
              <select name="caminhoStatus" defaultValue={pg.caminhoStatus} className={inputCls}>
                {(["pendente", "hipotese", "decidido"] as const).map((k) => <option key={k} value={k}>{DECISION_STATUS[k].label}</option>)}
              </select>
              <p className="mt-1 text-xs text-black/50">Testado/validado só com registro no Corpo do Produto (Funil).</p>
            </div>
          </div>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <h2 className="font-semibold">Conteúdo da página</h2>
            <div className="mt-3 grid gap-3">
              <div>
                <label className={labelCls}>Título</label>
                <input name="titulo" defaultValue={pg.titulo} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Subtítulo</label>
                <textarea name="subtitulo" defaultValue={pg.subtitulo} rows={2} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Seções (uma por linha: “Título: texto”)</label>
                <textarea name="secoes" defaultValue={pg.secoes} rows={5} className={inputCls} placeholder={"O que vem no PDF: ...\nRequisitos: ...\nO que não inclui: ..."} />
              </div>
              <div>
                <label className={labelCls}>Demonstração (descreva entrada, processo e saída reais)</label>
                <textarea name="demonstracao" defaultValue={pg.demonstracao} rows={2} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Dúvidas frequentes (“Pergunta? Resposta” por linha)</label>
                <textarea name="faq" defaultValue={pg.faq} rows={3} className={inputCls} />
              </div>
            </div>
          </Card>
          <div className="space-y-4">
            <Card>
              <h2 className="font-semibold">Checkout e confirmação</h2>
              <div className="mt-3 grid gap-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={labelCls}>Plataforma</label>
                    <input name="plataforma" defaultValue={pg.plataforma} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Cadastro observado</label>
                    <input name="cadastroObservado" defaultValue={pg.cadastroObservado} className={inputCls} />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="cadastroConfirmado" defaultChecked={pg.cadastroConfirmado} /> Confirmei qual cadastro usar (nome público alinhado)
                </label>
                <div>
                  <label className={labelCls}>Link do checkout</label>
                  <input name="checkoutUrl" defaultValue={pg.checkoutUrl} className={inputCls} placeholder="https://pay.cakto.com.br/…" />
                </div>
                <div>
                  <label className={labelCls}>Página ou mensagem de confirmação</label>
                  <input name="confirmacaoUrl" defaultValue={pg.confirmacaoUrl} className={inputCls} placeholder="https://…" />
                </div>
              </div>
            </Card>
            <Card>
              <h2 className="font-semibold">Verificação antes de publicar ({checksDone}/{PAGE_CHECKS.length})</h2>
              <div className="mt-2 space-y-1.5">
                {PAGE_CHECKS.map((c) => (
                  <label key={c.id} className="flex items-start gap-2 text-sm">
                    <input type="checkbox" name={`chk_${c.id}`} defaultChecked={Boolean(pg.checks[c.id]?.ok)} className="mt-0.5" />
                    <span>
                      {c.text}
                      {pg.checks[c.id]?.at && <span className="text-xs text-black/45"> · {formatDate(pg.checks[c.id]!.at)}</span>}
                    </span>
                  </label>
                ))}
              </div>
              <p className="mt-2 text-xs text-black/50">Preço no Corpo do Produto: {priceField?.value || "—"} ({DECISION_STATUS[priceField?.status ?? "pendente"].label})</p>
            </Card>
          </div>
        </div>
        <SubmitButton>Salvar página e checkout</SubmitButton>
      </form>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="font-semibold">Leitura do cadastro na plataforma</h2>
          {pg.leituraPlataforma ? (
            <div className="mt-2 space-y-1 text-sm">
              <p>{pg.leituraPlataforma.resumo}</p>
              <p className="text-xs text-black/50">Fonte: {pg.leituraPlataforma.fonte} · {formatDate(pg.leituraPlataforma.at)}</p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-black/55">Nenhuma leitura registrada.</p>
          )}
          {caktoApiConfig() ? (
            <form action={caktoReadProductAction.bind(null, product.id)} className="mt-3 flex flex-wrap gap-2">
              <input name="caktoProductId" placeholder="Id do produto na Cakto" className={`${inputCls} max-w-xs`} />
              <SubmitButton className={btnSecondary} pendingText="Lendo…">Ler na Cakto (somente leitura)</SubmitButton>
            </form>
          ) : (
            <p className="mt-3 text-xs text-black/50">
              A leitura pela aplicação precisa da API da Cakto configurada no servidor — veja <TextLink href="/admin/central/integracoes">Integrações</TextLink>.
            </p>
          )}
          <form action={checkPageLinksAction.bind(null, product.id)} className="mt-3">
            <SubmitButton className={btnSecondary} pendingText="Verificando…">Verificar links de checkout e confirmação</SubmitButton>
          </form>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Prévia (interna)</h2>
            <Badge tone="gray">não publicada</Badge>
          </div>
          <div className="mx-auto mt-3 w-full max-w-[380px] overflow-hidden rounded-[22px] border-[6px] border-black/80 bg-white">
            <div className="max-h-[560px] overflow-y-auto p-4 text-[14px] leading-relaxed">
              <p className="text-[11px] font-semibold uppercase text-orange-700">{product.name}</p>
              <p className="mt-1 text-xl font-black leading-tight">{pg.titulo || "Título da página"}</p>
              <p className="mt-2 text-black/70">{pg.subtitulo || "Subtítulo explicando público, tarefa e benefício concreto."}</p>
              {pg.demonstracao && <p className="mt-3 rounded bg-black/5 p-2 text-[13px]">Demonstração: {pg.demonstracao}</p>}
              {pg.secoes.split("\n").filter(Boolean).map((l, i) => {
                const [t, ...rest] = l.split(":");
                return (
                  <div key={i} className="mt-3">
                    <p className="font-bold">{rest.length ? t : ""}</p>
                    <p className="text-black/70">{rest.length ? rest.join(":") : l}</p>
                  </div>
                );
              })}
              <p className="mt-4 text-lg font-black">{priceField?.status === "decidido" ? priceField.value : "Preço a definir"}</p>
              <span className="mt-2 block rounded-lg bg-teal-800 py-2.5 text-center font-semibold text-white">
                {pg.checkoutUrl ? "Comprar (checkout)" : "Sem link de checkout"}
              </span>
              {pg.faq.split("\n").filter(Boolean).map((l, i) => {
                const [q, a] = l.split("?");
                return (
                  <details key={i} className="mt-2 border-t pt-2">
                    <summary className="list-none [&::-webkit-details-marker]:hidden font-medium">{q}?</summary>
                    <p className="text-black/70">{a}</p>
                  </details>
                );
              })}
            </div>
          </div>
          <p className="mt-2 text-xs text-black/50">
            A página pública do site é gerenciada em <TextLink href="/admin/produtos">Páginas do site</TextLink> e só vai ao ar quando você publicar lá.
          </p>
        </Card>
      </div>
    </main>
  );
}
