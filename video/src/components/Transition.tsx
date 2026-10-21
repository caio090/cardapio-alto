import { AbsoluteFill, useCurrentFrame } from "remotion";
import { colors } from "../theme";
import { EASE_IN_OUT, tween } from "./anim";

// Sobreposições de corte. Cada tipo tem uma função narrativa:
// - "wipe": painel carvão atravessa a tela — virada de problema para solução.
// - "dip": mergulho curto no carvão — respiro antes da assinatura.
// - "flash": clarão off-white de 2–3 frames — impacto do gancho.
// Deve ser colocada numa <Sequence> centrada no ponto de corte.
export const Transition: React.FC<{ kind: "wipe" | "dip" | "flash"; durationInFrames: number }> = ({
  kind,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const half = durationInFrames / 2;

  if (kind === "wipe") {
    // Entra pela base cobrindo a cena que sai; sai pelo topo revelando a nova.
    const enter = tween(frame, [0, half], [100, 0], EASE_IN_OUT);
    const leave = tween(frame, [half, durationInFrames], [0, -100], EASE_IN_OUT);
    return (
      <AbsoluteFill
        style={{
          background: colors.charcoal,
          translate: `0 ${frame < half ? enter : leave}%`,
          borderTop: `6px solid ${colors.orange}`,
        }}
      />
    );
  }

  if (kind === "dip") {
    const o = frame < half ? tween(frame, [0, half], [0, 1]) : tween(frame, [half, durationInFrames], [1, 0]);
    return <AbsoluteFill style={{ background: colors.charcoal, opacity: o }} />;
  }

  return (
    <AbsoluteFill
      style={{ background: colors.offWhite, opacity: tween(frame, [0, durationInFrames], [0.55, 0]) }}
    />
  );
};
