import { AbsoluteFill, Img, staticFile } from "remotion";
import { LOGO_FILE } from "./components/BrandOutro";
import { FoodBroll } from "./components/FoodBroll";
import { colors, fontFamily } from "./theme";

// Quadro de capa do Reels. Conteúdo-chave no miolo 3:4 (y 240–1680), que é
// o recorte da grade do perfil; a logo fica sobre o carvão, nunca sobre o produto.
export const Cover: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: colors.charcoal, fontFamily }}>
    <AbsoluteFill style={{ top: 1060 }}>
      <FoodBroll src="broll/fotos/hero-burger.jpg" objectPosition="50% 60%" shade="top" />
    </AbsoluteFill>
    <Img
      src={staticFile(LOGO_FILE)}
      style={{ position: "absolute", width: 260, height: 260, left: 40, top: 250 }}
    />
    <div style={{ position: "absolute", top: 540, left: 84, right: 84 }}>
      <div style={{ fontSize: 60, fontWeight: 500, color: colors.offWhite, letterSpacing: -0.6 }}>
        Seu cardápio deveria
      </div>
      <div style={{ fontSize: 150, fontWeight: 900, color: colors.offWhite, lineHeight: 0.95, letterSpacing: -3, marginTop: 10 }}>
        FACILITAR
        <br />
        <span style={{ color: colors.amber }}>A VENDA.</span>
      </div>
      <div style={{ marginTop: 26, fontSize: 52, fontWeight: 500, color: colors.offWhite }}>Não complicar o pedido.</div>
    </div>
  </AbsoluteFill>
);
