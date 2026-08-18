const SEGMENTS = [
  "Hamburguerias",
  "Pizzarias",
  "Restaurantes",
  "Delivery",
  "Cafeterias",
  "Docerias",
  "Bares",
  "Marmitarias",
];

function Track() {
  return (
    <div className="flex shrink-0 items-center gap-3 pr-3" aria-hidden>
      {SEGMENTS.map((segment, i) => (
        <span key={segment} className="flex items-center gap-3 text-sm font-medium text-ink/60">
          {segment}
          {i < SEGMENTS.length - 1 && <span className="h-1 w-1 rounded-full bg-ink/30" />}
        </span>
      ))}
    </div>
  );
}

// Pure CSS marquee: two copies of the track back to back, animated -50%,
// which loops seamlessly since each copy is exactly half the total width.
export function SegmentTicker() {
  return (
    <div
      className="flex w-full overflow-hidden"
      style={{
        maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
      }}
    >
      <span className="sr-only">
        Atendemos {SEGMENTS.join(", ")} e outros negócios de alimentação.
      </span>
      <div className="animate-marquee flex w-max shrink-0">
        <Track />
        <Track />
      </div>
    </div>
  );
}
