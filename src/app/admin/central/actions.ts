"use server";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/admin/auth";
import {
  BODY_FIELDS,
  CREATIVE_REVIEW,
  PAGE_CHECKS,
  STAGE_BY_KEY,
  VALIDATION_FIELDS,
  checkDecisionStatus,
  emptySection,
  type ApprovalStatus,
  type CaseDoc,
  type CreativeDoc,
  type CreativeOperation,
  type DecisionStatus,
  type EvidenceDoc,
  type EvidenceKind,
  type ExperimentDoc,
  type FileCategory,
  type FileDoc,
  type FinanceInputs,
  type Material,
  type ProductDoc,
  type SalesPath,
  type StageKey,
  type StageStatus,
  type TaskDoc,
  type TaskStatus,
} from "@/lib/central/model";
import {
  duplicateStructure,
  blankProduct,
  getCreative,
  getFile,
  getProduct,
  getTask,
  listEvidences,
  listFiles,
  listProducts,
  listTasks,
  listVersions,
  logHistory,
  newId,
  now,
  readBinary,
  removeEvidence,
  removeFileDoc,
  removeTask,
  saveCase,
  saveCreative,
  saveEvidence,
  saveExperiment,
  saveFileDoc,
  saveProduct,
  saveTask,
  saveVersion,
  storeBinary,
} from "@/lib/central/repo";
import { buildCriadorPng } from "@/lib/central/seed-criador-png";
import { renderCorpoPdf, renderDeliverablePdf, type DeliverableImage } from "@/lib/central/pdf/documents";
import { checkUrl } from "@/lib/central/link-check";
import { getStore } from "@/lib/central/store";
import { errorMessage, recordTest, deleteSecret, type IntegrationKey } from "@/lib/central/integrations/state";
import { driveWhoAmI, ensureProductFolder, uploadToDrive, describePermissions } from "@/lib/central/integrations/google-drive";
import { caktoProductSnapshot, caktoTest } from "@/lib/central/integrations/cakto-api";
import { metaInsights, metaTest } from "@/lib/central/integrations/meta";

/* ------------------------------------------------------------------ */
/* utilitários                                                         */
/* ------------------------------------------------------------------ */

