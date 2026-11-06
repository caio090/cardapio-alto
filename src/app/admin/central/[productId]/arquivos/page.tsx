import { requireAdminSession } from "@/lib/admin/auth";
import { getProduct, listFiles } from "@/lib/central/repo";
import { buildManifest } from "@/lib/central/logic";
import { APPROVAL, FILE_CATEGORIES, MATERIALS, type FileCategory, type FileDoc } from "@/lib/central/model";
import { driveConfig, hasDriveToken } from "@/lib/central/integrations/google-drive";
import {
  Badge,
  Card,
  Empty,
  Flash,
  Help,
  TextLink,
  btnDanger,
  btnSecondary,
  formatBytes,
  formatDate,
  inputCls,
  labelCls,
  readFlash,
  type SP,
} from "@/components/central/ui";
import { SubmitButton } from "@/components/central/submit-button";
import {
  addLinkAction,
  checkAllLinksAction,
  checkLinkAction,
  deleteFileAction,
  driveFolderAction,
  driveUploadAction,
  generateCorpoPdfAction,
  generateDeliverablePdfAction,
  updateFileAction,
  uploadFileAction,
} from "../../actions";

const APPROVAL_TONE: Record<string, string> = { rascunho: "gray", em_revisao: "amber", aprovado: "green", reprovado: "red" };
const LINK_TONE: Record<string, string> = { nao_verificado: "gray", ok: "green", quebrado: "red", erro: "orange" };

