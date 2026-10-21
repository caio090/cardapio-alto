import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { AnimatedHeadline } from "../components/AnimatedHeadline";
import { EASE_IN_OUT, tween } from "../components/anim";
import { MessyMenuScreen } from "../components/MenuComparison";
import { PhoneMockup } from "../components/PhoneMockup";
import { colors, fontFamily } from "../theme";
import { useCue } from "./useCue";

// Post patrocinado genérico (sem marca real) — só a ideia de "anunciar".
const AdCard: React.FC = () => (
  <div
    style={{
      width: 600,
      background: colors.cream,
      borderRadius: 30,
      overflow: "hidden",
      boxShadow: "0 40px 90px rgba(0,0,0,0.5)",
      fontFamily,
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "20px 24px" }}>
      <div style={{ width: 48, height: 48, borderRadius: 24, background: colors.charcoal3 }} />
      <div>
        <div style={{ fontSize: 24, fontWeight: 700, color: colors.charcoal }}>Seu restaurante</div>
        <div style={{ fontSize: 18, color: "#8b8279" }}>Patrocinado</div>
      </div>
    </div>
    <div style={{ height: 600, overflow: "hidden" }}>
      <Img
        src={staticFile("broll/fotos/fries-dark.jpg")}
        style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 45%" }}
      />
    </div>
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "22px 24px",
        fontSize: 24,
        fontWeight: 700,
        color: colors.charcoal,
        borderTop: "1px solid #e6dfd4",
      }}
    >
      Fazer pedido <span style={{ color: colors.orange }}>→</span>
    </div>
  </div>
);

// Visitantes: pontos que saem do anúncio, chegam ao cardápio confuso e
// voltam para fora. Não representam número algum — só o movimento.
const VISITORS = Array.from({ length: 16 }, (_, i) => ({
  delay: i * 2.2,
  lane: ((i * 37) % 11) / 10 - 0.5,
  exitUp: i % 3 === 0,
}));

const Visitors: React.FC<{ start: number }> = ({ start }) => {
  const frame = useCurrentFrame();
  const from = { x: 270, y: 980 };
  const to = { x: 760, y: 820 };
  return (
    <>
      {VISITORS.map((v, i) => {
        const t0 = start + v.delay;
        const travel = tween(frame, [t0, t0 + 18], [0, 1], EASE_IN_OUT);
        const back = tween(frame, [t0 + 20, t0 + 40], [0, 1], EASE_IN_OUT);
        const x = from.x + (to.x - from.x) * travel + back * (v.exitUp ? 60 : 200);
        const y = from.y + (to.y - from.y) * travel + v.lane * 90 * (1 - travel) + back * (v.exitUp ? -260 : 160);
        const opacity = tween(frame, [t0, t0 + 4], [0, 1]) * (1 - back);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x - 11,
              top: y - 11,
              width: 22,
              height: 22,
              borderRadius: 11,
              background: colors.amber,
              opacity,
              boxShadow: `0 0 18px ${colors.amber}`,
            }}
          />
        );
      })}
    </>
  );
};

// CENA 04 — "Aí você pensa: preciso anunciar mais. Só que mais visitas não
// resolvem uma compra difícil."
export const Scene04Contraponto: React.FC = () => {
  const frame = useCurrentFrame();
  const c08 = useCue("c08");

  // Durante c07 o quadro é só o anúncio; a divisão começa com c08.
  const cardIn = tween(frame, [0, 16], [0, 1]);
  const split = tween(frame, [c08.start - 6, c08.start + 14], [0, 1], EASE_IN_OUT);
  const headline = c08.at(0.45);
  const settle = tween(frame, [headline - 4, headline + 14], [0, 1], EASE_IN_OUT);

  return (
    <AbsoluteFill style={{ backgroundColor: colors.charcoal }}>
      <div
        style={{
          position: "absolute",
          left: interpolate(split, [0, 1], [240, 80]),
          top: interpolate(split, [0, 1], [300, 760]),
          transformOrigin: "0 0",
          scale: String(interpolate(split, [0, 1], [1, 0.62])),
          opacity: cardIn * (1 - settle * 0.45),
          translate: `0 ${(1 - cardIn) * 60}px`,
        }}
      >
        <AdCard />
      </div>

      <PhoneMockup
        label={null}
        style={{
          left: 600,
          top: 640,
          transformOrigin: "0 0",
          scale: "0.62",
          opacity: split * (1 - settle * 0.45),
          translate: `${(1 - split) * 120}px 0`,
        }}
      >
        <MessyMenuScreen scrollY={interpolate(frame, [c08.start, c08.end], [0, 240], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
      </PhoneMockup>

      <Visitors start={c08.start + 6} />

      <AnimatedHeadline
        startFrame={headline}
        stagger={5}
        lines={[
          { text: "MAIS TRÁFEGO", size: 108, weight: 900, color: colors.offWhite },
          { text: "≠ COMPRA FÁCIL", size: 108, weight: 900, color: colors.amber },
        ]}
        style={{ top: 260, left: 80 }}
      />
    </AbsoluteFill>
  );
};
