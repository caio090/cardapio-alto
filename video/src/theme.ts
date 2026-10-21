// Paleta derivada do site oficial (src/app/globals.css, valores OKLCH
// convertidos para hex) e do Brand DNA: núcleo carvão + off-white, laranja
// quente da logo como acento, azul da logo apenas onde a própria marca usa.
export const colors = {
  charcoal: "#121110",
  charcoal2: "#1b1917",
  charcoal3: "#26231f",
  line: "#3a3530",
  offWhite: "#f3eee6",
  cream: "#fdfaf5",
  muted: "#9a9187",
  // --bg do site (oklch 0.637 0.232 33.4): laranja amostrado da logo oficial.
  orange: "#f83701",
  // Amarelo quente de apoio (Brand DNA: "amarelo/laranja quente como acento").
  amber: "#ffb12a",
  // --primary do site (oklch 0.469 0.257 264): azul da seta/lettering da logo.
  blue: "#043ce7",
};

export const fontFamily = "'Cabinet Grotesk', system-ui, sans-serif";

export const VIDEO = { width: 1080, height: 1920, fps: 30 };

// Áreas seguras para Reels: topo (barra de status/título), base (legenda do
// post, nome do perfil, áudio) e coluna direita (curtir/comentar/enviar).
export const SAFE = {
  top: 220,
  bottom: 420,
  left: 80,
  right: 140,
};

// Faixa reservada às legendas — abaixo do celular e acima da UI do Reels.
export const CAPTION_BAND = { top: 1330, bottom: 1920 - SAFE.bottom };
