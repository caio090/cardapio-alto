import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Upload de arquivos na Central de Produtos (limite próprio de 15 MB
    // checado na action). Em hospedagem serverless o limite da plataforma
    // pode ser menor (ex.: ~4,5 MB na Vercel).
    serverActions: { bodySizeLimit: "16mb" },
  },
  // Fontes incorporadas nos PDFs são lidas do disco em tempo de execução.
  outputFileTracingIncludes: {
    "/admin/central/**": ["./src/lib/central/pdf/fonts/**", "./produtos/criador-png/guia/*.pdf"],
  },
};

export default nextConfig;
