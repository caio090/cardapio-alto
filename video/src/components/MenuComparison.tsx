import type { CSSProperties } from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { colors, fontFamily } from "../theme";
import { SCREEN_H, SCREEN_W } from "./PhoneMockup";

// Telas ILUSTRATIVAS de cardápio (antes/depois). Nenhuma representa um
// cliente real; os textos dos produtos descrevem apenas o que aparece nas
// fotos, sem inventar ingredientes.

const legacy = "Arial, Helvetica, sans-serif";
const legacySerif = "'Times New Roman', Times, serif";

/* ------------------------------------------------------------------ */
/* ANTES: cardápio confuso                                             */
/* ------------------------------------------------------------------ */

type MessyRow = { name: string; price?: string; note?: string };
type MessyBlock = { title: string; rows: MessyRow[]; id?: string };

const MESSY: MessyBlock[] = [
  {
    title: "LANCHES",
    rows: [
      { name: "X-TUDO ESPECIAL DA CASA C/ BACON OVO CALABRESA FRANGO MILHO", price: "32,90" },
      { name: "X-BURGUER", price: "24" },
      { name: "LANCHE 3 (VER OBS)", price: "27,5" },
    ],
  },
  { title: "OUTROS", rows: [{ name: "PORÇÃO P/M/G", price: "consultar" }, { name: "ADICIONAIS VER NO BALCÃO" }] },
  {
    title: "COMBOS 2",
    id: "combos",
    rows: [
      { name: "COMBO 1 - LANCHE + BATATA + REFRI*", price: "39,90" },
      { name: "COMBO 1 ESPECIAL - LANCHE ESP. + BATATA M + REFRI LATA**", price: "42,90" },
      { name: "COMBO FAMÍLIA", price: "*consultar*", note: "*exceto promo  **sabores a combinar" },
    ],
  },
  { title: "LANCHES 2", rows: [{ name: "X-SALADA", price: "22" }, { name: "MISTO", price: "15,00" }] },
  { title: "BEBIDAS / SOBREMESAS", rows: [{ name: "REFRI", price: "6" }, { name: "SUCO (VER SABORES)", price: "9" }] },
];

