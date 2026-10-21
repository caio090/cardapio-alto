import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Cabinet Grotesk — mesmos arquivos usados no site (src/fonts).
const weights = [
  ["Regular", "400"],
  ["Medium", "500"],
  ["Bold", "700"],
  ["Black", "900"],
] as const;

export const fontsLoaded = Promise.all(
  weights.map(([name, weight]) =>
    loadFont({
      family: "Cabinet Grotesk",
      url: staticFile(`fonts/CabinetGrotesk-${name}.woff2`),
      weight,
      display: "block",
    }),
  ),
);
