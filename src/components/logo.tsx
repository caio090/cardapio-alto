import Image from "next/image";

// Arquivo oficial: círculo laranja preenchendo um canvas quadrado com uma
// margem branca fina ao redor. Recortamos essa margem com rounded-full +
// leve zoom, sem redesenhar ou alterar a logo em si.
export function Logo({ size = 40 }: { size?: number }) {
  return (
    <span
      className="relative inline-block shrink-0 overflow-hidden rounded-full"
      style={{ width: size, height: size }}
    >
      <Image
        src="/logo-badge.png"
        alt="Cardápio Alto"
        fill
        sizes={`${size}px`}
        className="scale-110 object-cover"
        priority
      />
    </span>
  );
}
