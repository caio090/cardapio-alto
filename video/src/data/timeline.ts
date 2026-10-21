import type { Caption } from "@remotion/captions";
import timing from "./narration-timing.json";
import { CUES, SCENE_ORDER, type Cue, type SceneId } from "./script";

// Toda a montagem deriva daqui: cenas, cortes, legendas e efeitos seguem os
// tempos reais da locução (ou a estimativa, enquanto ela não existe).

export type NarrationTiming = {
  source: string;
  audioFile: string | null;
  audioDurationMs: number | null;
  cues: { id: string; startMs: number; endMs: number }[];
};

export const narration = timing as NarrationTiming;

// Respiro visual antes da primeira fala de cada cena e cauda da assinatura.
const SCENE_LEAD_MS = 450;
const OUTRO_TAIL_MS = 1900;

export type TimedCue = Cue & { startMs: number; endMs: number };

export const timedCues: TimedCue[] = CUES.map((cue) => {
  const t = narration.cues.find((c) => c.id === cue.id);
  if (!t) throw new Error(`Cue ${cue.id} sem tempo em narration-timing.json`);
  return { ...cue, startMs: t.startMs, endMs: t.endMs };
});

export const totalMs = Math.max(
  timedCues[timedCues.length - 1].endMs + OUTRO_TAIL_MS,
  narration.audioDurationMs ?? 0,
);

export type SceneSpan = { id: SceneId; startMs: number; endMs: number; cues: TimedCue[] };

export const scenes: SceneSpan[] = SCENE_ORDER.map((id, i) => {
  const cues = timedCues.filter((c) => c.scene === id);
  const prev = i === 0 ? null : timedCues.filter((c) => c.scene === SCENE_ORDER[i - 1]);
  const startMs =
    i === 0 ? 0 : Math.max(prev![prev!.length - 1].endMs + 120, cues[0].startMs - SCENE_LEAD_MS);
  return { id, startMs, endMs: 0, cues };
}).map((s, i, all) => ({ ...s, endMs: i < all.length - 1 ? all[i + 1].startMs : totalMs }));

export const msToFrames = (ms: number, fps: number) => Math.round((ms / 1000) * fps);

export const sceneById = (id: SceneId) => scenes.find((s) => s.id === id)!;

// Tempo de um cue relativo ao início da sua cena (para usar dentro da Sequence).
export const cueInScene = (cueId: string) => {
  const cue = timedCues.find((c) => c.id === cueId)!;
  const scene = sceneById(cue.scene);
  return { startMs: cue.startMs - scene.startMs, endMs: cue.endMs - scene.startMs };
};

// Legendas por palavra. Sem transcrição palavra-a-palavra disponível, cada
// palavra recebe uma fatia do cue proporcional ao seu tamanho — a borda de
// cada frase continua presa ao áudio real (silencedetect).
export const captions: Caption[] = timedCues.flatMap((cue) => {
  const words = cue.text.split(/\s+/);
  const weights = words.map((w) => w.replace(/[^\p{L}\p{N}]/gu, "").length + 2);
  const total = weights.reduce((a, b) => a + b, 0);
  const span = cue.endMs - cue.startMs;
  let acc = cue.startMs;
  return words.map((word, i) => {
    const startMs = acc;
    acc += (weights[i] / total) * span;
    return {
      text: (i === 0 ? "" : " ") + word,
      startMs: Math.round(startMs),
      endMs: Math.round(acc),
      timestampMs: Math.round((startMs + acc) / 2),
      confidence: null,
      pageBreakAfter: i === words.length - 1,
    };
  });
});
