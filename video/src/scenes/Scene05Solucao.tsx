import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { AnimatedHeadline } from "../components/AnimatedHeadline";
import { EASE_IN_OUT, tween } from "../components/anim";
import { FoodBroll } from "../components/FoodBroll";
import { MenuComparison } from "../components/MenuComparison";
import { PhoneMockup } from "../components/PhoneMockup";
import { colors, fontFamily } from "../theme";
import { useCue } from "./useCue";

// Caminho do pedido segundo o Brand DNA (Auditoria do Caminho do Pedido).
const PATH = ["Instagram", "Cardápio", "Produto", "Adicionais", "Carrinho", "Pedido"];

const OrderPath: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const top = 430;
  const gap = 132;
  const progress = tween(frame, [8, duration * 0.85], [0, PATH.length - 1], EASE_IN_OUT);
  return (
    <AbsoluteFill>
      <FoodBroll
        src="broll/fotos/ingredientes.jpg"
        objectPosition="60% 50%"
        move={{ kind: "pan", fromX: 30, toX: -30, scale: 1.08 }}
        shade="none"
        style={{ opacity: 0.22 }}
      />
      <AbsoluteFill style={{ background: `linear-gradient(90deg, ${colors.charcoal} 30%, ${colors.charcoal}aa 100%)` }} />
      <AnimatedHeadline
        startFrame={2}
        lines={[{ text: "O CAMINHO DO PEDIDO", size: 30, weight: 700, color: colors.amber, tracking: 4 }]}
        style={{ top: 300, left: 120 }}
      />
      <div
        style={{
          position: "absolute",
          left: 137,
          top: top + 20,
          width: 6,
          height: gap * (PATH.length - 1),
          background: colors.line,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 137,
          top: top + 20,
          width: 6,
          height: gap * progress,
          background: colors.orange,
        }}
      />
      {PATH.map((step, i) => {
        const lit = tween(progress, [i - 0.3, i], [0, 1]);
        const shown = tween(frame, [4 + i * 3, 16 + i * 3], [0, 1]);
        return (
          <div
            key={step}
            style={{
              position: "absolute",
              left: 120,
              top: top + i * gap,
              display: "flex",
              alignItems: "center",
              gap: 40,
              opacity: shown,
              translate: `${(1 - shown) * 20}px 0`,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                background: lit > 0.5 ? colors.orange : colors.charcoal,
                border: `4px solid ${lit > 0.5 ? colors.orange : colors.line}`,
              }}
            />
            <div
              style={{
                fontFamily,
                fontSize: 62,
                fontWeight: lit > 0.5 ? 700 : 500,
                color: lit > 0.5 ? colors.offWhite : colors.muted,
                letterSpacing: -0.8,
              }}
            >
              {step}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// Moldura de visor: confirma que o que se vê é a foto real do produto.
const Viewfinder: React.FC<{ start: number }> = ({ start }) => {
  const frame = useCurrentFrame();
  const p = tween(frame, [start, start + 14], [0, 1]);
  const inset = 140 - p * 40;
  const corner = (pos: React.CSSProperties, borders: React.CSSProperties) => (
    <div style={{ position: "absolute", width: 90, height: 90, opacity: p, ...pos, ...borders }} />
  );
  const b = `6px solid ${colors.offWhite}`;
  return (
    <AbsoluteFill>
      {corner({ left: inset, top: inset + 160 }, { borderLeft: b, borderTop: b })}
      {corner({ right: inset + 40, top: inset + 160 }, { borderRight: b, borderTop: b })}
      {corner({ left: inset, bottom: inset + 520 }, { borderLeft: b, borderBottom: b })}
      {corner({ right: inset + 40, bottom: inset + 520 }, { borderRight: b, borderBottom: b })}
      <div
        style={{
          position: "absolute",
          left: inset,
          top: inset + 100,
          fontFamily,
          fontSize: 28,
          fontWeight: 700,
          letterSpacing: 4,
          color: colors.offWhite,
          opacity: p,
        }}
      >
        FOTO REAL DO PRODUTO
      </div>
    </AbsoluteFill>
  );
};

// Rótulo editorial numerado da coluna direita (composição assimétrica).
const Point: React.FC<{ n: string; text: string[]; start: number; top: number; active: boolean }> = ({
  n,
  text,
  start,
  top,
  active,
}) => {
  const frame = useCurrentFrame();
  const p = tween(frame, [start, start + 14], [0, 1]);
  return (
    <div
      style={{
        position: "absolute",
        left: 650,
        top,
        width: 300,
        fontFamily,
        opacity: p * (active ? 1 : 0.45),
        translate: `${(1 - p) * 24}px 0`,
      }}
    >
      <div style={{ fontSize: 28, fontWeight: 700, color: colors.amber, letterSpacing: 2 }}>{n}</div>
      {text.map((t) => (
        <div key={t} style={{ fontSize: 46, fontWeight: 700, color: colors.offWhite, lineHeight: 1.05, letterSpacing: -0.6 }}>
          {t}
        </div>
      ))}
    </div>
  );
};

// CENA 05 — "No Cardápio Alto, a gente analisa o caminho do pedido: fotos
// reais que valorizam o produto, categorias claras, descrições que ajudam a
// escolher..."
export const Scene05Solucao: React.FC = () => {
  const frame = useCurrentFrame();
  const c10 = useCue("c10");
  const c11 = useCue("c11");
  const c12 = useCue("c12");

  const phoneFrom = c11.start - 4;
  const reorganize = tween(frame, [phoneFrom, phoneFrom + 16], [0, 1], EASE_IN_OUT);
  const chips = tween(frame, [phoneFrom + 6, phoneFrom + 22], [0, 1]);
  const descriptions = tween(frame, [c12.start, c12.start + 18], [0, 1]);
  const highlight = frame >= c12.start ? "descriptions" : "chips";
  const highlightAmount =
    highlight === "chips"
      ? tween(frame, [phoneFrom + 18, phoneFrom + 26], [0, 1]) * tween(frame, [c12.start - 6, c12.start], [1, 0])
      : tween(frame, [c12.start + 10, c12.start + 18], [0, 1]);

  return (
    <AbsoluteFill style={{ backgroundColor: colors.charcoal }}>
      <Sequence name="Caminho do pedido" durationInFrames={c10.start}>
        <OrderPath duration={c10.start} />
      </Sequence>

      <Sequence name="B-roll · foto real" from={c10.start} durationInFrames={phoneFrom - c10.start}>
        <FoodBroll
          src="broll/fotos/pizza-close.jpg"
          objectPosition="50% 70%"
          move={{ kind: "pan", fromX: -24, toX: 24, scale: 1.1 }}
          shade="both"
        />
        <Viewfinder start={6} />
      </Sequence>

      <Sequence name="Cardápio reorganizado" from={phoneFrom}>
        <PhoneMockup style={{ left: 80, top: 210 }}>
          <MenuComparison
            progress={reorganize}
            messyScrollY={120}
            photos={1}
            chips={chips}
            descriptions={descriptions}
            highlight={highlight}
            highlightAmount={highlightAmount}
          />
        </PhoneMockup>
        <Point n="01" text={["Fotos", "reais"]} start={0} top={360} active={false} />
        <Point n="02" text={["Categorias", "claras"]} start={6} top={560} active={frame < c12.start} />
        <Point
          n="03"
          text={["Descrições", "que ajudam"]}
          start={c12.start - phoneFrom}
          top={760}
          active={frame >= c12.start}
        />
      </Sequence>
    </AbsoluteFill>
  );
};