function go(pathname: string, kind: "msg" | "err", text: string): never {
  const [base, hash] = pathname.split("#");
  const sep = base.includes("?") ? "&" : "?";
  redirect(`${base}${sep}${kind}=${encodeURIComponent(text)}${hash ? `#${hash}` : ""}`);
}

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const bool = (fd: FormData, k: string) => fd.get(k) === "on" || fd.get(k) === "true";

function parseMoney(v: string): number | null {
  const t = v.replace(/[R$\s]/g, "");
  if (!t) return null;
  const normalized = t.includes(",") ? t.replace(/\./g, "").replace(",", ".") : t;
  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

async function loadProduct(id: string): Promise<ProductDoc> {
  await requireAdminSession();
  const p = await getProduct(id);
  if (!p) go("/admin/central", "err", "Produto não encontrado.");
  return p;
}

const base = (id: string) => `/admin/central/${id}`;

/* ------------------------------------------------------------------ */
/* produtos                                                            */
/* ------------------------------------------------------------------ */

export async function createProductAction(fd: FormData) {
  await requireAdminSession();
  const name = str(fd, "name");
  const niche = str(fd, "niche");
  if (!name) go("/admin/central", "err", "Dê um nome ao produto.");
  const sourceId = str(fd, "sourceId");
  let product: ProductDoc;
  if (sourceId) {
    const source = await getProduct(sourceId);
    if (!source) go("/admin/central", "err", "Produto de origem não encontrado.");
    product = await duplicateStructure(source, name, niche, bool(fd, "copyTasks"));
  } else {
    product = blankProduct(name, niche);
    product.dadosFicticios = bool(fd, "ficticio");
    await saveProduct(product);
    await logHistory(product.id, "Produto criado", product.dadosFicticios ? "Marcado como dados fictícios." : "");
  }
  revalidatePath("/admin/central");
  go(base(product.id), "msg", "Produto criado. Comece pelo Corpo do Produto ou siga a próxima ação indicada.");
}

export async function importCriadorPngAction() {
  await requireAdminSession();
  const existing = (await listProducts()).find((p) => p.name.trim().toLowerCase() === "criador png");
  if (existing) go(base(existing.id), "err", "O Criador PNG já existe na Central — nada foi duplicado.");

  const { product, tasks } = buildCriadorPng();
  product.page.leituraPlataforma = {
    at: "2026-11-06T01:28:14Z",
    fonte: "MCP da Cakto usado pelo assistente (sessão Claude Code) — leitura, não integração da aplicação",
    resumo:
      "Produto “LKT PNG” (id 60094297-3ecf-481b-94cf-8337a5f0fe43) ativo, tipo único, R$ 19,90; oferta qxyu3q2 “LKT PNG” R$ 19,90 ativa; 0 pedidos; categoria “Música e Artes”; descrição sobre direção de arte, moodboard e refinamento em 3 níveis. Nenhum webhook cadastrado via API.",
  };
  await saveProduct(product);
  for (const t of tasks) await saveTask(t);

  const t = now();
  const link = (name: string, url: string, notes = ""): FileDoc => ({
    id: newId(),
    productId: product.id,
    createdAt: t,
    updatedAt: t,
    name,
    kind: "link",
    url,
    category: "referencia",
    material: "outro",
    approval: "rascunho",
    version: "",
    origin: "Referência registrada na importação",
    notes,
    ficticio: false,
    linkCheck: { status: "nao_verificado" },
  });
  for (const l of [
    link("Cakto — documentação de webhooks", "https://docs.cakto.com.br/conceitos/webhooks", "Lida em 06/11/2026 via MCP oficial."),
    link("Cakto — autenticação da API", "https://docs.cakto.com.br/authentication"),
    link("Cakto — cadastro do produto", "https://ajuda.cakto.com.br/pt-br/articles/86-como-cadastrar-o-meu-produto-na-cakto"),
    link("Cakto — pixels e eventos", "https://ajuda.cakto.com.br/pt-br/articles/67-guia-de-pixels-de-conversao-na-cakto-o-que-sao-e-como-funcionam"),
    link("Meta — métricas e otimização (artigo para apps)", "https://developers.meta.com/vr/resources/optimize-ad-campaign/", "Princípios gerais; não substituem a configuração de venda de PDF."),
    link("Arquiteto de Ofertas (referência de organização, MIT)", "https://github.com/NoelCunha/arquiteto-de-ofertas", "Usado só como referência de etapas. Imagens: apenas especificações, sem gerador integrado. Afirmações de resultado não foram tomadas como fato."),
  ]) {
    await saveFileDoc(l);
  }

  // Entregável v0.1 já produzido no repositório, se existir.
  try {
    const bytes = await readFile(path.join(process.cwd(), "produtos/criador-png/guia/criador-png-guia-v0.1.pdf"));
    await storeBinary(
      {
        productId: product.id,
        name: "Guia em PDF — Criador PNG v0.1 (rascunho)",
        category: "arquivo_final",
        material: "entregavel",
        approval: "rascunho",
        version: "0.1",
        origin: "Importado de produtos/criador-png/guia (gerado em 05/11/2026)",
        notes: "Guia em PDF. Prompts ainda não testados em ferramenta real.",
        ficticio: false,
      },
      new Uint8Array(bytes),
      "application/pdf"
    );
  } catch {
    /* arquivo não presente neste ambiente */
  }

  await logHistory(product.id, "Importado", "Corpo do Produto v1 (05/11/2026), guia v0.1 e leitura da Cakto de 06/11/2026.");
  await saveVersion(product, "1", "Importação do Corpo do Produto v1 — nada validado");
  revalidatePath("/admin/central");
  go(base(product.id), "msg", "Criador PNG importado com os estados do Corpo do Produto v1. Nada foi marcado como validado.");
}

export async function updateProductMetaAction(productId: string, fd: FormData) {
  const p = await loadProduct(productId);
  p.name = str(fd, "name") || p.name;
  p.niche = str(fd, "niche");
  p.versionLabel = str(fd, "versionLabel") || p.versionLabel;
  p.responsaveis = str(fd, "responsaveis");
  p.descricao = str(fd, "descricao");
  p.dadosFicticios = bool(fd, "dadosFicticios");
  const stage = str(fd, "currentStage") as StageKey;
  if (STAGE_BY_KEY[stage] && stage !== p.currentStage) {
    await logHistory(p.id, "Etapa atual alterada", `${STAGE_BY_KEY[p.currentStage].label} → ${STAGE_BY_KEY[stage].label}`);
    p.currentStage = stage;
  }
  await saveProduct(p);
  revalidatePath(base(p.id), "layout");
  go(base(p.id), "msg", "Dados do produto salvos.");
}

export async function archiveProductAction(productId: string) {
  const p = await loadProduct(productId);
  p.archived = true;
  await saveProduct(p);
  await logHistory(p.id, "Produto arquivado");
  revalidatePath("/admin/central");
  go("/admin/central", "msg", `“${p.name}” arquivado. Os dados continuam guardados.`);
}

/* ------------------------------------------------------------------ */
/* Corpo do Produto                                                    */
/* ------------------------------------------------------------------ */

export async function saveBodyFieldAction(productId: string, key: string, fd: FormData) {
  const p = await loadProduct(productId);
  const def = BODY_FIELDS.find((f) => f.key === key);
  if (!def) go(`${base(p.id)}/corpo`, "err", "Campo desconhecido.");
  const status = str(fd, "status") as DecisionStatus;
  const validation = Object.fromEntries(VALIDATION_FIELDS.map((v) => [v.key, str(fd, `v_${v.key}`)]));
  const check = checkDecisionStatus(status, validation);
  if (!check.ok) {
    go(
      `${base(p.id)}/corpo#campo-${key}`,
      "err",
      `“${def.label}” não pode ser marcado como ${status === "validado" ? "validado" : "testado"} sem: ${check.missing.join(", ")}. Isso evita tratar opinião ou pesquisa superficial como comprovação.`
    );
  }
  const before = p.body[key];
  p.body[key] = { value: str(fd, "value"), status, validation, updatedAt: now() };
  await saveProduct(p);
  if (before?.status !== status || before?.value !== p.body[key].value) {
    await logHistory(p.id, `Corpo do Produto: ${def.label}`, `${before?.status ?? "—"} → ${status}`);
  }
  revalidatePath(`${base(p.id)}/corpo`);
  go(`${base(p.id)}/corpo#campo-${key}`, "msg", `“${def.label}” salvo.`);
}

export async function addEvidenceAction(productId: string, fd: FormData) {
  const p = await loadProduct(productId);
  const title = str(fd, "title");
  if (!title) go(`${base(p.id)}/corpo#evidencias`, "err", "Descreva a evidência.");
  const t = now();
  const e: EvidenceDoc = {
    id: newId(),
    productId: p.id,
    createdAt: t,
    updatedAt: t,
    title,
    kind: (str(fd, "kind") || "entrevista") as EvidenceKind,
    fieldKeys: fd.getAll("fieldKeys").map(String),
    ficticio: bool(fd, "ficticio"),
    ...Object.fromEntries(VALIDATION_FIELDS.map((v) => [v.key, str(fd, v.key)])),
  };
  await saveEvidence(e);
  await logHistory(p.id, "Evidência registrada", title);
  revalidatePath(`${base(p.id)}/corpo`);
  go(`${base(p.id)}/corpo#evidencias`, "msg", "Evidência registrada.");
}

export async function removeEvidenceAction(productId: string, evidenceId: string) {
  const p = await loadProduct(productId);
  await removeEvidence(evidenceId);
  await logHistory(p.id, "Evidência removida", evidenceId);
  revalidatePath(`${base(p.id)}/corpo`);
  go(`${base(p.id)}/corpo#evidencias`, "msg", "Evidência removida.");
}

/* ------------------------------------------------------------------ */
/* Mapa da operação                                                    */
/* ------------------------------------------------------------------ */

export async function saveStageAction(productId: string, stageKey: string, fd: FormData) {
  const p = await loadProduct(productId);
  const def = STAGE_BY_KEY[stageKey as StageKey];
  if (!def) go(base(p.id), "err", "Etapa desconhecida.");
  const status = str(fd, "status") as StageStatus;
  const evidencia = str(fd, "evidenciaConclusao");
  if (status === "concluido" && !evidencia) {
    go(`${base(p.id)}#etapa-${stageKey}`, "err", `Para concluir “${def.label}”, registre a evidência de conclusão (o que comprova que terminou).`);
  }
  const unmet = def.dependencias.filter((d) => p.stages[d].status !== "concluido");
  const prev = p.stages[def.key];
  p.stages[def.key] = {
    status,
    responsavel: str(fd, "responsavel"),
    evidenciaConclusao: evidencia,
    notas: str(fd, "notas"),
    checklist: Object.fromEntries(def.checklist.map((c) => [c.id, bool(fd, `chk_${c.id}`)])),
  };
  await saveProduct(p);
  if (prev.status !== status) await logHistory(p.id, `Etapa ${def.label}`, `${prev.status} → ${status}`);
  revalidatePath(base(p.id));
  go(
    `${base(p.id)}#etapa-${stageKey}`,
    "msg",
    status === "concluido" && unmet.length
      ? `Etapa salva. Atenção: depende de etapa(s) não concluída(s): ${unmet.map((u) => STAGE_BY_KEY[u].label).join(", ")}.`
      : "Etapa salva."
  );
}

/* ------------------------------------------------------------------ */
/* Tarefas                                                             */
/* ------------------------------------------------------------------ */

export async function createTaskAction(productId: string, fd: FormData) {
  const p = await loadProduct(productId);
  const title = str(fd, "title");
  if (!title) go(`${base(p.id)}/tarefas`, "err", "Escreva a tarefa.");
  const tasks = await listTasks(p.id);
  const t = now();
  const task: TaskDoc = {
    id: newId(),
    productId: p.id,
    createdAt: t,
    updatedAt: t,
    stageKey: (str(fd, "stageKey") || p.currentStage) as StageKey,
    title,
    responsavel: str(fd, "responsavel"),
    status: "a_fazer",
    dependsOn: fd.getAll("dependsOn").map(String).filter(Boolean),
    evidencia: "",
    order: Math.max(0, ...tasks.map((x) => x.order)) + 1,
    prazo: /^\d{4}-\d{2}-\d{2}$/.test(str(fd, "prazo")) ? str(fd, "prazo") : undefined,
  };
  await saveTask(task);
  await logHistory(p.id, "Tarefa criada", title);
  revalidatePath(`${base(p.id)}/tarefas`);
  go(`${base(p.id)}/tarefas#${task.id}`, "msg", "Tarefa criada.");
}

export async function updateTaskAction(productId: string, taskId: string, fd: FormData) {
  const p = await loadProduct(productId);
  const task = await getTask(taskId);
  if (!task || task.productId !== p.id) go(`${base(p.id)}/tarefas`, "err", "Tarefa não encontrada.");
  const status = str(fd, "status") as TaskStatus;
  const evidencia = str(fd, "evidencia");
  if (status === "feito") {
    if (!evidencia) go(`${base(p.id)}/tarefas#${taskId}`, "err", "Para marcar como feita, registre a evidência (ex.: link, arquivo, resultado do teste).");
    const all = await listTasks(p.id);
    const pending = task.dependsOn.map((id) => all.find((x) => x.id === id)).filter((x) => x && x.status !== "feito");
    if (pending.length) {
      go(`${base(p.id)}/tarefas#${taskId}`, "err", `Depende de tarefa(s) não concluída(s): ${pending.map((x) => x!.title).join("; ")}.`);
    }
  }
  const prev = task.status;
  Object.assign(task, {
    status,
    evidencia,
    responsavel: str(fd, "responsavel"),
    title: str(fd, "title") || task.title,
    stageKey: (str(fd, "stageKey") || task.stageKey) as StageKey,
    dependsOn: fd.getAll("dependsOn").map(String).filter((d) => d && d !== task.id),
    prazo: /^\d{4}-\d{2}-\d{2}$/.test(str(fd, "prazo")) ? str(fd, "prazo") : undefined,
  });
  await saveTask(task);
  if (prev !== status) await logHistory(p.id, "Tarefa atualizada", `${task.title}: ${prev} → ${status}`);
  revalidatePath(`${base(p.id)}/tarefas`);
  revalidatePath(base(p.id));
  go(`${base(p.id)}/tarefas#${taskId}`, "msg", "Tarefa salva.");
}

export async function deleteTaskAction(productId: string, taskId: string) {
  const p = await loadProduct(productId);
  const task = await getTask(taskId);
  if (task?.productId === p.id) {
    await removeTask(taskId);
    for (const other of await listTasks(p.id)) {
      if (other.dependsOn.includes(taskId)) await saveTask({ ...other, dependsOn: other.dependsOn.filter((d) => d !== taskId) });
    }
    await logHistory(p.id, "Tarefa removida", task.title);
  }
  revalidatePath(`${base(p.id)}/tarefas`);
  go(`${base(p.id)}/tarefas`, "msg", "Tarefa removida.");
}

/* ------------------------------------------------------------------ */
/* Versões                                                             */
/* ------------------------------------------------------------------ */

export async function saveVersionAction(productId: string, fd: FormData) {
  const p = await loadProduct(productId);
  const label = str(fd, "label");
  if (label) {
    p.versionLabel = label;
    await saveProduct(p);
  }
  const v = await saveVersion(p, label, str(fd, "note"));
  revalidatePath(`${base(p.id)}/versoes`);
  go(`${base(p.id)}/versoes`, "msg", `Versão v${v.number} salva.`);
}

/* ------------------------------------------------------------------ */
/* PDFs                                                                */
/* ------------------------------------------------------------------ */

async function nextVersionFor(productId: string, material: Material) {
  const files = await listFiles(productId);
  const nums = files.filter((f) => f.material === material && f.origin.startsWith("Gerado pela Central")).map((f) => Number(f.version) || 0);
  return Math.max(0, ...nums) + 1;
}

export async function generateCorpoPdfAction(productId: string) {
  const p = await loadProduct(productId);
  const [evidences, tasks, files, versions] = await Promise.all([listEvidences(p.id), listTasks(p.id), listFiles(p.id), listVersions(p.id)]);
  const n = await nextVersionFor(p.id, "corpo_produto");
  let bytes: Uint8Array;
  try {
    bytes = await renderCorpoPdf({ product: p, evidences, tasks, files, versionNumber: n });
  } catch (e) {
    go(`${base(p.id)}/arquivos`, "err", `Falha ao gerar o PDF: ${errorMessage(e)}`);
  }
  const file = await storeBinary(
    {
      productId: p.id,
      name: `Corpo do Produto — ${p.name} — exportação ${n}.pdf`,
      category: "documento_interno",
      material: "corpo_produto",
      approval: "rascunho",
      version: String(n),
      origin: `Gerado pela Central (versão do produto ${p.versionLabel}${versions[0] ? `, última versão salva v${versions[0].number}` : ""})`,
      notes: "Documento interno. Não é o entregável vendido.",
      ficticio: p.dadosFicticios,
    },
    bytes,
    "application/pdf"
  );
  await logHistory(p.id, "PDF gerado", file.name);
  revalidatePath(`${base(p.id)}/arquivos`);
  go(`${base(p.id)}/arquivos#arquivo-${file.id}`, "msg", "PDF do Corpo do Produto gerado. Abra para revisar antes de usar.");
}

export async function generateDeliverablePdfAction(productId: string) {
  const p = await loadProduct(productId);
  if (!p.deliverable.sections.length) go(`${base(p.id)}/entregavel`, "err", "Adicione ao menos uma seção ao entregável.");
  const images: Record<string, DeliverableImage> = {};
  for (const sec of p.deliverable.sections) {
    if (!sec.imageFileId) continue;
    const f = await getFile(sec.imageFileId);
    const bytes = f && (await readBinary(f));
    if (!f || !bytes) go(`${base(p.id)}/entregavel`, "err", `Imagem da seção “${sec.title}” não encontrada.`);
    const format = f.contentType === "image/png" ? "png" : f.contentType === "image/jpeg" ? "jpg" : null;
    if (!format) go(`${base(p.id)}/entregavel`, "err", `A imagem da seção “${sec.title}” precisa ser PNG ou JPG.`);
    images[sec.imageFileId] = { data: Buffer.from(bytes), format };
  }
  const n = await nextVersionFor(p.id, "entregavel");
  let bytes: Uint8Array;
  try {
    bytes = await renderDeliverablePdf({ product: p, images });
  } catch (e) {
    go(`${base(p.id)}/entregavel`, "err", `Falha ao gerar o PDF: ${errorMessage(e)}`);
  }
  const file = await storeBinary(
    {
      productId: p.id,
      name: `${p.deliverable.title} — ${p.deliverable.versionLabel} — geração ${n}.pdf`,
      category: "arquivo_final",
      material: "entregavel",
      approval: "rascunho",
      version: String(n),
      origin: `Gerado pela Central a partir do editor do entregável (${p.deliverable.versionLabel})`,
      notes: "Guia em PDF. Revise no celular antes de aprovar.",
      ficticio: p.dadosFicticios,
    },
    bytes,
    "application/pdf"
  );
  await logHistory(p.id, "Entregável gerado", file.name);
  revalidatePath(`${base(p.id)}/arquivos`);
  go(`${base(p.id)}/arquivos#arquivo-${file.id}`, "msg", "PDF do entregável gerado como rascunho. Revise, aprove e envie ao Drive.");
}

/* ------------------------------------------------------------------ */
/* Arquivos e links                                                    */
/* ------------------------------------------------------------------ */

const MAX_UPLOAD = 15 * 1024 * 1024;

export async function uploadFileAction(productId: string, fd: FormData) {
  const p = await loadProduct(productId);
  const file = fd.get("file");
  if (!(file instanceof File) || file.size === 0) go(`${base(p.id)}/arquivos`, "err", "Escolha um arquivo.");
  if (file.size > MAX_UPLOAD) go(`${base(p.id)}/arquivos`, "err", "Arquivo maior que 15 MB.");
  const doc = await storeBinary(
    {
      productId: p.id,
      name: str(fd, "name") || file.name,
      category: (str(fd, "category") || "referencia") as FileCategory,
      material: (str(fd, "material") || "outro") as Material,
      approval: "rascunho",
      version: str(fd, "version"),
      origin: `Upload em ${new Date().toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}${str(fd, "origin") ? ` — ${str(fd, "origin")}` : ""}`,
      notes: str(fd, "notes"),
      ficticio: bool(fd, "ficticio"),
    },
    new Uint8Array(await file.arrayBuffer()),
    file.type || "application/octet-stream"
  );
  await logHistory(p.id, "Arquivo enviado", doc.name);
  revalidatePath(`${base(p.id)}/arquivos`);
  go(`${base(p.id)}/arquivos#arquivo-${doc.id}`, "msg", "Arquivo guardado.");
}

export async function addLinkAction(productId: string, fd: FormData) {
  const p = await loadProduct(productId);
  const url = str(fd, "url");
  try {
    const u = new URL(url);
    if (!/^https?:$/.test(u.protocol)) throw new Error();
  } catch {
    go(`${base(p.id)}/arquivos`, "err", "Link inválido. Use um endereço começando com https://");
  }
  const t = now();
  const doc: FileDoc = {
    id: newId(),
    productId: p.id,
    createdAt: t,
    updatedAt: t,
    name: str(fd, "name") || url,
    kind: "link",
    url,
    category: (str(fd, "category") || "referencia") as FileCategory,
    material: (str(fd, "material") || "outro") as Material,
    approval: "rascunho",
    version: str(fd, "version"),
    origin: "Link externo",
    notes: str(fd, "notes"),
    ficticio: false,
    linkCheck: { status: "nao_verificado" },
  };
  await saveFileDoc(doc);
  await logHistory(p.id, "Link adicionado", doc.name);
  revalidatePath(`${base(p.id)}/arquivos`);
  go(`${base(p.id)}/arquivos#arquivo-${doc.id}`, "msg", "Link guardado. Use “Verificar” para conferir se abre.");
}

async function loadFile(productId: string, fileId: string) {
  const p = await loadProduct(productId);
  const f = await getFile(fileId);
  if (!f || f.productId !== p.id) go(`${base(p.id)}/arquivos`, "err", "Arquivo não encontrado.");
  return { p, f };
}

export async function updateFileAction(productId: string, fileId: string, fd: FormData) {
  const { p, f } = await loadFile(productId, fileId);
  const approval = (str(fd, "approval") || f.approval) as ApprovalStatus;
  const driveUrl = str(fd, "driveUrl");
  if (driveUrl && !/^https:\/\/(drive|docs)\.google\.com\//.test(driveUrl)) {
    go(`${base(p.id)}/arquivos#arquivo-${f.id}`, "err", "O link do Drive deve começar com https://drive.google.com/ ou https://docs.google.com/");
  }
  const prevApproval = f.approval;
  f.approval = approval;
  f.version = str(fd, "version");
  f.notes = str(fd, "notes");
  f.category = (str(fd, "category") || f.category) as FileCategory;
  f.material = (str(fd, "material") || f.material) as Material;
  if (driveUrl && driveUrl !== f.drive?.url) f.drive = { url: driveUrl, source: "manual" };
  if (!driveUrl && f.drive?.source === "manual") f.drive = undefined;
  await saveFileDoc(f);
  if (prevApproval !== approval) await logHistory(p.id, "Aprovação de arquivo", `${f.name}: ${prevApproval} → ${approval}`);
  revalidatePath(`${base(p.id)}/arquivos`);
  const reminder =
    approval === "aprovado" && f.category === "arquivo_final" && !f.drive?.url
      ? " Entregável aprovado: anexe o link do Drive (envie pela integração ou informe o link)."
      : "";
  go(`${base(p.id)}/arquivos#arquivo-${f.id}`, "msg", `Arquivo atualizado.${reminder}`);
}

export async function deleteFileAction(productId: string, fileId: string) {
  const { p, f } = await loadFile(productId, fileId);
  if (f.category === "imagem_original") {
    go(`${base(p.id)}/arquivos#arquivo-${f.id}`, "err", "Imagens originais são preservadas e não podem ser apagadas por aqui.");
  }
  await removeFileDoc(f);
  await logHistory(p.id, "Arquivo removido", f.name);
  revalidatePath(`${base(p.id)}/arquivos`);
  go(`${base(p.id)}/arquivos`, "msg", "Arquivo removido.");
}

export async function checkLinkAction(productId: string, fileId: string) {
  const { p, f } = await loadFile(productId, fileId);
  if (f.kind !== "link" || !f.url) go(`${base(p.id)}/arquivos`, "err", "Não é um link.");
  f.linkCheck = await checkUrl(f.url);
  await saveFileDoc(f);
  revalidatePath(`${base(p.id)}/arquivos`);
  go(`${base(p.id)}/arquivos#arquivo-${f.id}`, f.linkCheck.status === "ok" ? "msg" : "err", `Verificação: ${f.linkCheck.message}`);
}

export async function checkAllLinksAction(productId: string) {
  const p = await loadProduct(productId);
  const files = (await listFiles(p.id)).filter((f) => f.kind === "link" && f.url);
  let ok = 0;
  for (const f of files) {
    f.linkCheck = await checkUrl(f.url!);
    if (f.linkCheck.status === "ok") ok++;
    await saveFileDoc(f);
  }
  revalidatePath(`${base(p.id)}/arquivos`);
  go(`${base(p.id)}/arquivos`, ok === files.length ? "msg" : "err", `${ok} de ${files.length} link(s) abriram corretamente.`);
}

/* ------------------------------------------------------------------ */
/* Google Drive                                                        */
/* ------------------------------------------------------------------ */

export async function driveFolderAction(productId: string) {
  const p = await loadProduct(productId);
  try {
    const folder = await ensureProductFolder(p);
    p.drive = {
      folderId: folder.id,
      folderUrl: folder.webViewLink,
      folderName: folder.name,
      owner: folder.owners?.[0]?.emailAddress,
      permission: describePermissions(folder),
      checkedAt: now(),
    };
    await saveProduct(p);
    await logHistory(p.id, "Drive: pasta do produto", folder.name);
  } catch (e) {
    go(`${base(p.id)}/arquivos`, "err", `Google Drive: ${errorMessage(e)}`);
  }
  revalidatePath(`${base(p.id)}/arquivos`);
  go(`${base(p.id)}/arquivos`, "msg", "Pasta do produto no Drive pronta (criada ou reutilizada).");
}

export async function driveUploadAction(productId: string, fileId: string) {
  const { p, f } = await loadFile(productId, fileId);
  const bytes = f.kind === "arquivo" ? await readBinary(f) : null;
  if (!bytes) go(`${base(p.id)}/arquivos#arquivo-${f.id}`, "err", "Só arquivos guardados na Central podem ser enviados ao Drive.");
  try {
    const folder = await ensureProductFolder(p);
    if (p.drive.folderId !== folder.id) {
      p.drive = { ...p.drive, folderId: folder.id, folderUrl: folder.webViewLink, folderName: folder.name, owner: folder.owners?.[0]?.emailAddress, permission: describePermissions(folder), checkedAt: now() };
      await saveProduct(p);
    }
    const { file, updatedExisting } = await uploadToDrive({
      folderId: folder.id,
      centralFileId: f.id,
      existingDriveId: f.drive?.source === "integracao" ? f.drive.fileId : undefined,
      name: f.name,
      contentType: f.contentType ?? "application/octet-stream",
      bytes,
    });
    f.drive = {
      url: file.webViewLink ?? `https://drive.google.com/file/d/${file.id}/view`,
      source: "integracao",
      fileId: file.id,
      verifiedAt: now(),
      owner: file.owners?.[0]?.emailAddress,
      permission: describePermissions(file),
    };
    await saveFileDoc(f);
    await logHistory(p.id, updatedExisting ? "Drive: arquivo atualizado" : "Drive: arquivo enviado", f.name);
    revalidatePath(`${base(p.id)}/arquivos`);
    go(`${base(p.id)}/arquivos#arquivo-${f.id}`, "msg", updatedExisting ? "Arquivo atualizado no Drive (mesmo arquivo, nova revisão)." : "Arquivo enviado ao Drive. Link anexado.");
  } catch (e) {
    if (e && typeof e === "object" && "digest" in e) throw e; // redirect
    f.drive = { ...(f.drive ?? { url: "", source: "integracao" }), error: errorMessage(e) };
    await saveFileDoc(f);
    go(`${base(p.id)}/arquivos#arquivo-${f.id}`, "err", `Google Drive: ${errorMessage(e)}`);
  }
}

export async function driveDisconnectAction() {
  await requireAdminSession();
  await deleteSecret("google_drive_oauth");
  await recordTest("google_drive", { ok: false, status: "desconectado", message: "Desconectado manualmente." });
  go("/admin/central/integracoes", "msg", "Google Drive desconectado nesta aplicação. Para revogar de vez, remova o acesso na sua conta Google.");
}

/* ------------------------------------------------------------------ */
/* Entregável                                                          */
/* ------------------------------------------------------------------ */

export async function saveDeliverableAction(productId: string, fd: FormData) {
  const p = await loadProduct(productId);
  const d = p.deliverable;
  d.title = str(fd, "title") || p.name;
  d.subtitle = str(fd, "subtitle");
  d.versionLabel = str(fd, "versionLabel");
  d.disclaimer = str(fd, "disclaimer");
  d.sections = d.sections.map((s) => ({
    ...s,
    kicker: str(fd, `${s.id}_kicker`),
    title: str(fd, `${s.id}_title`) || "Sem título",
    body: String(fd.get(`${s.id}_body`) ?? ""),
    steps: str(fd, `${s.id}_steps`),
    prompt: String(fd.get(`${s.id}_prompt`) ?? "").trim(),
    promptLabel: str(fd, `${s.id}_promptLabel`),
    checklist: str(fd, `${s.id}_checklist`),
    table: str(fd, `${s.id}_table`),
    note: str(fd, `${s.id}_note`),
    noteTone: str(fd, `${s.id}_noteTone`) === "atencao" ? "atencao" : "dica",
    imageFileId: str(fd, `${s.id}_imageFileId`),
    imageCaption: str(fd, `${s.id}_imageCaption`),
  }));
  const op = str(fd, "op");
  const [cmd, sid] = op.split(":");
  const idx = d.sections.findIndex((s) => s.id === sid);
  if (cmd === "add") d.sections.push(emptySection(newId()));
  if (cmd === "remove" && idx >= 0) d.sections.splice(idx, 1);
  if (cmd === "up" && idx > 0) [d.sections[idx - 1], d.sections[idx]] = [d.sections[idx], d.sections[idx - 1]];
  if (cmd === "down" && idx >= 0 && idx < d.sections.length - 1) [d.sections[idx + 1], d.sections[idx]] = [d.sections[idx], d.sections[idx + 1]];
  await saveProduct(p);
  revalidatePath(`${base(p.id)}/entregavel`);
  if (cmd === "generate") return generateDeliverablePdfAction(p.id);
  go(`${base(p.id)}/entregavel${cmd === "add" ? `#sec-${d.sections.at(-1)!.id}` : ""}`, "msg", "Conteúdo do entregável salvo.");
}

/* ------------------------------------------------------------------ */
/* Criativos                                                           */
/* ------------------------------------------------------------------ */

export async function createCreativeAction(productId: string, fd: FormData) {
  const p = await loadProduct(productId);
  const conceito = str(fd, "conceito");
  if (!conceito) go(`${base(p.id)}/criativos`, "err", "Descreva o conceito do criativo.");
  const t = now();
  const c: CreativeDoc = {
    id: newId(),
    productId: p.id,
    createdAt: t,
    updatedAt: t,
    conceito,
    mensagem: str(fd, "mensagem"),
    publico: str(fd, "publico"),
    formato: str(fd, "formato"),
    variante: str(fd, "variante") || "A",
    direitosUso: "",
    hipotese: str(fd, "hipotese"),
    briefing: { referencias: "", texto: "", restricoes: "" },
    referenceFileIds: [],
    attempts: [],
    review: {},
    reviewStatus: "rascunho",
    approvedAttemptId: "",
    demonstracaoFicticia: bool(fd, "demonstracaoFicticia"),
  };
  await saveCreative(c);
  await logHistory(p.id, "Criativo criado", conceito);
  revalidatePath(`${base(p.id)}/criativos`);
  go(`${base(p.id)}/criativos?c=${c.id}`, "msg", "Criativo criado. Preencha o briefing.");
}

export async function saveCreativeAction(productId: string, creativeId: string, fd: FormData) {
  const p = await loadProduct(productId);
  const c = await getCreative(creativeId);
  if (!c || c.productId !== p.id) go(`${base(p.id)}/criativos`, "err", "Criativo não encontrado.");
  const back = `${base(p.id)}/criativos?c=${c.id}`;
  Object.assign(c, {
    conceito: str(fd, "conceito") || c.conceito,
    mensagem: str(fd, "mensagem"),
    publico: str(fd, "publico"),
    formato: str(fd, "formato"),
    variante: str(fd, "variante"),
    direitosUso: str(fd, "direitosUso"),
    hipotese: str(fd, "hipotese"),
    demonstracaoFicticia: bool(fd, "demonstracaoFicticia"),
    briefing: { referencias: str(fd, "b_referencias"), texto: str(fd, "b_texto"), restricoes: str(fd, "b_restricoes") },
    referenceFileIds: fd.getAll("referenceFileIds").map(String),
    review: Object.fromEntries(CREATIVE_REVIEW.map((r) => [r.id, bool(fd, `rev_${r.id}`)])),
    approvedAttemptId: str(fd, "approvedAttemptId"),
  });
  const wanted = (str(fd, "reviewStatus") || c.reviewStatus) as ApprovalStatus;
  if (wanted === "aprovado") {
    const missing = CREATIVE_REVIEW.filter((r) => !c.review[r.id]).map((r) => r.text);
    const attempt = c.attempts.find((a) => a.id === c.approvedAttemptId);
    if (!attempt) go(back, "err", "Escolha qual tentativa está sendo aprovada.");
    if (attempt.placeholder) go(back, "err", "Um marcador de posição (placeholder) não pode ser aprovado como criativo.");
    if (!c.direitosUso) go(back, "err", "Registre os direitos de uso antes de aprovar.");
    if (missing.length) go(back, "err", `Revisão incompleta: ${missing.join("; ")}.`);
    const f = await getFile(attempt.fileId);
    if (f) {
      f.category = "criativo_aprovado";
      f.approval = "aprovado";
      await saveFileDoc(f);
    }
  }
  if (c.reviewStatus !== wanted) await logHistory(p.id, "Criativo: revisão", `${c.conceito}: ${c.reviewStatus} → ${wanted}`);
  c.reviewStatus = wanted;
  await saveCreative(c);
  revalidatePath(`${base(p.id)}/criativos`);
  go(back, "msg", "Criativo salvo.");
}

export async function addAttemptAction(productId: string, creativeId: string, fd: FormData) {
  const p = await loadProduct(productId);
  const c = await getCreative(creativeId);
  if (!c || c.productId !== p.id) go(`${base(p.id)}/criativos`, "err", "Criativo não encontrado.");
  const back = `${base(p.id)}/criativos?c=${c.id}`;
  const file = fd.get("file");
  const placeholder = bool(fd, "placeholder");
  if (!(file instanceof File) || file.size === 0) go(back, "err", "Envie o arquivo resultante (imagem).");
  if (file.size > MAX_UPLOAD) go(back, "err", "Arquivo maior que 15 MB.");
  const operation = (str(fd, "operation") || "geracao") as CreativeOperation;
  const doc = await storeBinary(
    {
      productId: p.id,
      name: `${placeholder ? "[PLACEHOLDER] " : ""}${c.conceito} — ${c.variante} — tentativa ${c.attempts.length + 1}`,
      category: "versao_gerada",
      material: "outro",
      approval: "rascunho",
      version: String(c.attempts.length + 1),
      origin: `${operation} · ${str(fd, "provedor") || "provedor não informado"} · ${str(fd, "modelo") || "modelo não informado"}`,
      notes: str(fd, "prompt").slice(0, 2000),
      ficticio: c.demonstracaoFicticia || placeholder,
    },
    new Uint8Array(await file.arrayBuffer()),
    file.type || "application/octet-stream"
  );
  c.attempts.push({
    id: newId(),
    operation,
    fileId: doc.id,
    prompt: String(fd.get("prompt") ?? ""),
    provedor: str(fd, "provedor"),
    modelo: str(fd, "modelo"),
    data: str(fd, "data") || new Date().toISOString().slice(0, 10),
    custo: str(fd, "custo"),
    placeholder,
    observacao: str(fd, "observacao"),
  });
  if (c.reviewStatus === "rascunho") c.reviewStatus = "em_revisao";
  await saveCreative(c);
  await logHistory(p.id, "Criativo: tentativa registrada", `${c.conceito} (${operation})`);
  revalidatePath(`${base(p.id)}/criativos`);
  go(back, "msg", "Tentativa registrada. O arquivo original foi preservado como versão gerada.");
}

/* ------------------------------------------------------------------ */
/* Página e checkout                                                   */
/* ------------------------------------------------------------------ */

export async function savePageAction(productId: string, fd: FormData) {
  const p = await loadProduct(productId);
  const pg = p.page;
  const back = `${base(p.id)}/pagina`;
  for (const k of ["checkoutUrl", "confirmacaoUrl"] as const) {
    const v = str(fd, k);
    if (v) {
      try {
        if (new URL(v).protocol !== "https:") throw new Error();
      } catch {
        go(back, "err", "Links de checkout e confirmação precisam começar com https://");
      }
    }
  }
  const caminho = (str(fd, "caminho") || "indefinido") as SalesPath;
  if (caminho !== "indefinido" && !str(fd, "justificativa")) go(back, "err", "Registre a justificativa da escolha do caminho de venda.");
  const caminhoStatus = (str(fd, "caminhoStatus") || "hipotese") as DecisionStatus;
  if (caminhoStatus === "validado" || caminhoStatus === "testado") {
    go(back, "err", "O caminho de venda só pode ser marcado como testado/validado no Corpo do Produto (campo Funil), com o registro do teste.");
  }
  Object.assign(pg, {
    caminho,
    justificativa: str(fd, "justificativa"),
    caminhoStatus,
    titulo: str(fd, "titulo"),
    subtitulo: str(fd, "subtitulo"),
    secoes: String(fd.get("secoes") ?? ""),
    demonstracao: str(fd, "demonstracao"),
    faq: String(fd.get("faq") ?? ""),
    checkoutUrl: str(fd, "checkoutUrl"),
    confirmacaoUrl: str(fd, "confirmacaoUrl"),
    plataforma: str(fd, "plataforma"),
    cadastroObservado: str(fd, "cadastroObservado"),
    cadastroConfirmado: bool(fd, "cadastroConfirmado"),
  });
  const t = now();
  pg.checks = Object.fromEntries(
    PAGE_CHECKS.map((c) => {
      const ok = bool(fd, `chk_${c.id}`);
      const prev = pg.checks[c.id];
      return [c.id, ok ? { ok, at: prev?.ok ? prev.at : t } : { ok: false }];
    })
  );
  await saveProduct(p);
  await logHistory(p.id, "Página e checkout salvos", pg.caminho);
  revalidatePath(back);
  go(back, "msg", "Página e checkout salvos. Nada foi publicado.");
}

export async function checkPageLinksAction(productId: string) {
  const p = await loadProduct(productId);
  const back = `${base(p.id)}/pagina`;
  const results: string[] = [];
  for (const [label, url] of [["Checkout", p.page.checkoutUrl], ["Confirmação", p.page.confirmacaoUrl]] as const) {
    if (!url) {
      results.push(`${label}: não informado`);
      continue;
    }
    const r = await checkUrl(url);
    results.push(`${label}: ${r.message}`);
  }
  go(back, "msg", results.join(" · "));
}

export async function caktoReadProductAction(productId: string, fd: FormData) {
  const p = await loadProduct(productId);
  const id = str(fd, "caktoProductId");
  const back = `${base(p.id)}/pagina`;
  if (!/^[a-zA-Z0-9-]{4,64}$/.test(id)) go(back, "err", "Informe o id do produto na Cakto.");
  try {
    const snap = await caktoProductSnapshot(id);
    p.page.leituraPlataforma = {
      at: now(),
      fonte: "API da Cakto pelo servidor desta aplicação (somente leitura)",
      resumo: `“${snap.product.name}” (${snap.product.status}), R$ ${snap.product.price}; ${snap.offers.length} oferta(s); ${snap.ordersTotal} pedido(s).`,
      dados: snap,
    };
    await saveProduct(p);
    await recordTest("cakto_api", { ok: true, status: "testado", message: `Leitura do produto ${snap.product.name} ok.` });
    await logHistory(p.id, "Cakto: leitura do cadastro", p.page.leituraPlataforma.resumo);
  } catch (e) {
    await recordTest("cakto_api", { ok: false, status: "erro", message: errorMessage(e) });
    go(back, "err", errorMessage(e));
  }
  revalidatePath(back);
  go(back, "msg", "Cadastro lido na Cakto. Nada foi alterado lá.");
}

/* ------------------------------------------------------------------ */
/* Finanças e Meta                                                     */
/* ------------------------------------------------------------------ */

const FIN_NUMERIC: (keyof FinanceInputs)[] = [
  "preco",
  "taxaPercentual",
  "taxaFixa",
  "tributosPercentual",
  "custoVariavel",
  "reembolsoPercentual",
  "contribuicaoDesejada",
  "custosFixosMensais",
  "gastoAnuncios",
  "comprasAprovadas",
  "receitaAprovada",
  "reembolsosValor",
  "saldoAReceber",
  "caixaDisponivel",
];

export async function saveFinanceAction(productId: string, fd: FormData) {
  const p = await loadProduct(productId);
  const invalid: string[] = [];
  for (const k of FIN_NUMERIC) {
    const raw = str(fd, k);
    const n = parseMoney(raw);
    if (raw && n === null) invalid.push(k);
    (p.finance as unknown as Record<string, number | null>)[k] = n;
  }
  if (invalid.length) go(`${base(p.id)}/financeiro`, "err", `Valores inválidos: ${invalid.join(", ")}. Use números (ex.: 19,90).`);
  p.finance.periodo = str(fd, "periodo");
  p.finance.fonteDados = str(fd, "fonteDados");
  await saveProduct(p);
  await logHistory(p.id, "Finanças atualizadas");
  revalidatePath(`${base(p.id)}/financeiro`);
  go(`${base(p.id)}/financeiro`, "msg", "Premissas salvas. Campos em branco continuam como desconhecidos.");
}

export async function metaReportAction(productId: string, fd: FormData) {
  const p = await loadProduct(productId);
  const back = `${base(p.id)}/financeiro`;
  const since = str(fd, "since");
  const until = str(fd, "until");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(since) || !/^\d{4}-\d{2}-\d{2}$/.test(until) || since > until) {
    go(back, "err", "Informe um período válido.");
  }
  try {
    const report = await metaInsights(since, until, str(fd, "campaign"));
    p.metaReports = [report, ...(p.metaReports ?? [])].slice(0, 20);
    await saveProduct(p);
    await recordTest("meta", { ok: true, status: "testado", message: `Relatório ${since} a ${until} lido.` });
  } catch (e) {
    await recordTest("meta", { ok: false, status: "erro", message: errorMessage(e) });
    go(back, "err", `Meta: ${errorMessage(e)}`);
  }
  revalidatePath(back);
  go(back, "msg", "Relatório da Meta lido (somente leitura).");
}

/* ------------------------------------------------------------------ */
/* Integrações                                                         */
/* ------------------------------------------------------------------ */

export async function testIntegrationAction(key: IntegrationKey) {
  await requireAdminSession();
  const back = "/admin/central/integracoes";
  try {
    if (key === "armazenamento") {
      const store = getStore();
      const probe = { id: "armazenamento-probe", productId: null, createdAt: now(), updatedAt: now() };
      await store.put("integrations", probe);
      const back2 = await store.get("integrations", "armazenamento-probe");
      await store.remove("integrations", "armazenamento-probe");
      if (!back2) throw new Error("Gravação não pôde ser relida.");
      await recordTest(key, { ok: true, status: "testado", message: `Gravar, reler e apagar funcionou (${store.info().label}).` });
    } else if (key === "google_drive") {
      const user = await driveWhoAmI();
      await recordTest(key, { ok: true, status: "testado", message: `Conta: ${user.displayName} <${user.emailAddress}>. Escopo: drive.file.` });
    } else if (key === "cakto_api") {
      const r = await caktoTest();
      const hasWrite = r.scope.split(" ").includes("write");
      await recordTest(key, {
        ok: true,
        status: "testado",
        message: `Token obtido; ${r.products.length} produto(s) lidos. Escopos: ${r.scope || "não informados"}.${hasWrite ? " Atenção: a chave tem escopo de escrita — para esta integração bastam escopos de leitura." : ""}`,
        detail: { products: r.products },
      });
    } else if (key === "meta") {
      const r = await metaTest();
      if (!r.hasRead) {
        await recordTest(key, { ok: false, status: "permissao_insuficiente", message: `Token válido, mas sem ads_read. Permissões: ${r.granted.join(", ") || "nenhuma"}.` });
      } else {
        await recordTest(key, { ok: true, status: "testado", message: `Conta “${r.account?.name}” (${r.account?.currency}, fuso ${r.account?.timezone_name}).` });
      }
    } else {
      go(back, "err", "Esta integração não tem teste automático.");
    }
  } catch (e) {
    if (e && typeof e === "object" && "digest" in e) throw e;
    const msg = errorMessage(e);
    const status = /HTTP 40[13]/.test(msg) ? "permissao_insuficiente" : "erro";
    await recordTest(key, { ok: false, status, message: msg });
    go(back, "err", msg);
  }
  revalidatePath(back);
  go(back, "msg", "Teste executado. Veja o resultado no cartão.");
}

/* ------------------------------------------------------------------ */
/* Experimentos e biblioteca de casos                                  */
/* ------------------------------------------------------------------ */

export async function saveExperimentAction(productId: string, fd: FormData) {
  const p = await loadProduct(productId);
  const id = str(fd, "id") || newId();
  const t = now();
  const e: ExperimentDoc = {
    id,
    productId: p.id,
    createdAt: str(fd, "createdAt") || t,
    updatedAt: t,
    pergunta: str(fd, "pergunta"),
    hipotese: str(fd, "hipotese"),
    metodo: str(fd, "metodo"),
    limite: str(fd, "limite"),
    criterioParada: str(fd, "criterioParada"),
    periodo: str(fd, "periodo"),
    resultado: str(fd, "resultado"),
    conclusao: (str(fd, "conclusao") || "em_andamento") as ExperimentDoc["conclusao"],
    proximoPasso: str(fd, "proximoPasso"),
  };
  if (!e.pergunta) go(`${base(p.id)}/versoes#experimentos`, "err", "Escreva a pergunta do teste.");
  if (e.conclusao !== "em_andamento" && !e.resultado) go(`${base(p.id)}/versoes#experimentos`, "err", "Para encerrar o teste, registre o resultado (pode ser inconclusivo).");
  await saveExperiment(e);
  await logHistory(p.id, "Registro de teste", `${e.pergunta} — ${e.conclusao}`);
  revalidatePath(`${base(p.id)}/versoes`);
  go(`${base(p.id)}/versoes#experimentos`, "msg", "Registro de teste salvo.");
}

export async function saveCaseAction(fd: FormData) {
  await requireAdminSession();
  const titulo = str(fd, "titulo");
  if (!titulo) go("/admin/central/casos", "err", "Dê um título ao caso.");
  const t = now();
  const c: CaseDoc = {
    id: str(fd, "id") || newId(),
    productId: null,
    createdAt: str(fd, "createdAt") || t,
    updatedAt: t,
    titulo,
    fonte: str(fd, "fonte"),
    contexto: str(fd, "contexto"),
    intervencao: str(fd, "intervencao"),
    comparacao: str(fd, "comparacao"),
    periodo: str(fd, "periodo"),
    custos: str(fd, "custos"),
    resultado: str(fd, "resultado"),
    limitacoes: str(fd, "limitacoes"),
    transferencia: str(fd, "transferencia"),
    nivel: (str(fd, "nivel") || "relato_terceiro") as CaseDoc["nivel"],
    statusLocal: (str(fd, "statusLocal") || "hipotese_local") as CaseDoc["statusLocal"],
  };
  if (c.statusLocal === "testado_localmente" && !c.resultado) go("/admin/central/casos", "err", "Para marcar como testado localmente, registre o resultado do seu teste.");
  await saveCase(c);
  revalidatePath("/admin/central/casos");
  go("/admin/central/casos", "msg", "Caso salvo. Estratégia de terceiro continua hipótese local até ser testada aqui.");
}
