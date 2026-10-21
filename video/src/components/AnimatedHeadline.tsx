import type { CSSProperties } from "react";
import { useCurrentFrame } from "remotion";
import { colors, fontFamily } from "../theme";
import { tween } from "./anim";

export type HeadlineLine = {
  text: string;
  size: number;
  weight?: 400 | 500 | 700 | 900;
  color?: string;
  tracking?: number;
};

// Revelação editorial: cada linha sobe de dentro de uma máscara, uma por vez.
// Sem quique nem escala — o movimento só existe para conduzir a leitura.
export const AnimatedHeadline: React.FC<{
  lines: HeadlineLine[];
  startFrame?: number;
  stagger?: number;
  duration?: number;
  exitFrame?: number;
  align?: CSSProperties["textAlign"];
  style?: CSSProperties;
}> = ({ lines, startFrame = 0, stagger = 6, duration = 16, exitFrame, align = "left", style }) => {
  const frame = useCurrentFrame();
  const exit = exitFrame === undefined ? 1 : tween(frame, [exitFrame, exitFrame + 8], [1, 0]);

  return (
    <div style={{ position: "absolute", fontFamily, textAlign: align, opacity: exit, ...style }}>
      {lines.map((line, i) => {
        const from = startFrame + i * stagger;
        const p = tween(frame, [from, from + duration], [0, 1]);
        return (
          <div key={i} style={{ overflow: "hidden", paddingBottom: line.size * 0.06 }}>
            <div
              style={{
                fontSize: line.size,
                fontWeight: line.weight ?? 900,
                color: line.color ?? colors.offWhite,
                letterSpacing: line.tracking ?? (line.weight === 900 ? -0.02 : -0.01) * line.size,
                lineHeight: 0.98,
                translate: `0 ${(1 - p) * 105}%`,
                whiteSpace: "pre",
              }}
            >
              {line.text}
            </div>
          </div>
        );
      })}
    </div>
  );
};
