// Regras puras (sem I/O): finanças, próxima ação, manifesto e comparação.

import {
  BODY_FIELDS,
  STAGES,
  STAGE_BY_KEY,
  type EvidenceDoc,
  type FileDoc,
  type FinanceInputs,
  type ProductDoc,
  type TaskDoc,
} from "./model";

/* ------------------------------------------------------------------ */
/* Finanças                                                            */
/* ------------------------------------------------------------------ */

export type Calc =
  | { known: true; value: number }
  | { known: false; reason: string };

const unknown = (reason: string): Calc => ({ known: false, reason });
const known = (value: number): Calc => ({ known: true, value: Math.round(value * 100) / 100 });

const FINANCE_LABELS: Partial<Record<keyof FinanceInputs, string>> = {
  preco: "preço",
  taxaPercentual: "taxa percentual da plataforma",
  taxaFixa: "taxa fixa por venda",
  tributosPercentual: "tributos provisionados",
  custoVariavel: "custo variável de entrega e suporte",
  reembolsoPercentual: "provisão de reembolsos",
  contribuicaoDesejada: "contribuição desejada",
};

function missing(inputs: FinanceInputs, keys: (keyof FinanceInputs)[]): string[] {
  return keys.filter((k) => inputs[k] === null || inputs[k] === undefined).map((k) => FINANCE_LABELS[k] ?? String(k));
}

export interface FinanceResult {
  margemAntesAnuncio: Calc;
  cpaAlvo: Calc;
  roasEquilibrio: Calc;
  cpaReal: Calc;
  roasReal: Calc;
  ticketMedio: Calc;
  contribuicaoPeriodo: Calc;
}

// Margem antes do anúncio = preço − taxas − tributos − custo variável − provisão de reembolso.
// Qualquer premissa desconhecida torna o resultado desconhecido: nunca
// tratamos "em branco" como zero.
export function computeFinance(f: FinanceInputs): FinanceResult {
  const baseKeys: (keyof FinanceInputs)[] = [
    "preco",
    "taxaPercentual",
    "taxaFixa",
    "tributosPercentual",
    "custoVariavel",
    "reembolsoPercentual",
  ];
  const baseMissing = missing(f, baseKeys);
  let margem: Calc;
  if (baseMissing.length) {
    margem = unknown(`Faltam: ${baseMissing.join(", ")}.`);
  } else {
    const preco = f.preco!;
    margem = known(
      preco -
        (preco * f.taxaPercentual!) / 100 -
        f.taxaFixa! -
        (preco * f.tributosPercentual!) / 100 -
        f.custoVariavel! -
        (preco * f.reembolsoPercentual!) / 100
    );
  }

  const cpaAlvo: Calc = !margem.known
    ? unknown("Depende da margem antes do anúncio.")
    : f.contribuicaoDesejada === null
      ? unknown("Falta: contribuição desejada por compra.")
      : known(margem.value - f.contribuicaoDesejada);

  const roasEquilibrio: Calc = !margem.known
    ? unknown("Depende da margem antes do anúncio.")
    : margem.value <= 0
      ? unknown("Margem zero ou negativa: não existe ROAS de equilíbrio.")
      : known(f.preco! / margem.value);

  // CPA sem compras não é zero: não há denominador.
  const cpaReal: Calc =
    f.gastoAnuncios === null || f.comprasAprovadas === null
      ? unknown("Gasto ou compras não informados (não medido).")
      : f.comprasAprovadas === 0
        ? unknown("Sem compras aprovadas no período: CPA indefinido (não é zero).")
        : known(f.gastoAnuncios / f.comprasAprovadas);

  const roasReal: Calc =
    f.gastoAnuncios === null || f.receitaAprovada === null
      ? unknown("Gasto ou receita não informados.")
      : f.gastoAnuncios === 0
        ? unknown("Sem gasto no período.")
        : known(f.receitaAprovada / f.gastoAnuncios);

  const ticketMedio: Calc =
    f.receitaAprovada === null || f.comprasAprovadas === null
      ? unknown("Receita ou compras não informadas.")
      : f.comprasAprovadas === 0
        ? unknown("Sem compras: ticket indefinido.")
        : known(f.receitaAprovada / f.comprasAprovadas);

  const contribuicaoPeriodo: Calc =
    !margem.known
      ? unknown("Depende da margem antes do anúncio.")
      : f.comprasAprovadas === null || f.gastoAnuncios === null
        ? unknown("Compras ou gasto não informados.")
        : known(margem.value * f.comprasAprovadas - f.gastoAnuncios);

  return { margemAntesAnuncio: margem, cpaAlvo, roasEquilibrio, cpaReal, roasReal, ticketMedio, contribuicaoPeriodo };
}

/* ------------------------------------------------------------------ */
/* Próxima ação                                                        */
/* ------------------------------------------------------------------ */

export interface NextAction {
  title: string;
  detail: string;
  href: string;
}

