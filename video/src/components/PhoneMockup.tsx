import type { CSSProperties, ReactNode } from "react";
import { colors, fontFamily } from "../theme";

export const PHONE = { width: 520, ratio: 2.06, bezel: 12, radius: 74 };
export const SCREEN_W = PHONE.width - PHONE.bezel * 2;
export const SCREEN_H = Math.round(PHONE.width * PHONE.ratio) - PHONE.bezel * 2;

// Aparelho genérico (sem marca) desenhado em CSS. O conteúdo da tela é
// sempre uma interface ilustrativa — por isso o selo de simulação.
export const PhoneMockup: React.FC<{
  children: ReactNode;
  style?: CSSProperties;
  screenBackground?: string;
  label?: string | null;
}> = ({ children, style, screenBackground = "#fff", label = "Simulação ilustrativa" }) => {
  const height = Math.round(PHONE.width * PHONE.ratio);
  return (
    <div style={{ position: "absolute", width: PHONE.width, height, ...style }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: PHONE.radius,
          background: "linear-gradient(145deg, #2c2a27, #0b0a09 60%)",
          boxShadow: `0 60px 120px rgba(0,0,0,0.55), inset 0 0 0 2px #3d3934`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: PHONE.bezel,
          borderRadius: PHONE.radius - PHONE.bezel,
          overflow: "hidden",
          background: screenBackground,
        }}
      >
        {children}
        {/* Ilha da câmera */}
        <div
          style={{
            position: "absolute",
            top: 16,
            left: "50%",
            translate: "-50% 0",
            width: 128,
            height: 36,
            borderRadius: 18,
            background: "#050505",
          }}
        />
      </div>
      {label ? (
        <div
          style={{
            position: "absolute",
            top: height + 18,
            left: 0,
            right: 0,
            textAlign: "center",
            fontFamily,
            fontSize: 20,
            fontWeight: 500,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: colors.muted,
          }}
        >
          {label}
        </div>
      ) : null}
    </div>
  );
};