function FileCard({ f, productId, driveReady }: { f: FileDoc; productId: string; driveReady: boolean }) {
  const view = `/admin/central/arquivo/${f.id}`;
  return (
    <Card id={`arquivo-${f.id}`} className="scroll-mt-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="break-words font-semibold">{f.name}</p>
          <p className="text-xs text-black/55">
            {MATERIALS[f.material]} · versão {f.version || "—"} · {f.origin} · {formatDate(f.createdAt)}
            {f.kind === "arquivo" && ` · ${formatBytes(f.size)}`}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Badge tone={APPROVAL_TONE[f.approval]}>{APPROVAL[f.approval]}</Badge>
          {f.ficticio && <Badge tone="orange">fictício / demonstração</Badge>}
          {f.kind === "link" && (
            <Badge tone={LINK_TONE[f.linkCheck?.status ?? "nao_verificado"]} title={f.linkCheck?.message}>
              {f.linkCheck?.status === "ok" ? "link ok" : f.linkCheck?.status === "quebrado" ? "link quebrado" : f.linkCheck?.status === "erro" ? "não verificado (erro)" : "link não verificado"}
            </Badge>
          )}
          {f.drive?.url ? (
            <Badge tone={f.drive.source === "integracao" ? "green" : "amber"}>
              Drive {f.drive.source === "integracao" ? "verificado" : "informado manualmente"}
            </Badge>
          ) : (
            f.category === "arquivo_final" && <Badge tone="red">sem link do Drive</Badge>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-sm">
        {f.kind === "arquivo" ? (
          <>
            <a className={btnSecondary} href={view} target="_blank" rel="noopener">Visualizar</a>
            <a className={btnSecondary} href={`${view}?download=1`}>Baixar</a>
          </>
        ) : (
          <>
            <a className={btnSecondary} href={f.url} target="_blank" rel="noopener noreferrer">Abrir link</a>
            <form action={checkLinkAction.bind(null, productId, f.id)}>
              <SubmitButton className={btnSecondary} pendingText="Verificando…">Verificar</SubmitButton>
            </form>
          </>
        )}
        {f.drive?.url && (
          <a className={btnSecondary} href={f.drive.url} target="_blank" rel="noopener noreferrer">Abrir no Drive</a>
        )}
        {f.kind === "arquivo" && driveReady && (
          <form action={driveUploadAction.bind(null, productId, f.id)}>
            <SubmitButton className={btnSecondary} pendingText="Enviando…">
              {f.drive?.source === "integracao" ? "Atualizar no Drive" : "Enviar ao Drive"}
            </SubmitButton>
          </form>
        )}
      </div>
      {f.linkCheck?.message && f.kind === "link" && <p className="mt-1 text-xs text-black/50">{f.linkCheck.message} ({formatDate(f.linkCheck.checkedAt)})</p>}
      {f.drive?.error && <p className="mt-1 text-xs text-red-700">Último envio ao Drive falhou: {f.drive.error}</p>}
      {f.drive?.source === "integracao" && (
        <p className="mt-1 text-xs text-black/50">
          Drive: dono {f.drive.owner ?? "—"} · {f.drive.permission ?? "permissão não lida"} · verificado em {formatDate(f.drive.verifiedAt)}
        </p>
      )}

      <details className="mt-3">
        <summary className="list-none [&::-webkit-details-marker]:hidden cursor-pointer text-sm font-medium text-black/65">Editar aprovação, versão e link do Drive</summary>
        <form action={updateFileAction.bind(null, productId, f.id)} className="mt-2 grid gap-2 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Aprovação</label>
            <select name="approval" defaultValue={f.approval} className={inputCls}>
              {Object.entries(APPROVAL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Versão</label>
            <input name="version" defaultValue={f.version} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Categoria</label>
            <select name="category" defaultValue={f.category} className={inputCls}>
              {Object.entries(FILE_CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Material</label>
            <select name="material" defaultValue={f.material} className={inputCls}>
              {Object.entries(MATERIALS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Link do Drive {f.drive?.source === "integracao" && "(definido pela integração)"}</label>
            <input
              name="driveUrl"
              defaultValue={f.drive?.url ?? ""}
              placeholder="https://drive.google.com/…"
              className={inputCls}
              readOnly={f.drive?.source === "integracao"}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Notas (use o nome do item do manifesto para vincular)</label>
            <input name="notes" defaultValue={f.notes} className={inputCls} />
          </div>
          <div className="flex flex-wrap gap-2 sm:col-span-2">
            <SubmitButton>Salvar</SubmitButton>
          </div>
        </form>
        {f.category !== "imagem_original" && (
          <form action={deleteFileAction.bind(null, productId, f.id)} className="mt-2">
            <SubmitButton className={btnDanger} pendingText="Removendo…" confirmText="Remover este arquivo da Central?">Remover</SubmitButton>
          </form>
        )}
      </details>
    </Card>
  );
}

export default async function ArquivosPage({ params, searchParams }: { params: Promise<{ productId: string }>; searchParams: SP }) {
  await requireAdminSession();
  const { productId } = await params;
  const { msg, err } = await readFlash(searchParams);
  const product = (await getProduct(productId))!;
  const files = await listFiles(product.id);
  const manifest = buildManifest(product, files);
  const driveReady = Boolean(driveConfig()) && (await hasDriveToken().catch(() => false));
  const byCat = (c: FileCategory) => files.filter((f) => f.category === c).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <main className="space-y-6">
      <Flash msg={msg} err={err} />
      <Help
        label="Três materiais diferentes"
        oQueE="Guia geral de operação (processo para qualquer nicho), Corpo do Produto (documento interno deste produto) e Entregável vendido (o PDF que o cliente recebe). Cada arquivo indica a qual material pertence."
        quandoUsar="Gere o PDF do Corpo do Produto para revisar decisões; gere o entregável no editor do entregável."
        oQuePreparar="Para enviar ao Drive: integração conectada em Integrações. Sem ela, informe o link manualmente (fica marcado como não verificado)."
        comoAvaliar="Entregável aprovado sempre com link do Drive anexado. O manifesto aponta arquivo ausente, link quebrado e falta de aprovação."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="font-semibold">Gerar PDFs</h2>
          <p className="mt-1 text-sm text-black/60">Cada geração cria um novo arquivo com número de versão; nada é sobrescrito.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <form action={generateCorpoPdfAction.bind(null, product.id)}>
              <SubmitButton pendingText="Gerando…">PDF do Corpo do Produto (interno)</SubmitButton>
            </form>
            <form action={generateDeliverablePdfAction.bind(null, product.id)}>
              <SubmitButton pendingText="Gerando…">PDF do entregável</SubmitButton>
            </form>
          </div>
          <p className="mt-2 text-xs text-black/50">
            O conteúdo do entregável é editado em <TextLink href={`/admin/central/${product.id}/entregavel`}>Entregável (PDF)</TextLink>.
          </p>
        </Card>
        <Card>
          <h2 className="font-semibold">Pasta do produto no Google Drive</h2>
          {product.drive.folderId ? (
            <div className="mt-2 space-y-1 text-sm">
              <p>
                <a className="font-medium text-teal-800 hover:underline" href={product.drive.folderUrl} target="_blank" rel="noopener noreferrer">
                  {product.drive.folderName ?? "Abrir pasta"}
                </a>
              </p>
              <p className="text-black/60">Dono: {product.drive.owner ?? "—"} · {product.drive.permission ?? "—"}</p>
              <p className="text-black/60">Destino: Central de Produtos / {product.drive.folderName} · verificado em {formatDate(product.drive.checkedAt)}</p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-black/60">Nenhuma pasta vinculada.</p>
          )}
          {driveReady ? (
            <form action={driveFolderAction.bind(null, product.id)} className="mt-3">
              <SubmitButton className={btnSecondary} pendingText="Verificando…">{product.drive.folderId ? "Verificar pasta" : "Criar ou localizar pasta"}</SubmitButton>
            </form>
          ) : (
            <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900">
              Google Drive desconectado nesta aplicação. Veja o que falta em <TextLink href="/admin/central/integracoes">Integrações</TextLink>. Enquanto isso, você pode informar o link do Drive em cada arquivo (fica marcado como não verificado).
            </p>
          )}
        </Card>
      </div>

      <Card>
        <h2 className="font-semibold">Manifesto de entregáveis</h2>
        <p className="mt-1 text-sm text-black/60">
          Itens vêm do campo “Entregáveis” do Corpo do Produto. Um arquivo em “Entregáveis (arquivos finais)” é ligado ao item pelo nome ou pelas notas.
        </p>
        {manifest.length === 0 ? (
          <p className="mt-3 text-sm text-black/50">Preencha o campo “Entregáveis” no Corpo do Produto (um item por linha).</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="text-black/50">
                <tr>
                  <th className="py-1.5 pr-3 font-medium">Item esperado</th>
                  <th className="py-1.5 pr-3 font-medium">Arquivo</th>
                  <th className="py-1.5 font-medium">Pendências</th>
                </tr>
              </thead>
              <tbody>
                {manifest.map((m) => (
                  <tr key={m.item} className="border-t border-black/5 align-top">
                    <td className="py-2 pr-3 font-medium">{m.item}</td>
                    <td className="py-2 pr-3">{m.file ? <a className="text-teal-800 hover:underline" href={`#arquivo-${m.file.id}`}>{m.file.name}</a> : "—"}</td>
                    <td className="py-2">
                      {m.problems.length ? (
                        <div className="flex flex-wrap gap-1">{m.problems.map((p) => <Badge key={p} tone={p === "Arquivo ausente" || p === "Link quebrado" ? "red" : "amber"}>{p}</Badge>)}</div>
                      ) : (
                        <Badge tone="green">Completo</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="font-semibold">Enviar arquivo</h2>
          <form action={uploadFileAction.bind(null, product.id)} className="mt-3 grid gap-2">
            <input type="file" name="file" required className="text-sm" />
            <input name="name" placeholder="Nome (opcional)" className={inputCls} />
            <div className="grid grid-cols-2 gap-2">
              <select name="category" defaultValue="referencia" className={inputCls} aria-label="Categoria">
                {Object.entries(FILE_CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
              <select name="material" defaultValue="outro" className={inputCls} aria-label="Material">
                {Object.entries(MATERIALS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input name="version" placeholder="Versão" className={inputCls} />
              <input name="origin" placeholder="Origem (ex.: foto do balcão)" className={inputCls} />
            </div>
            <input name="notes" placeholder="Notas" className={inputCls} />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="ficticio" /> Demonstração fictícia</label>
            <div><SubmitButton pendingText="Enviando…">Guardar arquivo</SubmitButton></div>
            <p className="text-xs text-black/50">Até 15 MB. Arquivos ficam privados nesta aplicação.</p>
          </form>
        </Card>
        <Card>
          <h2 className="font-semibold">Adicionar link</h2>
          <form action={addLinkAction.bind(null, product.id)} className="mt-3 grid gap-2">
            <input name="url" required placeholder="https://…" className={inputCls} />
            <input name="name" placeholder="Nome" className={inputCls} />
            <div className="grid grid-cols-2 gap-2">
              <select name="category" defaultValue="referencia" className={inputCls} aria-label="Categoria">
                {Object.entries(FILE_CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
              <select name="material" defaultValue="outro" className={inputCls} aria-label="Material">
                {Object.entries(MATERIALS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <input name="notes" placeholder="Notas" className={inputCls} />
            <div><SubmitButton>Guardar link</SubmitButton></div>
          </form>
          <form action={checkAllLinksAction.bind(null, product.id)} className="mt-4 border-t border-black/10 pt-3">
            <SubmitButton className={btnSecondary} pendingText="Verificando…">Verificar todos os links</SubmitButton>
          </form>
        </Card>
      </div>

      {files.length === 0 && <Empty title="Nenhum arquivo ainda">Envie fotos originais, referências ou gere os PDFs acima.</Empty>}
      {(Object.keys(FILE_CATEGORIES) as FileCategory[]).map((c) => {
        const list = byCat(c);
        if (!list.length) return null;
        return (
          <section key={c}>
            <h2 className="text-lg font-bold">{FILE_CATEGORIES[c].label}</h2>
            <p className="mb-2 text-sm text-black/55">{FILE_CATEGORIES[c].help}</p>
            <div className="space-y-2">
              {list.map((f) => <FileCard key={f.id} f={f} productId={product.id} driveReady={driveReady} />)}
            </div>
          </section>
        );
      })}
    </main>
  );
}
