import { Document, Image, Link, Page, Text, View, renderToBuffer } from "@react-pdf/renderer";
import {
  BODY_FIELDS,
  BODY_GROUPS,
  DECISION_STATUS,
  EVIDENCE_KINDS,
  FILE_CATEGORIES,
  STAGES,
  STAGE_STATUS,
  type EvidenceDoc,
  type FileDoc,
  type ProductDoc,
  type TaskDoc,
} from "../model";
import { computeFinance, type Calc } from "../logic";
import { Bullets, C, Checklist, Flow, Footer, RichText, Table, lines, parseTable, registerFonts, s } from "./shared";

const brl = (c: Calc) =>
  c.known ? c.value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : `não calculado — ${c.reason}`;

const stageColor: Record<string, string> = {
  concluido: C.green,
  em_andamento: C.orange,
  bloqueado: "#b42318",
  nao_iniciado: C.gray,
};

/* ------------------------------------------------------------------ */
/* Corpo do Produto (documento INTERNO)                                */
/* ------------------------------------------------------------------ */

export async function renderCorpoPdf(input: {
  product: ProductDoc;
  evidences: EvidenceDoc[];
  tasks: TaskDoc[];
  files: FileDoc[];
  versionNumber: number;
}): Promise<Uint8Array> {
  registerFonts();
  const { product, evidences, tasks, files } = input;
  const generated = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
  const fin = computeFinance(product.finance);
  const footer = `Corpo do Produto · ${product.name} · documento interno · v${input.versionNumber}`;
  const links = files.filter((f) => f.kind === "link" && f.url);

  const doc = (
    <Document title={`Corpo do Produto — ${product.name}`} author="Central de Produtos" language="pt-BR">
      <Page size="A4" style={s.page}>
        <Text style={s.kicker}>Documento interno · não é o entregável vendido</Text>
        <Text style={s.h1}>Corpo do Produto — {product.name}</Text>
        <Text style={s.small}>
          Versão {product.versionLabel} · exportação v{input.versionNumber} · gerado em {generated} (horário de Brasília)
          {product.dadosFicticios ? " · CONTÉM DADOS FICTÍCIOS DE DEMONSTRAÇÃO" : ""}
        </Text>
        {product.descricao ? <Text style={[s.p, { marginTop: 8 }]}>{product.descricao}</Text> : null}

        <Text style={s.h2}>Como ler os estados</Text>
        <Table
          widths={[1, 3]}
          rows={[["Estado", "Significado"], ...Object.values(DECISION_STATUS).map((d) => [d.label, d.help])]}
        />

        <Text style={s.h2}>Mapa da operação</Text>
        <Flow
          steps={STAGES.slice(0, 5).map((st) => st.short)}
          colors={STAGES.slice(0, 5).map((st) => stageColor[product.stages[st.key].status])}
        />
        <Flow
          steps={STAGES.slice(5).map((st) => st.short)}
          colors={STAGES.slice(5).map((st) => stageColor[product.stages[st.key].status])}
        />
        <Table
          widths={[2, 1.2, 3]}
          rows={[
            ["Etapa", "Situação", "Notas / evidência de conclusão"],
            ...STAGES.map((st) => {
              const state = product.stages[st.key];
              return [
                `${st.label}${st.key === product.currentStage ? " (atual)" : ""}`,
                STAGE_STATUS[state.status],
                [state.evidenciaConclusao && `Evidência: ${state.evidenciaConclusao}`, state.notas].filter(Boolean).join(" · ") || "—",
              ];
            }),
          ]}
        />
        <Footer left={footer} />
      </Page>

      <Page size="A4" style={s.page}>
        {BODY_GROUPS.map((group) => (
          <View key={group}>
            <Text style={s.h2}>{group}</Text>
            <Table
              widths={[1.3, 4, 1.1]}
              rows={[
                ["Campo", "Definição atual", "Situação"],
                ...BODY_FIELDS.filter((f) => f.group === group).map((f) => {
                  const v = product.body[f.key];
                  const val = v?.validation;
                  const extra =
                    val && (v.status === "testado" || v.status === "validado")
                      ? `\n[${Object.entries(val)
                          .filter(([, x]) => x)
                          .map(([k, x]) => `${k}: ${x}`)
                          .join("; ")}]`
                      : "";
                  return [f.label, (v?.value || "—") + extra, DECISION_STATUS[v?.status ?? "pendente"].label];
                }),
              ]}
            />
          </View>
        ))}
        <Footer left={footer} />
      </Page>

      <Page size="A4" style={s.page}>
        <Text style={s.h2}>Evidências registradas</Text>
        {evidences.length === 0 ? (
          <Text style={s.p}>Nenhuma evidência registrada. Nenhuma conclusão deste documento está validada por uso ou compra.</Text>
        ) : (
          <Table
            widths={[2, 1.4, 1.2, 2.4, 2]}
            rows={[
              ["Evidência", "Tipo", "Amostra", "Resultado", "Limitações"],
              ...evidences.map((e) => [
                `${e.title}${e.ficticio ? " (FICTÍCIA)" : ""}`,
                `${EVIDENCE_KINDS[e.kind].label} — ${EVIDENCE_KINDS[e.kind].strength}`,
                e.amostra || "—",
                e.resultado || "—",
                e.limitacoes || "—",
              ]),
            ]}
          />
        )}

        <Text style={s.h2}>Ficha financeira</Text>
        <Text style={s.small}>Premissas em branco não são tratadas como zero. Valores informados são premissas, não resultados.</Text>
        <Table
          widths={[2, 3]}
          rows={[
            ["Indicador", "Valor"],
            ["Margem antes do anúncio", brl(fin.margemAntesAnuncio)],
            ["CPA alvo", brl(fin.cpaAlvo)],
            [
              "ROAS de equilíbrio",
              fin.roasEquilibrio.known ? fin.roasEquilibrio.value.toFixed(2) : `não calculado — ${fin.roasEquilibrio.reason}`,
            ],
            ["CPA observado", brl(fin.cpaReal)],
            ["Contribuição no período", brl(fin.contribuicaoPeriodo)],
          ]}
        />

        <Text style={s.h2}>Tarefas</Text>
        {tasks.length === 0 ? (
          <Text style={s.p}>Nenhuma tarefa planejada.</Text>
        ) : (
          <Table
            widths={[1.4, 3.4, 1, 2]}
            rows={[
              ["Etapa", "Tarefa", "Situação", "Evidência"],
              ...tasks
                .sort((a, b) => a.order - b.order)
                .map((t) => [
                  STAGES.find((x) => x.key === t.stageKey)?.short ?? t.stageKey,
                  t.title,
                  t.status === "feito" ? "Feito" : t.status === "fazendo" ? "Fazendo" : "A fazer",
                  t.evidencia || "—",
                ]),
            ]}
          />
        )}

        <Text style={s.h2}>Arquivos e links vinculados</Text>
        {files.length === 0 ? (
          <Text style={s.p}>Nenhum arquivo vinculado.</Text>
        ) : (
          <Table
            widths={[3, 1.6, 1, 1.4]}
            rows={[
              ["Nome", "Categoria", "Versão", "Aprovação"],
              ...files.map((f) => [f.name, FILE_CATEGORIES[f.category].label, f.version || "—", f.approval]),
            ]}
          />
        )}
        {links.length > 0 && (
          <View>
            <Text style={[s.small, { marginTop: 4 }]}>Links (clicáveis):</Text>
            {links.map((l) => (
              <Link key={l.id} src={l.url!} style={[s.link, { fontSize: 8.4, marginBottom: 2 }]}>
                {l.name}
              </Link>
            ))}
          </View>
        )}
        <Footer left={footer} />
      </Page>
    </Document>
  );
  return new Uint8Array(await renderToBuffer(doc));
}

