import Link from "next/link";
import { DiagnosticCTA } from "./diagnostic-cta";
import { OrbitalEcosystem } from "./orbital-ecosystem";
import { SegmentTicker } from "./segment-ticker";

// Background echoes the brief exactly: cream top-left → soft diffuse
// red-orange center → royal blue right → deep navy bottom. No hero photo —
// the gastronomic imagery lives in the orbital composition on the right.
const HERO_BACKGROUND = {
  backgroundColor: "#FDFAF5",
  backgroundImage: [
    "radial-gradient(ellipse 70% 60% at 8% 4%, #FDFAF5 0%, transparent 60%)",
    "radial-gradient(ellipse 65% 55% at 42% 38%, oklch(0.72 0.14 35 / 55%) 0%, transparent 70%)",
    "radial-gradient(ellipse 75% 70% at 88% 30%, oklch(0.5 0.19 264 / 85%) 0%, transparent 65%)",
    "radial-gradient(ellipse 90% 65% at 65% 100%, oklch(0.22 0.1 264) 0%, transparent 70%)",
  ].join(", "),
};

export function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-[100svh] flex-col overflow-hidden pt-20"
      style={HERO_BACKGROUND}
    >
      <div className="relative mx-auto flex w-full max-w-[1600px] flex-1 flex-col justify-center px-6 py-12 sm:px-8 lg:px-16">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,45%)_minmax(0,55%)] lg:gap-8">
          {/* Left — copy */}
          <div>
            <p className="animate-line text-xs font-bold uppercase tracking-wide text-bg-deep">
              Estratégia para negócios de alimentação no Piauí
            </p>

            <h1 className="mt-4 text-[clamp(2.25rem,5.2vw,4.5rem)] font-bold leading-[1.05] tracking-[-0.02em] text-[#1a1206]">
              <span className="animate-line block" style={{ animationDelay: "80ms" }}>
                Seu negócio pode estar
              </span>
              <span
                className="animate-line block text-bg-deep"
                style={{ animationDelay: "180ms" }}
              >
                vendendo menos
              </span>
              <span className="animate-line block" style={{ animationDelay: "280ms" }}>
                do que poderia.
              </span>
            </h1>

            <p className="mt-6 max-w-md text-base leading-relaxed text-[#1a1206]/70 sm:text-lg">
              Analisamos cardápio, conteúdo, presença digital e caminho de
              compra para encontrar onde seu negócio pode melhorar.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <DiagnosticCTA className="rounded-full bg-black px-7 py-3.5 text-base font-medium text-white transition-colors hover:bg-bg-deep">
                Fazer meu diagnóstico
              </DiagnosticCTA>
              <Link
                href="#metodo"
                className="group inline-flex items-center gap-2 text-base font-medium text-[#1a1206] transition-colors hover:text-bg-deep"
              >
                Entender como funciona
                <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </Link>
            </div>
          </div>

          {/* Right — orbital ecosystem */}
          <div className="hidden lg:block">
            <OrbitalEcosystem />
          </div>
        </div>

        <div className="mt-10 flex justify-center lg:hidden">
          <div className="w-full max-w-[280px] sm:max-w-[360px]">
            <OrbitalEcosystem compact />
          </div>
        </div>
      </div>

      <div className="relative border-t border-black/10 py-4">
        <SegmentTicker />
      </div>
    </section>
  );
}
