import "server-only";
import type { LinkCheck } from "./model";

// Verifica se um link abre. Usa HEAD e, se o servidor não aceitar, GET.
// Erro de rede é registrado como "erro" (pode ser bloqueio do ambiente),
// diferente de "quebrado" (o site respondeu 4xx/5xx).
export async function checkUrl(url: string): Promise<LinkCheck> {
  const at = new Date().toISOString();
  const attempt = async (method: "HEAD" | "GET") => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    try {
      return await fetch(url, { method, redirect: "follow", signal: ctrl.signal, headers: { "User-Agent": "CentralDeProdutos/1.0 (verificador de links)" } });
    } finally {
      clearTimeout(timer);
    }
  };
  try {
    let res = await attempt("HEAD");
    if (res.status === 405 || res.status === 403 || res.status === 501) res = await attempt("GET");
    if (res.ok) return { status: "ok", httpStatus: res.status, message: `Abriu (HTTP ${res.status}).`, checkedAt: at };
    return { status: "quebrado", httpStatus: res.status, message: `O site respondeu HTTP ${res.status}.`, checkedAt: at };
  } catch (e) {
    const reason = e instanceof Error ? (e.name === "AbortError" ? "tempo esgotado (8 s)" : e.message) : String(e);
    return { status: "erro", message: `Não foi possível verificar: ${reason}. Pode ser bloqueio de rede deste servidor.`, checkedAt: at };
  }
}
