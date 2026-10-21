import type { SfxEvent } from "../components/SoundLayer";
import { sceneById, timedCues } from "./timeline";

// Efeitos ancorados nos mesmos pontos que as animações das cenas usam
// (fração de cada fala), então seguem a locução quando os tempos mudam.
const cue = (id: string) => timedCues.find((c) => c.id === id)!;
const at = (id: string, fraction: number) => {
  const c = cue(id);
  return c.startMs + (c.endMs - c.startMs) * fraction;
};
const sceneStart = (id: Parameters<typeof sceneById>[0]) => sceneById(id).startMs;
const FRAME_MS = 1000 / 30;

// Trilha 3 — transições.
export const transitionSfx: SfxEvent[] = [
  { name: "Impacto · abertura", file: "impacto-grave.wav", atMs: 0, volume: 0.9 },
  { name: "Impacto · EXCELENTE", file: "impacto-grave.wav", atMs: at("c01", 0.55), volume: 0.4 },
  { name: "Corte · problema", file: "transicao-curta.wav", atMs: sceneStart("problema") - 120, volume: 0.5 },
  { name: "Corte · contraponto", file: "transicao-curta.wav", atMs: sceneStart("contraponto") - 120, volume: 0.45 },
  { name: "Impacto · manchete tráfego", file: "impacto-controlado.wav", atMs: at("c08", 0.45), volume: 0.55 },
  { name: "Virada · solução", file: "transicao-ascendente.wav", atMs: sceneStart("solucao") - 260, volume: 0.5 },
  { name: "Assinatura · entrada", file: "transicao-curta.wav", atMs: sceneStart("assinatura") - 150, volume: 0.35 },
];

// Trilha 4 — interface e ambiente.
export const interfaceSfx: SfxEvent[] = [
  { name: "Ambiente · cozinha", file: "ambiente-cozinha.wav", atMs: 0, volume: 0.3 },
  // Cena 02: o dedo procura (rolagens).
  { name: "Scroll 1", file: "scroll.wav", atMs: at("c02", 0.25), volume: 0.55 },
  { name: "Scroll 2", file: "scroll.wav", atMs: at("c02", 0.5), volume: 0.5 },
  { name: "Scroll 3", file: "scroll.wav", atMs: at("c02", 0.68), volume: 0.55 },
  // Cena 03: um clique seco por corte; cancelamento no abandono.
  { name: "Clique · procura", file: "clique-seco.wav", atMs: sceneStart("desistencia"), volume: 0.6 },
  { name: "Scroll · procura", file: "scroll.wav", atMs: sceneStart("desistencia") + 80, volume: 0.45 },
  { name: "Clique · compara", file: "clique-seco.wav", atMs: cue("c04").startMs, volume: 0.6 },
  { name: "Clique · combos", file: "clique-seco.wav", atMs: cue("c05").startMs, volume: 0.6 },
  { name: "Clique · desiste", file: "clique-seco.wav", atMs: cue("c06").startMs, volume: 0.6 },
  {
    name: "Cancelamento",
    file: "cancelamento.wav",
    atMs: cue("c06").startMs + (cue("c06").endMs - cue("c06").startMs) * 0.35,
    volume: 0.6,
  },
  // Cena 05: interface se reorganiza.
  { name: "UI · foto real", file: "ui-obturador.wav", atMs: cue("c10").startMs + 6 * FRAME_MS, volume: 0.45 },
  { name: "UI · reorganiza", file: "ui-desliza.wav", atMs: cue("c11").startMs - 4 * FRAME_MS, volume: 0.5 },
  { name: "UI · categorias", file: "ui-toque.wav", atMs: cue("c11").startMs + 18 * FRAME_MS, volume: 0.45 },
  { name: "UI · descrições", file: "ui-desliza.wav", atMs: cue("c12").startMs, volume: 0.4 },
  // Cena 06: fluxo simples.
  { name: "UI · adicional", file: "ui-toque.wav", atMs: at("c13", 0.2), volume: 0.5 },
  { name: "UI · adicionar", file: "ui-toque.wav", atMs: at("c13", 0.62), volume: 0.5 },
  { name: "UI · carrinho", file: "ui-confirma.wav", atMs: at("c13", 0.62) + 5 * FRAME_MS, volume: 0.45 },
];
