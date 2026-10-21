// Roteiro da locução, dividido em "cues" (frases faladas). Cada cue é a
// unidade de sincronia: legendas, cortes da cena 03 e efeitos sonoros se
// ancoram no início/fim real de cada cue (ver narration-timing.json).

export type SceneId =
  | "hook"
  | "problema"
  | "desistencia"
  | "contraponto"
  | "solucao"
  | "manifesto"
  | "assinatura";

export type Cue = {
  id: string;
  scene: SceneId;
  text: string;
  // Palavras destacadas na legenda (comparação sem acento/caixa).
  keywords?: string[];
  // Quando a tipografia da cena já mostra exatamente a frase, a legenda
  // repetida só competiria com ela.
  hideCaption?: boolean;
};

export const CUES: Cue[] = [
  { id: "c01", scene: "hook", text: "Seu produto pode ser excelente.", hideCaption: true },
  {
    id: "c02",
    scene: "problema",
    text: "Mas sabe o que acontece quando o cliente abre um cardápio confuso?",
    keywords: ["confuso"],
  },
  { id: "c03", scene: "desistencia", text: "Ele procura.", keywords: ["procura"] },
  { id: "c04", scene: "desistencia", text: "Compara.", keywords: ["compara"] },
  { id: "c05", scene: "desistencia", text: "Não entende os combos.", keywords: ["combos"] },
  { id: "c06", scene: "desistencia", text: "E desiste.", keywords: ["desiste"] },
  {
    id: "c07",
    scene: "contraponto",
    text: "Aí você pensa: preciso anunciar mais.",
    keywords: ["anunciar"],
  },
  {
    id: "c08",
    scene: "contraponto",
    text: "Só que mais visitas não resolvem uma compra difícil.",
    keywords: ["compra", "dificil"],
  },
  {
    id: "c09",
    scene: "solucao",
    text: "No Cardápio Alto, a gente analisa o caminho do pedido:",
    keywords: ["caminho", "pedido"],
  },
  {
    id: "c10",
    scene: "solucao",
    text: "fotos reais que valorizam o produto,",
    keywords: ["fotos", "reais"],
  },
  { id: "c11", scene: "solucao", text: "categorias claras,", keywords: ["categorias", "claras"] },
  {
    id: "c12",
    scene: "solucao",
    text: "descrições que ajudam a escolher...",
    keywords: ["descricoes"],
  },
  {
    id: "c13",
    scene: "manifesto",
    text: "...e uma experiência simples no celular.",
    keywords: ["simples"],
  },
  {
    id: "c14",
    scene: "manifesto",
    text: "Porque seu cardápio deveria facilitar a venda.",
    hideCaption: true,
  },
  { id: "c15", scene: "manifesto", text: "Não complicar o pedido.", hideCaption: true },
  { id: "c16", scene: "assinatura", text: "Conheça o Cardápio Alto.", hideCaption: true },
];

export const SCENE_ORDER: SceneId[] = [
  "hook",
  "problema",
  "desistencia",
  "contraponto",
  "solucao",
  "manifesto",
  "assinatura",
];

export const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");