/* ------------------------------------------------------------------ */
/* Entregável vendido (PDF ilustrado)                                  */
/* ------------------------------------------------------------------ */

export interface DeliverableImage {
  data: Buffer;
  format: "png" | "jpg";
}

export async function renderDeliverablePdf(input: {
  product: ProductDoc;
  images: Record<string, DeliverableImage>;
}): Promise<Uint8Array> {
  registerFonts();
  const d = input.product.deliverable;
  const footer = `${d.title} · ${d.versionLabel}`;

  const doc = (
    <Document title={d.title} author={d.title} language="pt-BR">
      <Page size="A4" style={[s.page, { justifyContent: "space-between" }]}>
        <View style={{ marginTop: 150 }}>
          <Text style={s.kicker}>Guia prático em PDF</Text>
          <Text style={{ fontSize: 40, fontWeight: 700, lineHeight: 1.05 }}>{d.title}</Text>
          {d.subtitle ? <Text style={{ fontSize: 14, marginTop: 10, maxWidth: 380, lineHeight: 1.4 }}>{d.subtitle}</Text> : null}
        </View>
        <View style={{ borderTopWidth: 0.7, borderColor: C.line, paddingTop: 8 }}>
          <Text style={s.small}>Versão {d.versionLabel}</Text>
          {d.disclaimer ? <Text style={s.small}>{d.disclaimer}</Text> : null}
        </View>
      </Page>

      {d.sections.map((sec) => {
        const img = sec.imageFileId ? input.images[sec.imageFileId] : undefined;
        return (
          <Page key={sec.id} size="A4" style={s.page}>
            {sec.kicker ? <Text style={s.kicker}>{sec.kicker}</Text> : null}
            <Text style={s.h1}>{sec.title}</Text>
            {sec.steps.trim() ? <Flow steps={lines(sec.steps)} /> : null}
            {sec.body.trim() ? <RichText text={sec.body} /> : null}
            {img ? (
              <View style={{ marginVertical: 8 }} wrap={false}>
                <Image src={{ data: img.data, format: img.format }} style={{ maxHeight: 260, objectFit: "contain" }} />
                {sec.imageCaption ? <Text style={[s.small, { marginTop: 3 }]}>{sec.imageCaption}</Text> : null}
              </View>
            ) : null}
            {sec.table.trim() ? <Table rows={parseTable(sec.table)} /> : null}
            {sec.checklist.trim() ? <Checklist items={lines(sec.checklist)} /> : null}
            {sec.prompt.trim() ? (
              <View style={s.prompt} wrap={false}>
                {sec.promptLabel ? <Text style={s.label}>{sec.promptLabel}</Text> : null}
                <Text>{sec.prompt}</Text>
              </View>
            ) : null}
            {sec.note.trim() ? (
              <View
                style={[
                  s.note,
                  sec.noteTone === "atencao"
                    ? { backgroundColor: C.orangeSoft, borderColor: "#f3cdb6" }
                    : { backgroundColor: C.tealSoft, borderColor: "#bcdfe1" },
                ]}
                wrap={false}
              >
                <Text>{sec.note}</Text>
              </View>
            ) : null}
            <Footer left={footer} />
          </Page>
        );
      })}

      <Page size="A4" style={s.page}>
        <Text style={s.kicker}>Anexo</Text>
        <Text style={s.h1}>Prompts para copiar</Text>
        {d.sections.filter((x) => x.prompt.trim()).length === 0 ? (
          <Text style={s.p}>Nenhum prompt neste material.</Text>
        ) : (
          d.sections
            .filter((x) => x.prompt.trim())
            .map((x) => (
              <View key={x.id} style={s.prompt} wrap={false}>
                <Text style={s.label}>{x.promptLabel || x.title}</Text>
                <Text>{x.prompt}</Text>
              </View>
            ))
        )}
        <Bullets items={["Troque o que estiver entre colchetes.", "Peça uma correção por vez e revise com a foto original ao lado."]} />
        <Footer left={footer} />
      </Page>
    </Document>
  );
  return new Uint8Array(await renderToBuffer(doc));
}
