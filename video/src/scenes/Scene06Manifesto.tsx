import { AbsoluteFill, useCurrentFrame } from "remotion";
import { AnimatedHeadline } from "../components/AnimatedHeadline";
import { EASE_IN_OUT, tween } from "../components/anim";
import { ProductDetailScreen, TouchPoint } from "../components/MenuComparison";
import { PhoneMockup } from "../components/PhoneMockup";
import { colors } from "../theme";
import { useCue } from "./useCue";

// CENA 06 — "...e uma experiência simples no celular. Porque seu cardápio
// deveria facilitar a venda. Não complicar o pedido."
export const Scene06Manifesto: React.FC = () => {
  const frame = useCurrentFrame();
  const c13 = useCue("c13");
  const c14 = useCue("c14");
  const c15 = useCue("c15");

  // Fluxo simples: marca um adicional, toca em Adicionar, carrinho aparece.
  const tapAddon = c13.at(0.2);
  const tapButton = c13.at(0.62);
  const checked = tween(frame, [tapAddon, tapAddon + 4], [0, 1]);
  const pressed = tween(frame, [tapButton - 3, tapButton], [0, 1]) * tween(frame, [tapButton + 3, tapButton + 8], [1, 0]);
  const cartBar = tween(frame, [tapButton + 4, tapButton + 16], [0, 1]);
  const fingerToButton = tween(frame, [tapAddon + 6, tapButton - 4], [0, 1], EASE_IN_OUT);
  const touchVisible = tween(frame, [tapAddon - 8, tapAddon - 4], [0, 1]) * tween(frame, [tapButton + 8, tapButton + 14], [1, 0]);

  const phoneOut = tween(frame, [c14.start - 8, c14.start + 10], [0, 1], EASE_IN_OUT);
  const enter = tween(frame, [0, 14], [0, 1]);

  return (
    <AbsoluteFill style={{ backgroundColor: colors.charcoal }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(55% 35% at 50% 40%, ${colors.charcoal3} 0%, ${colors.charcoal} 100%)`,
          opacity: 1 - phoneOut,
        }}
      />
      <PhoneMockup
        style={{
          left: 280,
          top: 210,
          opacity: enter * (1 - phoneOut),
          translate: `0 ${(1 - enter) * 80 + phoneOut * 160}px`,
        }}
      >
        <ProductDetailScreen checked={checked} pressed={pressed} cartBar={cartBar} />
        <TouchPoint
          x={60 + fingerToButton * 190}
          y={780 + fingerToButton * 190}
          press={Math.max(
            tween(frame, [tapAddon - 3, tapAddon], [0, 1]) * tween(frame, [tapAddon + 3, tapAddon + 7], [1, 0]),
            pressed,
          )}
          visible={touchVisible}
        />
      </PhoneMockup>

      {/* "Porque seu cardápio deveria" entra com a voz; a manchete, na palavra "facilitar". */}
      <AnimatedHeadline
        startFrame={c14.start + 2}
        lines={[{ text: "Seu cardápio deveria", size: 58, weight: 500, color: colors.offWhite }]}
        style={{ top: 430, left: 84 }}
      />
      <AnimatedHeadline
        startFrame={c14.at(0.55)}
        duration={18}
        stagger={7}
        lines={[
          { text: "FACILITAR", size: 168, weight: 900, color: colors.offWhite },
          { text: "A VENDA.", size: 168, weight: 900, color: colors.amber },
        ]}
        style={{ top: 520, left: 76 }}
      />
      {/* Pausa visual entre as duas frases: o complemento só entra com a voz. */}
      <AnimatedHeadline
        startFrame={c15.start}
        stagger={5}
        lines={[
          { text: "Não complicar", size: 84, weight: 500, color: colors.offWhite },
          { text: "o pedido.", size: 84, weight: 500, color: colors.offWhite },
        ]}
        style={{ top: 930, left: 84 }}
      />
      <div
        style={{
          position: "absolute",
          top: 900,
          left: 84,
          height: 5,
          width: tween(frame, [c15.start - 2, c15.start + 14], [0, 200]),
          background: colors.orange,
        }}
      />
    </AbsoluteFill>
  );
};
