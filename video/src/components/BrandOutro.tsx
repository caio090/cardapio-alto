import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fontFamily } from "../theme";
import { tween } from "./anim";

// Arquivo oficial do Drive (logo-transparente-cardapio-alto.png, 1254×1254),
// usado inteiro e sem alteração: só opacidade e deslocamento vertical, nunca
// escala não proporcional, recorte de lettering ou recoloração.
export const LOGO_FILE = "logo/logo-transparente-cardapio-alto.png";

export const BrandOutro: React.FC<{ cta: string; url: string; voiceStartFrame: number }> = ({
  cta,
  url,
  voiceStartFrame,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const logo = tween(frame, [0, 20], [0, 1]);
  const ctaIn = tween(frame, [voiceStartFrame + 18, voiceStartFrame + 34], [0, 1]);
  const fadeOut = tween(frame, [durationInFrames - 10, durationInFrames], [1, 0]);

  return (
    <AbsoluteFill style={{ backgroundColor: colors.charcoal, opacity: fadeOut }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(60% 40% at 50% 42%, ${colors.charcoal3} 0%, ${colors.charcoal} 100%)`,
        }}
      />
      <Img
        src={staticFile(LOGO_FILE)}
        style={{
          position: "absolute",
          width: 760,
          height: 760,
          left: (1080 - 760) / 2,
          top: 330,
          opacity: logo,
          translate: `0 ${(1 - logo) * 24}px`,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 1150,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily,
          opacity: ctaIn,
          translate: `0 ${(1 - ctaIn) * 14}px`,
        }}
      >
        <div
          style={{
            display: "inline-block",
            fontSize: 44,
            fontWeight: 700,
            color: colors.charcoal,
            background: colors.offWhite,
            borderRadius: 999,
            padding: "20px 44px",
          }}
        >
          {cta}
        </div>
        <div style={{ marginTop: 26, fontSize: 34, fontWeight: 500, color: colors.muted, letterSpacing: 0.5 }}>
          {url}
        </div>
      </div>
    </AbsoluteFill>
  );
};
