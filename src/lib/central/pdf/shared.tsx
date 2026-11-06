import path from "node:path";
import { Font, Path, StyleSheet, Svg, Text, View } from "@react-pdf/renderer";

// Fontes incorporadas (OFL) — garantem acentos e texto selecionável.
// Os arquivos ficam no repositório e entram no build via
// outputFileTracingIncludes (next.config.ts).
const FONT_DIR = path.join(process.cwd(), "src/lib/central/pdf/fonts");
let registered = false;

export function registerFonts() {
  if (registered) return;
  Font.register({
    family: "Inter",
    fonts: [
      { src: path.join(FONT_DIR, "inter-latin-400-normal.woff") },
      { src: path.join(FONT_DIR, "inter-latin-400-italic.woff"), fontStyle: "italic" },
      { src: path.join(FONT_DIR, "inter-latin-700-normal.woff"), fontWeight: 700 },
    ],
  });
  Font.register({ family: "Mono", src: path.join(FONT_DIR, "jetbrains-mono-latin-400-normal.woff") });
  // Sem hifenização automática (o padrão é inglês e quebra palavras em PT).
  Font.registerHyphenationCallback((word) => [word]);
  registered = true;
}

export const C = {
  ink: "#1d2327",
  muted: "#5b6770",
  teal: "#0f6e78",
  tealSoft: "#e3f1f2",
  orange: "#d4561d",
  orangeSoft: "#fdf0e8",
  line: "#d6dfe2",
  code: "#f4f7f8",
  green: "#2e7d4f",
  amber: "#a8680a",
  gray: "#6b7280",
};

export const s = StyleSheet.create({
  page: { fontFamily: "Inter", fontSize: 9.6, color: C.ink, paddingTop: 44, paddingBottom: 48, paddingHorizontal: 46, lineHeight: 1.45 },
  kicker: { fontSize: 7.5, color: C.orange, fontWeight: 700, textTransform: "uppercase", marginBottom: 3 },
  h1: { fontSize: 19, fontWeight: 700, marginBottom: 8, lineHeight: 1.2 },
  h2: { fontSize: 12, fontWeight: 700, color: C.teal, marginTop: 12, marginBottom: 5 },
  p: { marginBottom: 5 },
  small: { fontSize: 8, color: C.muted },
  bulletRow: { flexDirection: "row", marginBottom: 2.5 },
  bulletDot: { width: 10, color: C.teal },
  bulletText: { flex: 1 },
  table: { borderWidth: 0.7, borderColor: C.line, marginVertical: 5 },
  tr: { flexDirection: "row", borderBottomWidth: 0.7, borderColor: C.line },
  th: { backgroundColor: C.tealSoft, fontWeight: 700 },
  td: { padding: 4, flex: 1, fontSize: 8.6, borderRightWidth: 0.7, borderColor: C.line },
  prompt: { fontFamily: "Mono", fontSize: 7.9, backgroundColor: C.code, borderLeftWidth: 2.5, borderColor: C.teal, padding: 7, marginVertical: 5, lineHeight: 1.5 },
  label: { fontFamily: "Inter", fontSize: 6.8, fontWeight: 700, color: "#fff", backgroundColor: C.teal, paddingHorizontal: 4, paddingVertical: 1.5, alignSelf: "flex-start", marginBottom: 4, borderRadius: 2 },
  note: { padding: 7, borderRadius: 4, marginVertical: 6, borderWidth: 0.7 },
  footer: { position: "absolute", bottom: 22, left: 46, right: 46, flexDirection: "row", justifyContent: "space-between", fontSize: 7, color: C.gray },
  link: { color: C.teal, textDecoration: "underline" },
});

export function Bullets({ items }: { items: string[] }) {
  return (
    <View>
      {items.map((it, i) => (
        <View key={i} style={s.bulletRow} wrap={false}>
          <Text style={s.bulletDot}>•</Text>
          <Text style={s.bulletText}>{it}</Text>
        </View>
      ))}
    </View>
  );
}

export function Checklist({ items }: { items: string[] }) {
  return (
    <View>
      {items.map((it, i) => (
        <View key={i} style={s.bulletRow} wrap={false}>
          <View style={{ width: 7, height: 7, borderWidth: 0.8, borderColor: C.teal, marginTop: 2.5, marginRight: 6 }} />
          <Text style={s.bulletText}>{it}</Text>
        </View>
      ))}
    </View>
  );
}

export function Table({ rows, widths }: { rows: string[][]; widths?: number[] }) {
  if (!rows.length) return null;
  return (
    <View style={s.table}>
      {rows.map((r, i) => (
        <View key={i} style={[s.tr, i === rows.length - 1 ? { borderBottomWidth: 0 } : {}]} wrap={false}>
          {r.map((cell, j) => (
            <Text
              key={j}
              style={[
                s.td,
                i === 0 ? s.th : {},
                widths ? { flex: widths[j] ?? 1 } : {},
                j === r.length - 1 ? { borderRightWidth: 0 } : {},
              ]}
            >
              {cell}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}

/** Diagrama de fluxo: caixas ligadas por setas desenhadas em vetor. */
export function Flow({ steps, colors }: { steps: string[]; colors?: string[] }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 8 }} wrap={false}>
      {steps.map((st, i) => (
        <View key={i} style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          <View
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: colors?.[i] ?? C.teal,
              backgroundColor: C.tealSoft,
              borderRadius: 4,
              paddingVertical: 6,
              paddingHorizontal: 3,
              minHeight: 34,
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 6.6, color: C.orange, textAlign: "center", fontWeight: 700 }}>{i + 1}</Text>
            <Text style={{ fontSize: 7.4, textAlign: "center", fontWeight: 700 }}>{st}</Text>
          </View>
          {i < steps.length - 1 && (
            <Svg width={10} height={8} viewBox="0 0 10 8">
              <Path d="M0 4 H7 M4.5 1 L8 4 L4.5 7" stroke={C.orange} strokeWidth={1.2} fill="none" />
            </Svg>
          )}
        </View>
      ))}
    </View>
  );
}

export function parseTable(text: string): string[][] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => l.split("|").map((c) => c.trim()));
}

export function lines(text: string): string[] {
  return text
    .split("\n")
    .map((l) => l.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);
}

/** Texto com parágrafos e listas ("- item"). */
export function RichText({ text }: { text: string }) {
  const blocks = text.split(/\n\s*\n/);
  return (
    <View>
      {blocks.map((b, i) => {
        const ls = b.split("\n");
        if (ls.every((l) => /^\s*[-•*]\s+/.test(l))) return <Bullets key={i} items={lines(b)} />;
        return (
          <Text key={i} style={s.p}>
            {b}
          </Text>
        );
      })}
    </View>
  );
}

export function Footer({ left }: { left: string }) {
  return (
    <View style={s.footer} fixed>
      <Text>{left}</Text>
      <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
    </View>
  );
}