export const MessyMenuScreen: React.FC<{
  scrollY?: number;
  compare?: number; // 0..1 — contorna os dois combos parecidos
  confusion?: number; // 0..1 — interrogações sobre os combos
}> = ({ scrollY = 0, compare = 0, confusion = 0 }) => {
  return (
    <AbsoluteFill style={{ background: "#ececec", overflow: "hidden" }}>
      <div style={{ translate: `0 ${-scrollY}px` }}>
        <div style={{ height: 70 }} />
        <div
          style={{
            background: "#9a9a9a",
            color: "#fff",
            fontFamily: legacy,
            fontWeight: 700,
            fontSize: 30,
            padding: "14px 20px",
          }}
        >
          CARDAPIO
        </div>
        <div
          style={{
            background: "#ffe600",
            color: "#d40000",
            fontFamily: legacySerif,
            fontWeight: 700,
            fontSize: 24,
            padding: "10px 16px",
            textAlign: "center",
          }}
        >
          PROMOÇÃO!!! CONSULTE CONDIÇÕES
        </div>
        {MESSY.map((block, bi) => (
          <div key={block.title} style={{ padding: "18px 18px 6px", position: "relative" }}>
            <div
              style={{
                fontFamily: bi % 2 ? legacySerif : legacy,
                fontSize: bi % 2 ? 23 : 26,
                fontWeight: 700,
                color: bi % 2 ? "#444" : "#111",
                textDecoration: bi === 1 ? "underline" : "none",
                marginBottom: 8,
              }}
            >
              {block.title}
            </div>
            {block.rows.map((row, ri) => {
              const isCompared = block.id === "combos" && ri < 2;
              return (
                <div
                  key={row.name}
                  style={{
                    position: "relative",
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    fontFamily: ri % 2 ? legacySerif : legacy,
                    fontSize: 20,
                    color: "#333",
                    padding: "9px 4px",
                    borderBottom: "1px dotted #b5b5b5",
                  }}
                >
                  <span style={{ maxWidth: 330 }}>
                    {row.name}
                    {row.note ? (
                      <div style={{ fontSize: 15, color: "#8a8a8a", marginTop: 4 }}>{row.note}</div>
                    ) : null}
                  </span>
                  {row.price ? <span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>{row.price}</span> : null}
                  {isCompared ? (
                    <div
                      style={{
                        position: "absolute",
                        inset: -4,
                        border: `3px dashed ${colors.orange}`,
                        borderRadius: 6,
                        opacity: compare,
                      }}
                    />
                  ) : null}
                  {isCompared ? (
                    <div
                      style={{
                        position: "absolute",
                        right: ri === 0 ? -6 : 60,
                        top: -30,
                        fontFamily,
                        fontWeight: 900,
                        fontSize: 54,
                        color: colors.orange,
                        opacity: confusion,
                        translate: `0 ${(1 - confusion) * 16}px`,
                      }}
                    >
                      ?
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        ))}
        <div style={{ height: 400 }} />
      </div>
    </AbsoluteFill>
  );
};

// Posição (px, dentro da tela) do bloco de combos — usada para o scroll.
export const MESSY_COMBOS_SCROLL = 330;

/* ------------------------------------------------------------------ */
/* Carrinho confuso + abandono                                         */
/* ------------------------------------------------------------------ */

export const MessyCartScreen: React.FC<{ abandon?: number }> = ({ abandon = 0 }) => (
  <AbsoluteFill style={{ background: "#ececec" }}>
    <div style={{ height: 70 }} />
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontFamily: legacy,
        fontWeight: 700,
        fontSize: 28,
        padding: "14px 20px",
        background: "#9a9a9a",
        color: "#fff",
      }}
    >
      SEU PEDIDO
      <span style={{ fontSize: 34, lineHeight: 1 }}>×</span>
    </div>
    <div style={{ padding: 20, fontFamily: legacy, color: "#333", fontSize: 21 }}>
      <div style={{ fontWeight: 700 }}>1x COMBO 1 (VER OBS)</div>
      <div style={{ color: "#888", fontSize: 17, marginTop: 6 }}>OBS: BEBIDA A COMBINAR / ADICIONAL?</div>
      <div style={{ marginTop: 22, borderTop: "1px dotted #aaa", paddingTop: 14 }}>TAXA: CONSULTAR</div>
      <div style={{ marginTop: 10 }}>TOTAL: 39,90 + taxa</div>
    </div>
    <div
      style={{
        position: "absolute",
        bottom: 60,
        left: 20,
        right: 20,
        background: "#b8b8b8",
        color: "#fff",
        fontFamily: legacy,
        fontWeight: 700,
        fontSize: 22,
        textAlign: "center",
        padding: "18px 0",
      }}
    >
      FINALIZAR (CONTINUAR NO WHATS?)
    </div>
    {/* Abandono: a tela perde a cor e se apaga. */}
    <AbsoluteFill style={{ background: colors.charcoal, opacity: abandon * 0.88 }} />
  </AbsoluteFill>
);

/* ------------------------------------------------------------------ */
/* DEPOIS: cardápio organizado                                         */
/* ------------------------------------------------------------------ */

type Product = { photo: string; name: string; desc: string; price: string; position?: string };

const CATEGORIES = ["Burgers", "Porções", "Pizzas", "Bebidas"];

const PRODUCTS: { category: string; item: Product }[] = [
  {
    category: "Burgers",
    item: {
      photo: "broll/fotos/hero-burger.jpg",
      name: "Smash duplo",
      desc: "Dois smash, cheddar, cebola, picles, tomate, alface e molho.",
      price: "R$ 34,90",
      position: "50% 55%",
    },
  },
  {
    category: "Porções",
    item: {
      photo: "broll/fotos/fries-dark.jpg",
      name: "Batata frita",
      desc: "Batata crocante servida na cestinha.",
      price: "R$ 18,90",
      position: "50% 45%",
    },
  },
  {
    category: "Pizzas",
    item: {
      photo: "broll/fotos/pizza-close.jpg",
      name: "Margherita",
      desc: "Molho de tomate, muçarela e manjericão.",
      price: "R$ 49,90",
      position: "50% 75%",
    },
  },
];

const cleanText: CSSProperties = { fontFamily, color: colors.charcoal };

export const CleanMenuScreen: React.FC<{
  photos?: number; // 0..1 — fotos reais entram nos cards
  chips?: number; // 0..1 — categorias organizadas
  descriptions?: number; // 0..1 — descrições ganham hierarquia
  activeChip?: number;
  highlight?: "photos" | "chips" | "descriptions" | null;
  highlightAmount?: number;
  scrollY?: number;
}> = ({
  photos = 1,
  chips = 1,
  descriptions = 1,
  activeChip = 0,
  highlight = null,
  highlightAmount = 0,
  scrollY = 0,
}) => {
  const ring = (key: typeof highlight): CSSProperties =>
    highlight === key
      ? { outline: `3px solid ${colors.orange}`, outlineOffset: 4, outlineColor: `rgba(248,55,1,${highlightAmount})` }
      : {};

  return (
    <AbsoluteFill style={{ background: colors.cream, overflow: "hidden" }}>
      <div style={{ translate: `0 ${-scrollY}px`, padding: "84px 26px 0" }}>
        <div style={{ ...cleanText, fontSize: 40, fontWeight: 900, letterSpacing: -0.8 }}>Cardápio</div>
        <div
          style={{
            marginTop: 16,
            height: 54,
            borderRadius: 16,
            background: "#efe9df",
            display: "flex",
            alignItems: "center",
            padding: "0 18px",
            ...cleanText,
            color: "#8b8279",
            fontSize: 20,
            fontWeight: 500,
          }}
        >
          Buscar no cardápio
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 20, ...ring("chips"), borderRadius: 14 }}>
          {CATEGORIES.map((c, i) => (
            <div
              key={c}
              style={{
                ...cleanText,
                fontSize: 19,
                fontWeight: 700,
                padding: "11px 17px",
                borderRadius: 999,
                background: i === activeChip ? colors.charcoal : "#efe9df",
                color: i === activeChip ? colors.cream : colors.charcoal,
                opacity: chips,
                translate: `${(1 - chips) * (40 + i * 30)}px 0`,
              }}
            >
              {c}
            </div>
          ))}
        </div>

        {PRODUCTS.map(({ category, item }) => (
          <div key={item.name} style={{ marginTop: 26 }}>
            <div
              style={{
                ...cleanText,
                fontSize: 26,
                fontWeight: 900,
                letterSpacing: -0.4,
                marginBottom: 12,
                opacity: chips,
              }}
            >
              {category}
            </div>
            <div
              style={{
                display: "flex",
                gap: 16,
                background: "#fff",
                borderRadius: 22,
                padding: 14,
                boxShadow: "0 6px 20px rgba(30,20,10,0.08)",
              }}
            >
              <div
                style={{
                  width: 150,
                  height: 150,
                  borderRadius: 16,
                  overflow: "hidden",
                  flexShrink: 0,
                  background: "#e3ddd3",
                  ...ring("photos"),
                }}
              >
                <Img
                  src={staticFile(item.photo)}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: item.position,
                    opacity: photos,
                    scale: String(1.15 - 0.15 * photos),
                  }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 8 }}>
                <div style={{ ...cleanText, fontSize: 25, fontWeight: 700 }}>{item.name}</div>
                <div
                  style={{
                    ...cleanText,
                    fontSize: 17,
                    fontWeight: 400,
                    lineHeight: 1.3,
                    color: "#5d554c",
                    opacity: descriptions,
                    maxHeight: 66 * descriptions + 1,
                    overflow: "hidden",
                    borderRadius: 6,
                    ...ring("descriptions"),
                  }}
                >
                  {item.desc}
                </div>
                <div style={{ ...cleanText, fontSize: 21, fontWeight: 700, color: colors.orange }}>
                  {item.price}
                </div>
              </div>
            </div>
          </div>
        ))}
        <div style={{ height: 300 }} />
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Produto: descrição, adicionais e carrinho                           */
/* ------------------------------------------------------------------ */

export const ProductDetailScreen: React.FC<{
  checked?: number; // 0..1 — adicional selecionado
  pressed?: number; // 0..1 — botão pressionado
  cartBar?: number; // 0..1 — barra "Ver carrinho"
  addOns?: number; // 0..1 — bloco de adicionais visível
}> = ({ checked = 0, pressed = 0, cartBar = 0, addOns = 1 }) => {
  const product = PRODUCTS[0].item;
  return (
    <AbsoluteFill style={{ background: colors.cream }}>
      <div style={{ height: 470, overflow: "hidden" }}>
        <Img
          src={staticFile(product.photo)}
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 60%" }}
        />
      </div>
      <div style={{ padding: "24px 26px" }}>
        <div style={{ ...cleanText, fontSize: 38, fontWeight: 900, letterSpacing: -0.8 }}>{product.name}</div>
        <div style={{ ...cleanText, fontSize: 19, lineHeight: 1.35, color: "#5d554c", marginTop: 8 }}>
          {product.desc}
        </div>
        <div style={{ opacity: addOns, translate: `0 ${(1 - addOns) * 20}px` }}>
          <div
            style={{
              ...cleanText,
              fontSize: 17,
              fontWeight: 700,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              color: "#8b8279",
              marginTop: 24,
            }}
          >
            Adicionais (opcional)
          </div>
          {[
            ["Bacon", "+ R$ 5,00"],
            ["Cheddar extra", "+ R$ 4,00"],
          ].map(([name, price], i) => (
            <div
              key={name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "14px 0",
                borderBottom: "1px solid #e6dfd4",
                ...cleanText,
                fontSize: 21,
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  border: `2px solid ${i === 0 && checked > 0.5 ? colors.orange : "#c9c0b4"}`,
                  background: i === 0 ? `rgba(248,55,1,${checked})` : "transparent",
                }}
              />
              <span style={{ flex: 1, fontWeight: 500 }}>{name}</span>
              <span style={{ color: "#8b8279" }}>{price}</span>
            </div>
          ))}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 22,
          right: 22,
          bottom: 40 + cartBar * 92,
          borderRadius: 18,
          background: colors.orange,
          color: "#fff",
          fontFamily,
          fontWeight: 700,
          fontSize: 23,
          textAlign: "center",
          padding: "20px 0",
          scale: String(1 - pressed * 0.04),
        }}
      >
        Adicionar · {checked > 0.5 ? "R$ 39,90" : "R$ 34,90"}
      </div>
      <div
        style={{
          position: "absolute",
          left: 22,
          right: 22,
          bottom: 32,
          borderRadius: 18,
          background: colors.charcoal,
          color: colors.cream,
          fontFamily,
          fontWeight: 700,
          fontSize: 21,
          display: "flex",
          justifyContent: "space-between",
          padding: "18px 22px",
          opacity: cartBar,
          translate: `0 ${(1 - cartBar) * 40}px`,
        }}
      >
        <span>Ver carrinho · 1 item</span>
        <span>R$ 39,90</span>
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Toque (dedo) — indica a ação do cliente sobre a tela                */
/* ------------------------------------------------------------------ */

