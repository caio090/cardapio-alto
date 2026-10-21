import type { ReactNode } from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from "remotion";
import { AnimatedHeadline } from "../components/AnimatedHeadline";
import { EASE_IN_OUT, tween } from "../components/anim";
import { MessyCartScreen, MessyMenuScreen, TouchPoint } from "../components/MenuComparison";
import { PhoneMockup } from "../components/PhoneMockup";
import { colors } from "../theme";
import { useCue } from "./useCue";

const PHONE_POS = { left: 280, top: 210 };
const ORIGIN = { x: 540, y: 745 };

// Enquadramento: aproxima a "câmera" levando o ponto (fx, fy) do quadro
// para o alvo (tx, ty), sempre na metade de cima — a faixa de legenda
// nunca cobre o trecho do menu que importa.
const Camera: React.FC<{
  children: ReactNode;
  scale: number;
  focus: [number, number];
  target?: [number, number];
  rotate?: number;
}> = ({ children, scale, focus, target = [540, 720], rotate = 0 }) => {
  const tx = target[0] - ORIGIN.x - scale * (focus[0] - ORIGIN.x);
  const ty = target[1] - ORIGIN.y - scale * (focus[1] - ORIGIN.y);
  return (
    <AbsoluteFill
      style={{
        transformOrigin: `${ORIGIN.x}px ${ORIGIN.y}px`,
        scale: String(scale),
        translate: `${tx}px ${ty}px`,
        rotate: `${rotate}deg`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

const Backdrop = () => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(55% 35% at 50% 40%, ${colors.charcoal3} 0%, ${colors.charcoal} 100%)`,
    }}
  />
);

// CENA 03 — "Ele procura. Compara. Não entende os combos. E desiste."
// Quatro cortes secos, um por expressão, cada um com seu enquadramento.
// O corte 1 abre a cena (c03 começa logo após o respiro de entrada); os
// demais caem exatamente no início de c04, c05 e c06.
export const Scene03Desistencia: React.FC = () => {
  const c04 = useCue("c04");
  const c05 = useCue("c05");
  const c06 = useCue("c06");

  return (
    <AbsoluteFill style={{ backgroundColor: colors.charcoal }}>
      <Sequence name="Corte 1 · procura" durationInFrames={c04.start}>
        <CutSearch end={c04.start} />
      </Sequence>
      <Sequence name="Corte 2 · compara" from={c04.start} durationInFrames={c05.start - c04.start}>
        <CutCompare duration={c05.start - c04.start} />
      </Sequence>
      <Sequence name="Corte 3 · combos" from={c05.start} durationInFrames={c06.start - c05.start}>
        <CutCombos duration={c06.start - c05.start} />
      </Sequence>
      <Sequence name="Corte 4 · desiste" from={c06.start}>
        <CutAbandon voiceEnd={c06.end - c06.start} />
      </Sequence>
    </AbsoluteFill>
  );
};

const CutSearch: React.FC<{ end: number }> = ({ end }) => {
  const frame = useCurrentFrame();
  const scrollY = interpolate(frame, [0, end * 0.45, end], [520, 140, 300], {
    extrapolateRight: "clamp",
    easing: EASE_IN_OUT,
  });
  const fingerY = interpolate(frame, [0, end * 0.45, end], [380, 760, 600], {
    extrapolateRight: "clamp",
    easing: EASE_IN_OUT,
  });
  return (
    <AbsoluteFill>
      <Backdrop />
      <Camera scale={1.42} focus={[540, 640]} target={[540, 760]}>
        <PhoneMockup style={PHONE_POS} label={null}>
          <MessyMenuScreen scrollY={scrollY} />
          <TouchPoint x={300} y={fingerY} press={1} />
        </PhoneMockup>
      </Camera>
    </AbsoluteFill>
  );
};

const CutCompare: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Backdrop />
      <Camera scale={1.3} focus={[540, 560]} target={[540, 700]} rotate={2}>
        <PhoneMockup style={PHONE_POS} label={null}>
          <MessyMenuScreen scrollY={380} compare={tween(frame, [2, Math.min(12, duration)], [0, 1])} />
        </PhoneMockup>
      </Camera>
    </AbsoluteFill>
  );
};

const CutCombos: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Backdrop />
      <Camera scale={1.75} focus={[520, 520]} target={[540, 680]}>
        <PhoneMockup style={PHONE_POS} label={null}>
          <MessyMenuScreen
            scrollY={interpolate(frame, [0, duration], [380, 395], { extrapolateRight: "clamp" })}
            compare={1}
            confusion={tween(frame, [4, 14], [0, 1])}
          />
        </PhoneMockup>
      </Camera>
    </AbsoluteFill>
  );
};

const CutAbandon: React.FC<{ voiceEnd: number }> = ({ voiceEnd }) => {
  const frame = useCurrentFrame();
  const tap = Math.round(voiceEnd * 0.35);
  const press = tween(frame, [tap - 4, tap], [0, 1]) * tween(frame, [tap + 3, tap + 8], [1, 0]);
  const abandon = tween(frame, [tap + 4, voiceEnd + 8], [0, 1]);
  return (
    <AbsoluteFill>
      <Backdrop />
      <PhoneMockup style={{ ...PHONE_POS, opacity: 1 - abandon * 0.35 }} label={null}>
        <MessyCartScreen abandon={abandon} />
        <TouchPoint x={452} y={108} press={press} visible={tween(frame, [0, 4], [0, 1]) * (1 - abandon)} />
      </PhoneMockup>
      <AnimatedHeadline
        startFrame={tap + 6}
        lines={[{ text: "Carrinho abandonado", size: 46, weight: 700, color: colors.orange }]}
        align="center"
        style={{ top: 690, left: 0, right: 0 }}
      />
    </AbsoluteFill>
  );
};
