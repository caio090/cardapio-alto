#!/usr/bin/env python3
"""Gera a trilha musical e os efeitos sonoros do comercial.

Tudo é sintetizado aqui (sem samples de terceiros), então não há licença
externa envolvida. A trilha é montada sobre os tempos de
src/data/narration-timing.json: ao trocar a locução e rodar
`npm run narration:align`, rode este script de novo para a música
acompanhar as novas fronteiras de cena.

Uso: python3 scripts/build-audio.py   (requer numpy e scipy)
"""

import json
import wave
from pathlib import Path

import numpy as np
from scipy.signal import butter, fftconvolve, sosfilt

SR = 48000
ROOT = Path(__file__).resolve().parent.parent
TIMING = ROOT / "src/data/narration-timing.json"
MUSIC_DIR = ROOT / "public/audio/musica"
SFX_DIR = ROOT / "public/audio/sfx"
RNG = np.random.default_rng(7)

# Mesma lógica de src/data/timeline.ts (respiro de cena e cauda final).
SCENE_LEAD_MS = 450
OUTRO_TAIL_MS = 1900
SCENES = ["hook", "problema", "desistencia", "contraponto", "solucao", "manifesto", "assinatura"]
CUE_SCENE = {
    "c01": "hook", "c02": "problema", "c03": "desistencia", "c04": "desistencia",
    "c05": "desistencia", "c06": "desistencia", "c07": "contraponto", "c08": "contraponto",
    "c09": "solucao", "c10": "solucao", "c11": "solucao", "c12": "solucao",
    "c13": "manifesto", "c14": "manifesto", "c15": "manifesto", "c16": "assinatura",
}


# ----------------------------------------------------------------- utilidades

def t(seconds):
    return np.arange(int(seconds * SR)) / SR


def filt(x, kind, freq, order=2):
    sos = butter(order, freq, btype=kind, fs=SR, output="sos")
    return sosfilt(sos, x)


def env_ad(n, attack, decay_tau):
    tt = np.arange(n) / SR
    a = np.clip(tt / max(attack, 1e-4), 0, 1)
    return a * np.exp(-np.maximum(tt - attack, 0) / decay_tau)


def fade(x, fin=0.005, fout=0.02):
    n = len(x)
    i, o = int(fin * SR), int(fout * SR)
    shape = (-1, 1) if x.ndim == 2 else (-1,)
    if i:
        x[:i] *= np.linspace(0, 1, i).reshape(shape)
    if o:
        x[-o:] *= np.linspace(1, 0, o).reshape(shape)
    return x


def reverb(x, seconds=1.6, mix=0.25, damp=5000):
    n = int(seconds * SR)
    ir = RNG.standard_normal(n) * np.exp(-np.arange(n) / SR * (6.9 / seconds))
    ir = filt(ir, "low", damp)
    ir /= np.sqrt(np.sum(ir**2))
    wet = fftconvolve(x, ir)
    out = np.zeros(len(wet))
    out[: len(x)] += x * (1 - mix)
    out += wet * mix
    return out


def stereo(x, width=0.0):
    if width == 0:
        return np.stack([x, x], axis=1)
    d = int(0.012 * SR)
    r = np.concatenate([np.zeros(d), x])[: len(x)]
    return np.stack([x, x * (1 - width) + r * width], axis=1)


def write(path, x):
    if x.ndim == 1:
        x = stereo(x)
    peak = np.max(np.abs(x)) or 1
    x = x / peak * 0.89 if peak > 0.89 else x
    data = (x * 32767).astype("<i2")
    path.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data.tobytes())


def hz(note):
    return 440.0 * 2 ** ((note - 69) / 12)


def tone(freq, seconds, kind="sine", detune=0.0):
    tt = t(seconds)
    ph = 2 * np.pi * freq * tt
    if kind == "sine":
        return np.sin(ph)
    if kind == "soft":  # seno + harmônicos suaves
        return np.sin(ph) + 0.25 * np.sin(2 * ph + 0.3) + 0.08 * np.sin(3 * ph)
    if kind == "saw":
        s = np.zeros_like(tt)
        for k in range(1, 18):
            s += np.sin(k * ph * (1 + detune)) / k
        return s * 0.6
    raise ValueError(kind)


