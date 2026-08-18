import localFont from "next/font/local";

export const cabinetGrotesk = localFont({
  src: [
    { path: "./CabinetGrotesk-Extralight.woff2", weight: "200", style: "normal" },
    { path: "./CabinetGrotesk-Regular.woff2", weight: "400", style: "normal" },
    { path: "./CabinetGrotesk-Medium.woff2", weight: "500", style: "normal" },
    { path: "./CabinetGrotesk-Bold.woff2", weight: "700", style: "normal" },
    { path: "./CabinetGrotesk-Black.woff2", weight: "900", style: "normal" },
  ],
  variable: "--font-display",
  display: "swap",
});
