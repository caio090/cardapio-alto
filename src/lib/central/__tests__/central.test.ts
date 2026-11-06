import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import { checkDecisionStatus, emptyFinance, type FileDoc } from "../model";
import { buildManifest, computeFinance, computeNextActions, diffProducts, unvalidatedEarlierStages } from "../logic";
import { buildCriadorPng } from "../seed-criador-png";
import { createLocalStore } from "../store/local";
import { renderCorpoPdf, renderDeliverablePdf } from "../pdf/documents";

describe("estados de decisão", () => {
  it("validado exige todos os campos do registro", () => {
    const r = checkDecisionStatus("validado", { fonte: "entrevistas", resultado: "4 de 5 aplicaram" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.missing).toContain("Limitações");
  });
  it("hipótese não exige registro", () => {
    expect(checkDecisionStatus("hipotese", undefined).ok).toBe(true);
  });
  it("testado exige método, período e resultado", () => {
    expect(checkDecisionStatus("testado", { metodo: "teste de uso", periodo: "nov/26", resultado: "ok" }).ok).toBe(true);
    expect(checkDecisionStatus("testado", { metodo: "teste de uso" }).ok).toBe(false);
  });
});

describe("finanças", () => {
  it("premissa em branco não vira zero", () => {
    const r = computeFinance({ ...emptyFinance(), preco: 49 });
    expect(r.margemAntesAnuncio.known).toBe(false);
    expect(r.cpaAlvo.known).toBe(false);
  });
  it("reproduz o exemplo didático do guia (R$ 49 → margem 35 → CPA alvo 25)", () => {
    const r = computeFinance({
      ...emptyFinance(),
      preco: 49,
      taxaPercentual: 0,
      taxaFixa: 7,
      tributosPercentual: 0,
      custoVariavel: 4,
      reembolsoPercentual: 0,
      contribuicaoDesejada: 10,
    });
    // 49 - 7 - 4 = 38 (o exemplo do guia também provisiona R$ 3 de reembolso)
    expect(r.margemAntesAnuncio).toEqual({ known: true, value: 38 });
    const r2 = computeFinance({ ...emptyFinance(), preco: 49, taxaPercentual: 0, taxaFixa: 10, tributosPercentual: 0, custoVariavel: 4, reembolsoPercentual: 0, contribuicaoDesejada: 10 });
    expect(r2.margemAntesAnuncio).toEqual({ known: true, value: 35 });
    expect(r2.cpaAlvo).toEqual({ known: true, value: 25 });
    expect(r2.roasEquilibrio.known && r2.roasEquilibrio.value).toBeCloseTo(1.4, 2);
  });
  it("CPA sem compras é indefinido, não zero", () => {
    const r = computeFinance({ ...emptyFinance(), gastoAnuncios: 200, comprasAprovadas: 0 });
    expect(r.cpaReal.known).toBe(false);
  });
});

describe("Criador PNG importado", () => {
  const { product, tasks } = buildCriadorPng();

  it("começa na etapa Produto sem presumir etapas anteriores validadas", () => {
    expect(product.currentStage).toBe("produto");
    expect(unvalidatedEarlierStages(product).map((s) => s.key)).toEqual(["publico_problema", "evidencia_amostra", "oferta"]);
  });
  it("não marca nada como validado", () => {
    expect(Object.values(product.body).some((f) => f.status === "validado" || f.status === "testado")).toBe(false);
    expect(product.body.preco.status).toBe("pendente");
  });
  it("indica próxima ação da etapa atual", () => {
    const actions = computeNextActions(product, tasks, []);
    expect(actions[0].title).toMatch(/Testar prompt-base/);
  });
  it("manifesto aponta ausência e falta de link do Drive", () => {
    const base = { id: "f1", productId: product.id, createdAt: "", updatedAt: "", kind: "arquivo", category: "arquivo_final", material: "entregavel", version: "0.1", origin: "upload", notes: "", ficticio: false, storageKey: "x" } as const;
    const files: FileDoc[] = [{ ...base, name: "Guia em PDF v0.1", approval: "aprovado" }];
    const m = buildManifest(product, files);
    expect(m.find((r) => r.item === "Guia em PDF")?.problems).toEqual(["Sem link do Drive"]);
    expect(m.find((r) => r.item === "Anexo de prompts copiáveis")?.problems).toEqual(["Arquivo ausente"]);
  });
  it("comparação de versões aponta mudança de estado", () => {
    const b = structuredClone(product);
    b.body.preco = { value: "R$ 49", status: "decidido" };
    const d = diffProducts(product, b);
    expect(d.find((x) => x.label === "Preço")?.kind).toBe("valor e estado");
  });
});

describe("armazenamento local", () => {
  it("persiste e relê documentos e arquivos", async () => {
    const dir = mkdtempSync(path.join(tmpdir(), "central-"));
    const store = createLocalStore(dir, "desenvolvimento");
    const { product } = buildCriadorPng();
    await store.put("products", product);
    const again = createLocalStore(dir, "desenvolvimento"); // simula reinício
    expect((await again.get<typeof product>("products", product.id))?.name).toBe("Criador PNG");
    await again.putFile(`${product.id}/a/b.txt`, new TextEncoder().encode("oi"), "text/plain");
    expect(new TextDecoder().decode((await again.getFile(`${product.id}/a/b.txt`))!)).toBe("oi");
    await expect(again.getFile("../../etc/passwd")).rejects.toThrow();
  });
});

describe("PDFs", () => {
  it("gera Corpo do Produto e entregável com texto selecionável e fontes incorporadas", async () => {
    const { product, tasks } = buildCriadorPng();
    const corpo = await renderCorpoPdf({
      product,
      evidences: [],
      tasks,
      files: [{ id: "l1", productId: product.id, createdAt: "", updatedAt: "", name: "Cakto — cadastro do produto", kind: "link", url: "https://ajuda.cakto.com.br/pt-br/articles/86-como-cadastrar-o-meu-produto-na-cakto", category: "referencia", material: "outro", approval: "rascunho", version: "", origin: "link", notes: "", ficticio: false }],
      versionNumber: 1,
    });
    const entregavel = await renderDeliverablePdf({ product, images: {} });
    const dir = mkdtempSync(path.join(tmpdir(), "pdf-"));
    for (const [name, bytes] of [["corpo.pdf", corpo], ["entregavel.pdf", entregavel]] as const) {
      expect(new TextDecoder().decode(bytes.slice(0, 5))).toBe("%PDF-");
      const file = path.join(dir, name);
      writeFileSync(file, bytes);
      let text = "";
      try {
        text = execFileSync("pdftotext", [file, "-"]).toString();
      } catch {
        continue; // pdftotext ausente: validação de texto pulada
      }
      expect(text.length).toBeGreaterThan(500);
      const fonts = execFileSync("pdffonts", [file]).toString();
      expect(fonts).toMatch(/Inter/);
      expect(fonts).not.toMatch(/\bno\s+no\s+no\b.*Inter/);
    }
    const corpoText = execFileSync("pdftotext", [path.join(dir, "corpo.pdf"), "-"]).toString();
    expect(corpoText.toLowerCase()).toContain("documento interno");
    expect(corpoText).toContain("Nenhuma evidência registrada");
    expect(corpoText).toMatch(/1 ?\/ ?\d/); // rodapé com número de página
    expect(corpoText).not.toContain("\u2192");
    const entText = execFileSync("pdftotext", [path.join(dir, "entregavel.pdf"), "-"]).toString();
    expect(entText).toMatch(/0\.2 — edição de teste/);
    expect(entText).toContain("PROMPT-BASE");
    expect(entText.toLowerCase()).not.toContain("documento interno");
    process.env.CENTRAL_TEST_PDF_DIR = dir;
    console.log("PDFs de teste em", dir);
  }, 60_000);
});

import { buildIcs } from "../logic";

describe("agenda .ics", () => {
  it("gera eventos de dia inteiro só para tarefas com data, com escape e CRLF", () => {
    const { product, tasks } = buildCriadorPng();
    tasks[0].prazo = "2026-11-20";
    tasks[0].title = "Conversar; com, donos";
    const ics = buildIcs(product.name, tasks, new Date("2026-11-06T12:00:00Z"));
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(1);
    expect(ics).toContain("DTSTART;VALUE=DATE:20261120");
    expect(ics).toContain("DTEND;VALUE=DATE:20261121");
    expect(ics).toContain("Conversar\\; com\\, donos");
    expect(ics.includes("\r\n")).toBe(true);
    for (const line of ics.split("\r\n")) expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
  });
});
