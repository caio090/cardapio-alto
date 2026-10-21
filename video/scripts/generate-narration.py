#!/usr/bin/env python3
"""Gera a narração com Kokoro TTS (modelo aberto, Apache 2.0), voz
masculina pt-BR, uma frase do roteiro por vez, com pausas intencionais.

O resultado é public/audio/narracao/narracao.wav (48 kHz). Em seguida:
    npm run narration:align && npm run audio:build && npm run render

Modelo (não versionado, ~340 MB), de
https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0
    kokoro-v1.0.onnx  voices-v1.0.bin

Uso:
    pip install kokoro-onnx soundfile
    python3 scripts/generate-narration.py --model-dir /caminho/do/modelo [--voice pm_alex]
"""

import argparse
import re
import subprocess
import tempfile
from pathlib import Path

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public/audio/narracao/narracao.wav"

# Mesmo texto de src/data/script.ts. Pausa (s) DEPOIS de cada frase: é ela
# que dá o ritmo do roteiro e que o narration:align usa para sincronizar.
CUES = [
    ("c01", "Seu produto pode ser excelente.", 1.1),
    ("c02", "Mas sabe o que acontece quando o cliente abre um cardápio confuso?", 1.0),
    ("c03", "Ele procura.", 0.45),
    ("c04", "Compara.", 0.45),
    ("c05", "Não entende os combos.", 0.4),
    ("c06", "E desiste.", 0.75),
    ("c07", "Aí você pensa: preciso anunciar mais.", 0.4),
    ("c08", "Só que mais visitas não resolvem uma compra difícil.", 0.6),
    ("c09", "No Cardápio Alto, a gente analisa o caminho do pedido:", 0.35),
    ("c10", "fotos reais que valorizam o produto,", 0.3),
    ("c11", "categorias claras,", 0.3),
    ("c12", "descrições que ajudam a escolher...", 0.35),
    ("c13", "e uma experiência simples no celular.", 0.55),
    ("c14", "Porque seu cardápio deveria facilitar a venda.", 0.8),
    ("c15", "Não complicar o pedido.", 0.9),
    ("c16", "Conheça o Cardápio Alto.", 0.0),
]
LEAD_IN_S = 0.4


def trim_silence(x, sr, threshold=0.01):
    idx = np.where(np.abs(x) > threshold)[0]
    if len(idx) == 0:
        return x
    pad = int(0.03 * sr)
    return x[max(0, idx[0] - pad) : min(len(x), idx[-1] + pad)]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--model-dir", required=True)
    ap.add_argument("--voice", default="pm_alex")
    ap.add_argument("--speed", type=float, default=1.0)
    args = ap.parse_args()

    md = Path(args.model_dir)
    tts = Kokoro(str(md / "kokoro-v1.0.onnx"), str(md / "voices-v1.0.bin"))

    parts, sr = [], None
    for cue_id, text, pause in CUES:
        spoken = re.sub(r"\.\.\.$", ".", text)  # reticências viram ponto na fala
        audio, sr = tts.create(spoken, voice=args.voice, speed=args.speed, lang="pt-br")
        audio = trim_silence(np.asarray(audio, dtype=np.float32), sr)
        print(f"{cue_id}  {len(audio) / sr:5.2f}s  {text}")
        parts.append(audio)
        parts.append(np.zeros(int(pause * sr), dtype=np.float32))

    voice = np.concatenate([np.zeros(int(LEAD_IN_S * sr), dtype=np.float32), *parts])
    with tempfile.TemporaryDirectory() as tmp:
        raw = Path(tmp) / "raw.wav"
        sf.write(raw, voice, sr)
        OUT.parent.mkdir(parents=True, exist_ok=True)
        # Tratamento de locução comercial: corta grave, leve presença,
        # compressão suave e loudness de referência (-16 LUFS).
        subprocess.run(
            [
                "ffmpeg", "-y", "-loglevel", "error", "-i", str(raw),
                "-af",
                "highpass=f=80,equalizer=f=3000:t=q:w=1:g=2,"
                "acompressor=threshold=-20dB:ratio=3:attack=5:release=80:makeup=2,"
                "loudnorm=I=-16:TP=-2:LRA=7",
                "-ar", "48000", "-ac", "1", str(OUT),
            ],
            check=True,
        )
    print(f"ok: {OUT.relative_to(ROOT)} ({len(voice) / sr:.2f}s)")


if __name__ == "__main__":
    main()
