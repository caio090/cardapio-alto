import type { CSSProperties } from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { colors } from "../theme";
import { EASE_IN_OUT, tween } from "./anim";

type Move =
  | { kind: "push"; from: number; to: number }
  | { kind: "pan"; fromX: number; toX: number; scale: number }
  | { kind: "still"; scale?: number };

// Fotografia real em tela cheia, com UM movimento de câmera por plano
// (push lento, pan lateral ou parado) e gradação para o fundo carvão.
export const FoodBroll: React.FC<{
  src: string;
  objectPosition?: string;
  move?: Move;
  shade?: "bottom" | "top" | "both" | "none";
  style?: CSSProperties;
}> = ({ src, objectPosition = "50% 50%", move = { kind: "still" }, shade = "bottom", style }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = tween(frame, [0, durationInFrames], [0, 1], EASE_IN_OUT);

  const scale =
    move.kind === "push"
      ? move.from + (move.to - move.from) * t
      : move.kind === "pan"
        ? move.scale
        : (move.scale ?? 1);
  const x = move.kind === "pan" ? move.fromX + (move.toX - move.fromX) * t : 0;

  const gradients = {
    bottom: `linear-gradient(180deg, transparent 45%, ${colors.charcoal}e6 88%, ${colors.charcoal} 100%)`,
    top: `linear-gradient(0deg, transparent 50%, ${colors.charcoal}d9 100%)`,
    both: `linear-gradient(180deg, ${colors.charcoal}d9 0%, transparent 28%, transparent 55%, ${colors.charcoal} 96%)`,
    none: "none",
  };

  return (
    <AbsoluteFill style={{ backgroundColor: colors.charcoal, overflow: "hidden", ...style }}>
      <Img
        src={staticFile(src)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition,
          scale: String(scale),
          translate: `${x}px 0`,
        }}
      />
      <AbsoluteFill style={{ background: gradients[shade] }} />
    </AbsoluteFill>
  );
};
