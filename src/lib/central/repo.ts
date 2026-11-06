import "server-only";
import { getStore } from "./store";
import { blankProduct, newId, now } from "./factory";

export { blankProduct, newId, now };
import {
  emptyBody,
  emptyFinance,
  emptyPage,
  emptyStages,
  emptySection,
  type CaseDoc,
  type CreativeDoc,
  type EvidenceDoc,
  type ExperimentDoc,
  type FileDoc,
  type HistoryDoc,
  type ProductDoc,
  type TaskDoc,
  type VersionDoc,
} from "./model";


/* ---------------- Produtos ---------------- */

export async function listProducts(): Promise<ProductDoc[]> {
  const all = await getStore().list<ProductDoc>("products");
  return all.filter((p) => !p.archived);
}

export async function getProduct(id: string): Promise<ProductDoc | null> {
  if (!/^[a-zA-Z0-9_-]{1,80}$/.test(id)) return null;
  return getStore().get<ProductDoc>("products", id);
}

export async function saveProduct(product: ProductDoc): Promise<ProductDoc> {
  product.updatedAt = now();
  product.productId = product.id; // facilita filtros por produto em todas as coleções
  return getStore().put("products", product);
}

// Duplica só a ESTRUTURA: campos vazios e pendentes, etapas zeradas,
// seções do entregável sem conteúdo. Nenhuma conclusão, evidência, preço,
// arquivo ou decisão do produto de origem é herdado.
export async function duplicateStructure(
  source: ProductDoc,
  name: string,
  niche: string,
  copyTaskTitles: boolean
): Promise<ProductDoc> {
  const product = blankProduct(name, niche);
  product.deliverable.sections = source.deliverable.sections.map((s) => ({
    ...emptySection(newId()),
    kicker: s.kicker,
    title: s.title,
  }));
  await saveProduct(product);
  if (copyTaskTitles) {
    const tasks = await listTasks(source.id);
    for (const t of tasks) {
      await saveTask({
        ...t,
        id: newId(),
        productId: product.id,
        status: "a_fazer",
        responsavel: "",
        evidencia: "",
        dependsOn: [],
        createdAt: now(),
        updatedAt: now(),
      });
    }
  }
  await logHistory(product.id, "Produto criado", `Estrutura duplicada de “${source.name}” sem herdar conclusões.`);
  return product;
}

/* ---------------- Histórico ---------------- */

export async function logHistory(productId: string | null, action: string, detail = "") {
  const t = now();
  const doc: HistoryDoc = { id: newId(), productId, createdAt: t, updatedAt: t, action, detail };
  await getStore().put("history", doc);
}

export async function listHistory(productId: string) {
  const items = await getStore().list<HistoryDoc>("history", { productId });
  return items.reverse();
}

/* ---------------- Evidências ---------------- */

export const listEvidences = (productId: string) => getStore().list<EvidenceDoc>("evidences", { productId });
export const saveEvidence = (e: EvidenceDoc) => getStore().put("evidences", { ...e, updatedAt: now() });
export const removeEvidence = (id: string) => getStore().remove("evidences", id);

/* ---------------- Tarefas ---------------- */

export const listTasks = (productId: string) => getStore().list<TaskDoc>("tasks", { productId });
export const getTask = (id: string) => getStore().get<TaskDoc>("tasks", id);
export const saveTask = (t: TaskDoc) => getStore().put("tasks", { ...t, updatedAt: now() });
export const removeTask = (id: string) => getStore().remove("tasks", id);

/* ---------------- Versões ---------------- */

export async function listVersions(productId: string) {
  const v = await getStore().list<VersionDoc>("versions", { productId });
  return v.sort((a, b) => b.number - a.number);
}

export const getVersion = (id: string) => getStore().get<VersionDoc>("versions", id);

export async function saveVersion(product: ProductDoc, label: string, note: string): Promise<VersionDoc> {
  const [versions, evidences, tasks] = await Promise.all([
    listVersions(product.id),
    listEvidences(product.id),
    listTasks(product.id),
  ]);
  const t = now();
  const version: VersionDoc = {
    id: newId(),
    productId: product.id,
    createdAt: t,
    updatedAt: t,
    number: (versions[0]?.number ?? 0) + 1,
    label: label || product.versionLabel,
    note,
    snapshot: { product: structuredClone(product), evidences, tasks },
  };
  await getStore().put("versions", version);
  await logHistory(product.id, "Versão salva", `v${version.number} — ${version.label}${note ? `: ${note}` : ""}`);
  return version;
}

/* ---------------- Arquivos ---------------- */

export const listFiles = (productId: string) => getStore().list<FileDoc>("files", { productId });
export const getFile = (id: string) => getStore().get<FileDoc>("files", id);
export const saveFileDoc = (f: FileDoc) => getStore().put("files", { ...f, updatedAt: now() });

export function safeFileName(name: string) {
  return (
    name
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-zA-Z0-9._-]+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 80) || "arquivo"
  );
}

export async function storeBinary(
  base: Omit<FileDoc, "id" | "createdAt" | "updatedAt" | "storageKey" | "size" | "contentType" | "kind">,
  bytes: Uint8Array,
  contentType: string
): Promise<FileDoc> {
  const id = newId();
  const key = `${base.productId}/${id}/${safeFileName(base.name)}`;
  await getStore().putFile(key, bytes, contentType);
  const t = now();
  const doc: FileDoc = {
    ...base,
    id,
    kind: "arquivo",
    createdAt: t,
    updatedAt: t,
    storageKey: key,
    size: bytes.byteLength,
    contentType,
  };
  await getStore().put("files", doc);
  return doc;
}

export async function readBinary(file: FileDoc) {
  return file.storageKey ? getStore().getFile(file.storageKey) : null;
}

export async function removeFileDoc(file: FileDoc) {
  if (file.storageKey) await getStore().removeFile(file.storageKey);
  await getStore().remove("files", file.id);
}

/* ---------------- Criativos, experimentos, casos ---------------- */

export const listCreatives = (productId: string) => getStore().list<CreativeDoc>("creatives", { productId });
export const getCreative = (id: string) => getStore().get<CreativeDoc>("creatives", id);
export const saveCreative = (c: CreativeDoc) => getStore().put("creatives", { ...c, updatedAt: now() });

export const listExperiments = (productId: string) => getStore().list<ExperimentDoc>("experiments", { productId });
export const saveExperiment = (e: ExperimentDoc) => getStore().put("experiments", { ...e, updatedAt: now() });

export const listCases = () => getStore().list<CaseDoc>("cases");
export const saveCase = (c: CaseDoc) => getStore().put("cases", { ...c, updatedAt: now() });