def place(buf, x, at_s, gain=1.0):
    i = int(at_s * SR)
    if i >= len(buf):
        return
    end = min(len(buf), i + len(x))
    buf[i:end] += x[: end - i] * gain


# ------------------------------------------------------------------ tempos

def load_timeline():
    data = json.loads(TIMING.read_text())
    cues = {c["id"]: (c["startMs"], c["endMs"]) for c in data["cues"]}
    ordered = sorted(cues.items(), key=lambda kv: kv[1][0])
    total = max(ordered[-1][1][1] + OUTRO_TAIL_MS, data.get("audioDurationMs") or 0)
    starts = {}
    for i, s in enumerate(SCENES):
        mine = [v for k, v in ordered if CUE_SCENE[k] == s]
        if i == 0:
            starts[s] = 0
        else:
            prev = [v for k, v in ordered if CUE_SCENE[k] == SCENES[i - 1]]
            starts[s] = max(prev[-1][1] + 120, mine[0][0] - SCENE_LEAD_MS)
    return {k: v / 1000 for k, v in starts.items()}, {k: (a / 1000, b / 1000) for k, (a, b) in cues.items()}, total / 1000


# ------------------------------------------------------------------ efeitos

def sfx_impacto_grave():
    d = 1.6
    tt = t(d)
    f = 38 + 60 * np.exp(-tt / 0.08)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * env_ad(len(tt), 0.003, 0.45)
    click = filt(RNG.standard_normal(len(tt)), "low", 1800) * env_ad(len(tt), 0.001, 0.015) * 0.6
    return fade(np.tanh((body + click) * 1.6) * 0.9)


def sfx_impacto_controlado():
    d = 1.0
    tt = t(d)
    f = 48 + 40 * np.exp(-tt / 0.06)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * env_ad(len(tt), 0.004, 0.28)
    tick = filt(RNG.standard_normal(len(tt)), "band", [1200, 5000]) * env_ad(len(tt), 0.001, 0.01) * 0.4
    return fade((body + tick) * 0.8)


def sfx_transicao_curta():
    d = 0.42
    n = int(d * SR)
    noise = RNG.standard_normal(n)
    sweep = np.linspace(0, 1, n)
    x = filt(noise, "band", [500, 7000]) * np.sin(np.pi * sweep) ** 2
    return fade(stereo(x * 0.5, 0.6))


def sfx_transicao_ascendente():
    d = 0.8
    tt = t(d)
    noise = filt(RNG.standard_normal(len(tt)), "high", 900) * (tt / d) ** 2
    f = 220 * 2 ** (tt / d * 2)
    rise = np.sin(2 * np.pi * np.cumsum(f) / SR) * (tt / d) ** 1.5 * 0.25
    x = (noise * 0.4 + rise) * np.where(tt > d - 0.05, (d - tt) / 0.05, 1)
    return fade(stereo(x, 0.5))


def sfx_scroll():
    d = 0.4
    x = np.zeros(int(d * SR))
    for i, at in enumerate(np.linspace(0, 0.3, 7)):
        tick = filt(RNG.standard_normal(int(0.006 * SR)), "band", [2500, 7000]) * np.hanning(int(0.006 * SR))
        place(x, tick, at, 0.35 * (1 - i / 9))
    swish = filt(RNG.standard_normal(len(x)), "band", [800, 3000]) * np.sin(np.linspace(0, np.pi, len(x))) * 0.12
    return fade(x + swish)


def sfx_clique_seco():
    d = 0.08
    tt = t(d)
    blip = np.sin(2 * np.pi * 1900 * tt) * env_ad(len(tt), 0.0005, 0.006)
    body = filt(RNG.standard_normal(len(tt)), "band", [1000, 6000]) * env_ad(len(tt), 0.0003, 0.004)
    return fade((blip * 0.6 + body * 0.5), 0.0005, 0.01)


def sfx_cancelamento():
    out = np.zeros(int(0.45 * SR))
    for i, note in enumerate([69, 64]):
        s = tone(hz(note), 0.16, "soft") * env_ad(int(0.16 * SR), 0.002, 0.05)
        place(out, filt(s, "low", 2500), i * 0.11, 0.45)
    return fade(out)


