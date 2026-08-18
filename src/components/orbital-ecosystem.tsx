import Image from "next/image";

// Pure CSS orbit mechanics (see globals.css): a zero-size pivot rotates,
// an arm offsets the item by a fixed radius, and a counter-rotation cancels
// the pivot's spin so each product photo stays upright while it revolves.
function OrbitItem({
  radius,
  angle,
  duration,
  reverse = false,
  size,
  shape,
  children,
}: {
  radius: number;
  angle: number;
  duration: string;
  reverse?: boolean;
  size: number;
  shape: "circle" | "rounded" | "square";
  children: React.ReactNode;
}) {
  const direction = reverse ? "reverse" : "normal";
  return (
    <div className="orbit-pivot" style={{ animationDuration: duration, animationDirection: direction }}>
      <div className="orbit-arm" style={{ transform: `rotate(${angle}deg) translateX(${radius}px)` }}>
        <div className="orbit-counter" style={{ animationDuration: duration, animationDirection: direction }}>
          <div
            className={`relative overflow-hidden bg-bg shadow-lg shadow-black/10 ${
              shape === "circle" ? "rounded-full" : shape === "square" ? "rounded-xl" : "rounded-2xl"
            }`}
            style={{ width: size, height: shape === "rounded" ? size * 1.35 : size }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

// Percentage-based sizing (not Tailwind's fixed px spacing) so this still
// reads as a menu card at the very small size it renders at in compact
// (mobile) orbits, instead of padding eating the entire container.
function MenuCard() {
  const bar = (top: string, width: string, color: string) => (
    <div
      style={{ position: "absolute", top, left: "14%", width, height: "9%", borderRadius: 9999, background: color }}
    />
  );
  return (
    <div className="relative h-full w-full bg-[#FDFAF5]">
      {bar("16%", "60%", "var(--bg-deep)")}
      {bar("38%", "72%", "#1a120673")}
      {bar("52%", "50%", "#1a120673")}
      {bar("70%", "72%", "#1a120673")}
      {bar("84%", "40%", "#1a120673")}
    </div>
  );
}

// `compact` (mobile/tablet): fewer rings, fewer items, everything scaled
// down — not just a shrunk copy of the desktop composition.
export function OrbitalEcosystem({ compact = false }: { compact?: boolean }) {
  const scale = compact ? 0.42 : 1;
  const r = (px: number) => Math.round(px * scale);

  const rings = compact ? [r(110), r(160), r(210)] : [110, 160, 210, 260];

  return (
    <div aria-hidden className="relative mx-auto aspect-square w-full max-w-[560px]">
      {rings.map((d) => (
        <div key={d} className="orbit-ring" style={{ width: d * 2, height: d * 2 }} />
      ))}

      {/* Static typographic labels for the four analysis areas — no icons,
          no cards, just type placed around the composition. Dropped in
          compact mode: they'd overlap at that scale. */}
      {!compact && (
        <>
          <span className="absolute left-2 top-6 text-xs font-semibold tracking-wide text-ink/70 sm:left-4 sm:top-10">
            Cardápio
          </span>
          <span className="absolute right-2 top-6 text-xs font-semibold tracking-wide text-white/80 sm:right-4 sm:top-10">
            Conteúdo
          </span>
          <span className="absolute bottom-6 left-2 text-xs font-semibold tracking-wide text-ink/70 sm:bottom-10 sm:left-4">
            Aquisição
          </span>
          <span className="absolute bottom-6 right-2 text-xs font-semibold tracking-wide text-white/80 sm:bottom-10 sm:right-4">
            Conversão
          </span>
        </>
      )}

      {/* Center */}
      <div
        className="animate-pop absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full bg-bg-deep text-center shadow-xl shadow-black/20"
        style={{ width: compact ? 68 : 128, height: compact ? 68 : 128 }}
      >
        <span className={`font-display font-black text-white ${compact ? "text-xl" : "text-5xl"}`}>4</span>
        {!compact && (
          <span className="mt-0.5 max-w-[6rem] text-[0.65rem] font-medium leading-tight text-white/80">
            áreas analisadas
          </span>
        )}
      </div>

      <OrbitItem radius={r(110)} angle={40} duration="35s" size={r(64)} shape="circle">
        <Image src="/images/hero-burger.jpg" alt="Hambúrguer artesanal" fill className="object-cover" sizes="64px" />
      </OrbitItem>

      <OrbitItem radius={r(160)} angle={160} duration="45s" size={r(56)} shape="rounded" reverse>
        <MenuCard />
      </OrbitItem>
      {!compact && (
        <OrbitItem radius={r(160)} angle={-20} duration="45s" size={r(60)} shape="circle" reverse>
          <Image src="/images/pizza-close.jpg" alt="Pizza recém-assada" fill className="object-cover" sizes="60px" />
        </OrbitItem>
      )}

      <OrbitItem radius={r(210)} angle={-90} duration="55s" size={r(58)} shape="square">
        <Image
          src="/images/phone-caminho.jpg"
          alt="Tela de celular com Instagram — conteúdo digital"
          fill
          className="object-cover"
          sizes="58px"
        />
      </OrbitItem>

      {!compact && (
        <OrbitItem radius={r(260)} angle={100} duration="70s" size={r(70)} shape="rounded" reverse>
          <Image src="/images/fries-dark.jpg" alt="Porção de batata frita" fill className="object-cover" sizes="70px" />
        </OrbitItem>
      )}
    </div>
  );
}
