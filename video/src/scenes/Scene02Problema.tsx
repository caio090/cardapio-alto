import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { EASE_IN_OUT, EASE_OUT, tween } from "../components/anim";
import { MessyMenuScreen, TouchPoint } from "../components/MenuComparison";
import { PhoneMockup } from "../components/PhoneMockup";
import { colors } from "../theme";
import { useCue } from "./useCue";

// CENA 02 — "Mas sabe o que acontece quando o cliente abre um cardápio confuso?"
// O celular entra e o dedo procura: desce, volta, desce de novo.
export const Scene02Problema: React.FC = () => {
  const frame = useCurrentFrame();
  const c02 = useCue("c02");
  const enter = tween(frame, [0, 18], [0, 1]);

  const k = [c02.at(0.25), c02.at(0.5), c02.at(0.68), c02.at(0.95)];
  const scrollY = interpolate(frame, k, [0, 420, 150, 560], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE_IN_OUT,
  });
  const fingerY = interpolate(frame, k, [760, 380, 700, 360], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE_IN_OUT,
  });
  const touching = tween(frame, [k[0] - 6, k[0]], [0, 1]) * tween(frame, [k[3], k[3] + 6], [1, 0]);

  return (
    <AbsoluteFill style={{ backgroundColor: colors.charcoal }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(55% 35% at 50% 40%, ${colors.charcoal3} 0%, ${colors.charcoal} 100%)`,
        }}
      />
      <PhoneMockup
        style={{
          left: 280,
          top: 210,
          translate: `0 ${(1 - enter) * 260}px`,
          opacity: enter,
          rotate: `${interpolate(frame, [0, c02.end], [-2.5, -1], { extrapolateRight: "clamp", easing: EASE_OUT })}deg`,
        }}
      >
        <MessyMenuScreen scrollY={scrollY} />
        <TouchPoint x={340} y={fingerY} press={touching} visible={touching} />
      </PhoneMockup>
    </AbsoluteFill>
  );
};