def sfx_obturador():
    out = np.zeros(int(0.25 * SR))
    for at in (0.0, 0.07):
        c = filt(RNG.standard_normal(int(0.03 * SR)), "band", [1500, 9000]) * env_ad(int(0.03 * SR), 0.0005, 0.006)
        place(out, c, at, 0.6)
    return fade(out)


def sfx_ui_desliza():
    d = 0.45
    n = int(d * SR)
    x = filt(RNG.standard_normal(n), "band", [400, 2600]) * np.sin(np.linspace(0, np.pi, n)) ** 1.5 * 0.35
    tt = t(d)
    tonal = np.sin(2 * np.pi * (520 + 260 * tt / d) * tt) * np.sin(np.linspace(0, np.pi, n)) * 0.06
    return fade(stereo(x + tonal, 0.4))


def sfx_ui_toque():
    d = 0.12
    tt = t(d)
    f = 650 + 500 * np.exp(-tt / 0.012)
    return fade(np.sin(2 * np.pi * np.cumsum(f) / SR) * env_ad(len(tt), 0.001, 0.025) * 0.55, 0.0005, 0.02)


def sfx_ui_confirma():
    out = np.zeros(int(0.9 * SR))
    for i, note in enumerate([76, 83]):
        s = tone(hz(note), 0.6, "sine") * env_ad(int(0.6 * SR), 0.003, 0.18)
        place(out, s, i * 0.08, 0.3)
    return fade(reverb(out, 0.8, 0.2)[: len(out)])


def sfx_ambiente():
    # Cozinha discreta: grave de ambiente + chiado de chapa modulado.
    d = 4.5
    n = int(d * SR)
    room = filt(np.cumsum(RNG.standard_normal(n)) * 0.002, "low", 300)
    sizzle = filt(RNG.standard_normal(n), "band", [3000, 9000])
    mod = 0.6 + 0.4 * np.sin(2 * np.pi * 0.7 * np.arange(n) / SR) * np.sin(2 * np.pi * 0.23 * np.arange(n) / SR)
    x = room * 0.8 + sizzle * mod * 0.05
    x *= np.minimum(1, np.arange(n) / (0.4 * SR)) * np.minimum(1, (n - np.arange(n)) / (1.2 * SR))
    return stereo(x, 0.8)


# ------------------------------------------------------------------ música

def chord_pad(notes, seconds, gain=0.12, cutoff=1800):
    n = int(seconds * SR)
    x = np.zeros(n)
    for k, note in enumerate(notes):
        x += tone(hz(note), seconds, "saw", detune=0.0015 * (k - 1))[:n]
    x = filt(x, "low", cutoff)
    e = np.minimum(1, np.arange(n) / (0.35 * SR)) * np.minimum(1, (n - np.arange(n)) / (0.35 * SR))
    return x * e * gain / len(notes)


def pluck(note, seconds=0.5, gain=0.2):
    s = tone(hz(note), seconds, "soft") * env_ad(int(seconds * SR), 0.002, 0.14)
    return filt(s, "low", 3500) * gain


def kick(gain=0.6):
    tt = t(0.35)
    f = 45 + 90 * np.exp(-tt / 0.03)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env_ad(len(tt), 0.001, 0.12) * gain


def hat(gain=0.08):
    n = int(0.05 * SR)
    return filt(RNG.standard_normal(n), "high", 7000) * env_ad(n, 0.0005, 0.012) * gain


