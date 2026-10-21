import type { Caption } from "@remotion/captions";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { normalize } from "../data/script";
import type { TimedCue } from "../data/timeline";
import { CAPTION_BAND, SAFE, colors, fontFamily } from "../theme";
import { tween } from "./anim";

type Page = { cue: TimedCue; words: Caption[]; fromMs: number; toMs: number };

// Uma "página" de legenda por frase falada. A palavra já dita acende; as
// palavras-chave do roteiro ganham o acento quente. A faixa fica abaixo do
// celular e acima da interface do Reels (ver CAPTION_BAND / SAFE).
export const CaptionTrack: React.FC<{ cues: TimedCue[]; captions: Caption[] }> = ({ cues, captions }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const nowMs = (frame / fps) * 1000;

  let cursor = 0;
  const pages: Page[] = cues.map((cue, i) => {
    const count = cue.text.split(/\s+/).length;
    const words = captions.slice(cursor, cursor + count);
    cursor += count;
    const next = cues[i + 1];
    return {
      cue,
      words,
      fromMs: cue.startMs - 80,
      toMs: Math.min(cue.endMs + 350, next ? next.startMs - 40 : Infinity),
    };
  });

  const page = pages.find((p) => nowMs >= p.fromMs && nowMs < p.toMs);
  if (!page || page.cue.hideCaption) return null;

  const fromFrame = (page.fromMs / 1000) * fps;
  const toFrame = (page.toMs / 1000) * fps;
  const appear = tween(frame, [fromFrame, fromFrame + 5], [0, 1]);
  const vanish = tween(frame, [toFrame - 4, toFrame], [1, 0]);
  const keywords = (page.cue.keywords ?? []).map(normalize);

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top: CAPTION_BAND.top,
          left: SAFE.left + 20,
          right: SAFE.right + 20,
          display: "flex",
          justifyContent: "center",
          opacity: appear * vanish,
          translate: `0 ${(1 - appear) * 10}px`,
        }}
      >
        <div
          style={{
            fontFamily,
            fontWeight: 700,
            fontSize: 50,
            lineHeight: 1.18,
            letterSpacing: -0.5,
            textAlign: "center",
            padding: "14px 26px 18px",
            borderRadius: 20,
            background: "rgba(18,17,16,0.72)",
          }}
        >
          {page.words.map((w, i) => {
            const spoken = nowMs >= w.startMs;
            const isKey = keywords.includes(normalize(w.text));
            return (
              <span
                key={i}
                style={{
                  color: isKey ? colors.amber : colors.offWhite,
                  opacity: spoken ? 1 : 0.42,
                  whiteSpace: "pre-wrap",
                }}
              >
                {w.text}
              </span>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