export const TouchPoint: React.FC<{ x: number; y: number; press: number; visible?: number }> = ({
  x,
  y,
  press,
  visible = 1,
}) => (
  <div
    style={{
      position: "absolute",
      left: x - 34,
      top: y - 34,
      width: 68,
      height: 68,
      borderRadius: 34,
      background: "rgba(255,255,255,0.35)",
      border: "3px solid rgba(255,255,255,0.9)",
      boxShadow: "0 4px 18px rgba(0,0,0,0.35)",
      opacity: visible,
      scale: String(1 - press * 0.22),
    }}
  />
);

/* ------------------------------------------------------------------ */
/* Antes → depois: reorganização progressiva                           */
/* ------------------------------------------------------------------ */

// progress 0 = cardápio confuso; 1 = estrutura limpa (ainda sem fotos,
// categorias e descrições, que entram depois, cada uma no seu tempo).
export const MenuComparison: React.FC<
  { progress: number; messyScrollY?: number } & React.ComponentProps<typeof CleanMenuScreen>
> = ({ progress, messyScrollY = 0, ...clean }) => (
  <AbsoluteFill>
    <CleanMenuScreen {...clean} />
    <AbsoluteFill
      style={{
        opacity: 1 - progress,
        filter: `blur(${progress * 6}px)`,
        translate: `0 ${progress * -40}px`,
      }}
    >
      <MessyMenuScreen scrollY={messyScrollY} />
    </AbsoluteFill>
  </AbsoluteFill>
);

export { SCREEN_H, SCREEN_W };
