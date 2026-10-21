import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { AnimatedHeadline } from "../components/AnimatedHeadline";
import { tween } from "../components/anim";
import { FoodBroll } from "../components/FoodBroll";
import { colors } from "../theme";
import { useCue } from "./useCue";

// CENA 01 — "Seu produto pode ser excelente."
// Macro do hambúrguer (foto real do site) ancorado na base; a palavra
// EXCELENTE se revela no instante em que é dita, sobre o carvão — nunca
// sobre o produto.
export const Scene01Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const c01 = useCue("c01");
  const reveal = c01.at(0.55);

  return (
    <AbsoluteFill style={{ backgroundColor: colors.charcoal }}>
      <Sequence name="B-roll · hambúrguer" layout="none">
        <AbsoluteFill style={{ top: 560, opacity: tween(frame, [0, 10], [0, 1]) }}>
          <FoodBroll
            src="broll/fotos/hero-burger.jpg"
            objectPosition="50% 60%"
            move={{ kind: "push", from: 1.0, to: 1.06 }}
            shade="top"
          />
        </AbsoluteFill>
      </Sequence>

      <AnimatedHeadline
        startFrame={c01.start}
        lines={[{ text: "Seu produto pode ser", size: 58, weight: 500, color: colors.offWhite }]}
        style={{ top: 250, left: 84 }}
      />
      <AnimatedHeadline
        startFrame={reveal}
        duration={14}
        lines={[{ text: "EXCELENTE.", size: 168, weight: 900, color: colors.offWhite }]}
        style={{ top: 326, left: 76 }}
      />
      <div
        style={{
          position: "absolute",
          top: 520,
          left: 84,
          height: 6,
          width: tween(frame, [reveal + 6, reveal + 20], [0, 240]),
          background: colors.orange,
        }}
      />
    </AbsoluteFill>
  );
};
