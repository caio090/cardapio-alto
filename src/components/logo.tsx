import Image from "next/image";

// Arquivos oficiais, usados como entregues — nunca recriados/redesenhados.
const NATURAL_SIZE = 1254;

// `badge`: círculo laranja recortado da margem branca do canvas quadrado
// (logo-badge.png, fundo opaco) — usado no footer, sobre o laranja do site.
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

// Janela de recorte do ícone (celular + cloche + seta) dentro do arquivo
// transparente (logo-transparente.png, 1254×1254) — medida por amostragem
// de pixel, não estimada. O arquivo original nunca é alterado; isto só
// escolhe qual região fica visível, como um crop de foto.
const ICON_CROP = { x: 300, y: 180, w: 690, h: 500 };

// `IconMark`: ícone em janela recortada do arquivo transparente oficial
// (branco, precisa de fundo escuro) — usado no header, sobre o gradiente
// claro do Hero, dentro de um chip escuro que já é a mesma linguagem dos
// botões primários da página.
export function IconMark({ height = 28 }: { height?: number }) {
  const scale = height / ICON_CROP.h;
  const width = Math.round(ICON_CROP.w * scale);
  const naturalScaled = Math.round(NATURAL_SIZE * scale);

  return (
    <span
      className="relative inline-block shrink-0 overflow-hidden"
      style={{ width, height }}
    >
      <Image
        src="/logo-transparente.png"
        alt=""
        width={naturalScaled}
        height={naturalScaled}
        priority
        style={{
          position: "absolute",
          top: -Math.round(ICON_CROP.y * scale),
          left: -Math.round(ICON_CROP.x * scale),
          maxWidth: "none",
        }}
      />
    </span>
  );
}

export function FullLogo({ height = 44 }: { height?: number }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span
        className="flex shrink-0 items-center justify-center rounded-xl bg-black"
        style={{ height, width: height, padding: height * 0.22 }}
      >
        <IconMark height={height * 0.56} />
      </span>
      <span className="text-base font-bold tracking-tight text-[#1a1206]">
        Cardápio <span className="text-bg-deep">Alto</span>
      </span>
    </span>
  );
}
