#!/usr/bin/env node
// Alinha a montagem à locução gravada.
//
// Lê public/audio/narracao/narracao.wav, detecta os trechos de fala com o
// silencedetect do FFmpeg e associa cada trecho a uma frase (cue) do
// roteiro, gravando os tempos reais em src/data/narration-timing.json.
// Depois rode `npm run audio:build` para a trilha acompanhar as cenas.
//
// Para o alinhamento funcionar, a locução deve ter uma pausa audível
// (>= --min-gap, padrão 0,22 s) entre as 16 frases do roteiro. Se houver
// mais trechos que frases, as menores pausas são fundidas; se houver menos,
// o script para e explica — aí ajuste o JSON manualmente.
//
// Uso: node scripts/align-narration.mjs [--file caminho.wav] [--noise -35] [--min-gap 0.22]

import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, all) => (a.startsWith("--") ? [...acc, [a.slice(2), all[i + 1]]] : acc), []),
);
const file = args.file ?? join(root, "public/audio/narracao/narracao.wav");
const noise = args.noise ?? "-35";
const minGap = Number(args["min-gap"] ?? 0.22);
const timingPath = join(root, "src/data/narration-timing.json");
const timing = JSON.parse(readFileSync(timingPath, "utf8"));
const cueIds = timing.cues.map((c) => c.id);

const probe = execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file]);
const durationS = Number(String(probe).trim());

// silencedetect escreve em stderr.
const { stderr } = spawnSync(
  "ffmpeg",
  ["-hide_banner", "-i", file, "-af", `silencedetect=noise=${noise}dB:d=${minGap}`, "-f", "null", "-"],
  { encoding: "utf8" },
);

const silences = [];
let open = null;
for (const line of String(stderr).split("\n")) {
  const s = line.match(/silence_start: ([\d.]+)/);
  const e = line.match(/silence_end: ([\d.]+)/);
  if (s) open = Number(s[1]);
  if (e) {
    silences.push([open ?? 0, Number(e[1])]);
    open = null;
  }
}
if (open !== null) silences.push([open, durationS]);

// Trechos de fala = complemento dos silêncios.
const speech = [];
let cursor = 0;
for (const [a, b] of silences) {
  if (a > cursor + 0.05) speech.push([cursor, a]);
  cursor = b;
}
if (cursor < durationS - 0.05) speech.push([cursor, durationS]);

// Funde as menores pausas até sobrar exatamente uma fala por cue.
while (speech.length > cueIds.length) {
  let best = 0;
  for (let i = 1; i < speech.length - 1; i++) {
    if (speech[i + 1][0] - speech[i][1] < speech[best + 1][0] - speech[best][1]) best = i;
  }
  speech.splice(best, 2, [speech[best][0], speech[best + 1][1]]);
}

if (speech.length < cueIds.length) {
  console.error(
    `Foram detectados ${speech.length} trechos de fala para ${cueIds.length} frases.\n` +
      `Tente --noise -40 ou --min-gap 0.15, ou edite ${relative(root, timingPath)} manualmente.`,
  );
  process.exit(1);
}

const out = {
  source: "silencedetect",
  note: `Tempos medidos em ${relative(root, file)} (noise ${noise} dB, pausa mínima ${minGap}s).`,
  audioFile: relative(join(root, "public"), file),
  audioDurationMs: Math.round(durationS * 1000),
  cues: cueIds.map((id, i) => ({
    id,
    startMs: Math.round(speech[i][0] * 1000),
    endMs: Math.round(speech[i][1] * 1000),
  })),
};
writeFileSync(timingPath, JSON.stringify(out, null, 2) + "\n");
console.log(`ok: ${cueIds.length} frases alinhadas; locução de ${durationS.toFixed(2)}s.`);
for (const c of out.cues) console.log(`  ${c.id}  ${(c.startMs / 1000).toFixed(2)}s → ${(c.endMs / 1000).toFixed(2)}s`);
