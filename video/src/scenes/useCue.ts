import { useVideoConfig } from "remotion";
import { cueInScene } from "../data/timeline";

// Frames de início/fim de uma fala, relativos ao início da cena atual.
export const useCue = (cueId: string) => {
  const { fps } = useVideoConfig();
  const { startMs, endMs } = cueInScene(cueId);
  const start = Math.round((startMs / 1000) * fps);
  const end = Math.round((endMs / 1000) * fps);
  return { start, end, at: (fraction: number) => Math.round(start + (end - start) * fraction) };
};