def build_music(starts, cues, total):
    buf = np.zeros(int((total + 3) * SR))
    beat = 0.6  # 100 BPM
    s2, s3, s4, s5, s6, s7 = (starts[k] for k in SCENES[1:])

    # Hook: grave sustentado em Lá menor que respira sob a primeira frase.
    place(buf, chord_pad([45, 52, 57], s2 + 0.4, 0.5, 900), 0.0)

    # Problema + desistência: drone com segunda menor e pulso seco crescente.
    pause_at = cues["c06"][1] + 0.05  # pausa depois de "E desiste."
    span = pause_at - s2
    drone = chord_pad([33, 34, 45], span, 0.6, 500)
    drone *= np.linspace(0.6, 1.0, len(drone))
    place(buf, drone, s2)
    n_ticks = int(span / (beat / 2))
    for i in range(n_ticks):
        at = s2 + i * beat / 2
        tk = filt(RNG.standard_normal(int(0.02 * SR)), "band", [2000, 6000]) * env_ad(int(0.02 * SR), 0.0005, 0.005)
        place(buf, tk, at, 0.05 + 0.1 * i / n_ticks)
        if i % 2 == 0:
            place(buf, kick(0.25 + 0.2 * i / n_ticks), at)

    # Contraponto: pulso eletrônico em semicolcheias, filtro abrindo.
    span = s5 - s4
    n16 = int(span / (beat / 4))
    for i in range(n16):
        at = s4 + i * beat / 4
        note = 33 if (i // 8) % 2 == 0 else 36
        b = tone(hz(note), beat / 4 * 0.9, "saw") * env_ad(int(beat / 4 * 0.9 * SR), 0.002, 0.05)
        place(buf, filt(b, "low", 400 + 1600 * i / n16), at, 0.22)
        if i % 4 == 0:
            place(buf, kick(0.45), at)

    # Solução: progressão maior organizada (F – G – Am – C), plucks e groove leve.
    prog = [[53, 57, 60, 64], [55, 59, 62, 67], [57, 60, 64, 69], [48, 55, 60, 64]]
    bar = beat * 4
    span = s6 - s5
    n_bars = int(np.ceil(span / bar))
    for b in range(n_bars):
        at = s5 + b * bar
        chord = prog[b % 4]
        place(buf, chord_pad(chord, bar + 0.3, 0.55, 2200), at)
        for k in range(8):
            if at + k * beat / 2 >= s6:
                break
            place(buf, pluck(chord[k % 4] + 12, 0.45, 0.13 + 0.03 * b), at + k * beat / 2)
            place(buf, hat(0.05), at + k * beat / 2 + beat / 4)
            if k % 2 == 0:
                place(buf, kick(0.38), at + k * beat / 2)

    # Manifesto: a trilha recua — só pad baixo para a frase respirar.
    place(buf, chord_pad([53, 57, 60, 64], (s7 - s6) / 2 + 0.3, 0.35, 1400), s6)
    place(buf, chord_pad([55, 59, 62, 67], (s7 - s6) / 2 + 0.3, 0.3, 1400), s6 + (s7 - s6) / 2)

    # Assinatura: acorde aberto + motivo ascendente curto (a seta da logo).
    place(buf, chord_pad([48, 55, 62, 64, 67], total - s7 + 0.5, 0.45, 3000), s7)
    for i, note in enumerate([67, 72, 76, 79]):
        place(buf, pluck(note, 1.2, 0.2), s7 + 0.15 + i * 0.16)

    out = reverb(buf, 2.2, 0.28)[: int(total * SR)]
    out[-int(1.2 * SR):] *= np.linspace(1, 0, int(1.2 * SR))
    return stereo(out, 0.5)


def main():
    starts, cues, total = load_timeline()
    effects = {
        "impacto-grave.wav": sfx_impacto_grave,
        "impacto-controlado.wav": sfx_impacto_controlado,
        "transicao-curta.wav": sfx_transicao_curta,
        "transicao-ascendente.wav": sfx_transicao_ascendente,
        "scroll.wav": sfx_scroll,
        "clique-seco.wav": sfx_clique_seco,
        "cancelamento.wav": sfx_cancelamento,
        "ui-obturador.wav": sfx_obturador,
        "ui-desliza.wav": sfx_ui_desliza,
        "ui-toque.wav": sfx_ui_toque,
        "ui-confirma.wav": sfx_ui_confirma,
        "ambiente-cozinha.wav": sfx_ambiente,
    }
    for name, fn in effects.items():
        write(SFX_DIR / name, fn())
    write(MUSIC_DIR / "trilha.wav", build_music(starts, cues, total))
    print(f"ok: {len(effects)} efeitos + trilha ({total:.2f}s)")


if __name__ == "__main__":
    main()