export function computeNextActions(product: ProductDoc, tasks: TaskDoc[], files: FileDoc[]): NextAction[] {
  const base = `/admin/central/${product.id}`;
  const actions: NextAction[] = [];
  const stage = STAGE_BY_KEY[product.currentStage];
  const state = product.stages[product.currentStage];

  const openTasks = tasks
    .filter((t) => t.stageKey === product.currentStage && t.status !== "feito")
    .sort((a, b) => a.order - b.order);
  const blocked = (t: TaskDoc) =>
    t.dependsOn.some((id) => tasks.find((d) => d.id === id && d.status !== "feito"));
  const ready = openTasks.find((t) => !blocked(t));
  if (ready) {
    actions.push({
      title: ready.title,
      detail: `Tarefa da etapa atual (${stage.label}).`,
      href: `${base}/tarefas#${ready.id}`,
    });
  }

  const unchecked = stage.checklist.find((c) => !state.checklist[c.id]);
  if (unchecked) {
    actions.push({
      title: unchecked.text,
      detail: `Item de verificação de “${stage.label}”${unchecked.kind === "teste_real" ? " — exige teste real, não só cadastro" : ""}.`,
      href: `${base}#etapa-${stage.key}`,
    });
  }

  const pendingFields = BODY_FIELDS.filter((f) => product.body[f.key]?.status === "pendente");
  if (pendingFields.length) {
    actions.push({
      title: `Preencher ${pendingFields.length} campo(s) pendente(s) do Corpo do Produto`,
      detail: pendingFields.slice(0, 4).map((f) => f.label).join(", ") + (pendingFields.length > 4 ? "..." : ""),
      href: `${base}/corpo`,
    });
  }

  const approvedWithoutDrive = files.filter(
    (f) => f.category === "arquivo_final" && f.approval === "aprovado" && !f.drive?.url
  );
  if (approvedWithoutDrive.length) {
    actions.push({
      title: "Anexar link do Drive aos entregáveis aprovados",
      detail: approvedWithoutDrive.map((f) => f.name).join(", "),
      href: `${base}/arquivos`,
    });
  }

  if (!actions.length) {
    actions.push({
      title: "Registrar evidência de conclusão da etapa atual",
      detail: `Quando “${stage.label}” estiver de fato concluída, registre a evidência e avance.`,
      href: `${base}#etapa-${stage.key}`,
    });
  }
  return actions;
}

/** Etapas anteriores à atual que não estão concluídas com evidência. */
export function unvalidatedEarlierStages(product: ProductDoc) {
  const idx = STAGES.findIndex((s) => s.key === product.currentStage);
  return STAGES.slice(0, idx).filter((s) => {
    const st = product.stages[s.key];
    return st.status !== "concluido" || !st.evidenciaConclusao.trim();
  });
}

/* ------------------------------------------------------------------ */
/* Manifesto de entregáveis                                            */
/* ------------------------------------------------------------------ */

export interface ManifestRow {
  item: string;
  file?: FileDoc;
  problems: string[];
}

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Cada linha do campo "Entregáveis" do Corpo do Produto é um item esperado.
// O arquivo correspondente é o entregável (arquivo_final) marcado com
// aquele item no nome ou nas notas. Aponta ausência, link quebrado, falta
// de aprovação e falta do link do Drive.
export function buildManifest(product: ProductDoc, files: FileDoc[]): ManifestRow[] {
  const items = (product.body.entregaveis?.value ?? "")
    .split("\n")
    .map((l) => l.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);
  const finals = files.filter((f) => f.category === "arquivo_final");

  return items.map((item) => {
    const key = normalize(item);
    const file = finals.find((f) => {
      const tag = normalize(`${f.name} ${f.notes}`);
      return tag.includes(key) || key.split(" ").filter((w) => w.length > 3).every((w) => tag.includes(w));
    });
    const problems: string[] = [];
    if (!file) problems.push("Arquivo ausente");
    else {
      if (file.kind === "arquivo" && !file.storageKey) problems.push("Arquivo sem conteúdo salvo");
      if (file.kind === "link" && file.linkCheck?.status !== "ok")
        problems.push(file.linkCheck?.status === "quebrado" ? "Link quebrado" : "Link não verificado");
      if (file.approval !== "aprovado") problems.push(`Não aprovado (${file.approval})`);
      if (!file.drive?.url) problems.push("Sem link do Drive");
      else if (file.drive.source === "manual") problems.push("Link do Drive informado manualmente (não verificado)");
    }
    return { item, file, problems };
  });
}

/* ------------------------------------------------------------------ */
/* Comparação de versões                                               */
/* ------------------------------------------------------------------ */

export interface FieldDiff {
  label: string;
  before: string;
  after: string;
  kind: "valor" | "estado" | "valor e estado";
}

export function diffProducts(a: ProductDoc, b: ProductDoc): FieldDiff[] {
  const diffs: FieldDiff[] = [];
  for (const f of BODY_FIELDS) {
    const x = a.body[f.key] ?? { value: "", status: "pendente" };
    const y = b.body[f.key] ?? { value: "", status: "pendente" };
    const valueChanged = x.value.trim() !== y.value.trim();
    const statusChanged = x.status !== y.status;
    if (valueChanged || statusChanged) {
      diffs.push({
        label: f.label,
        before: `${x.value || "—"} [${x.status}]`,
        after: `${y.value || "—"} [${y.status}]`,
        kind: valueChanged && statusChanged ? "valor e estado" : valueChanged ? "valor" : "estado",
      });
    }
  }
  for (const s of STAGES) {
    const x = a.stages[s.key];
    const y = b.stages[s.key];
    if (x?.status !== y?.status) {
      diffs.push({ label: `Etapa: ${s.label}`, before: x?.status ?? "—", after: y?.status ?? "—", kind: "estado" });
    }
  }
  if (a.name !== b.name) diffs.push({ label: "Nome", before: a.name, after: b.name, kind: "valor" });
  return diffs;
}

export function evidenceSummary(evidences: EvidenceDoc[]) {
  return {
    total: evidences.length,
    reais: evidences.filter((e) => !e.ficticio).length,
    compras: evidences.filter((e) => e.kind === "compra" && !e.ficticio).length,
  };
}
