import "server-only";
import path from "node:path";
import { createAdminClient } from "@/lib/supabase/admin";
import { createLocalStore } from "./local";
import { createSupabaseStore } from "./supabase";
import type { CentralStore } from "./types";

export type { CentralStore } from "./types";

let cached: CentralStore | null = null;

// Escolha do armazenamento:
//   CENTRAL_STORAGE=supabase → Supabase (produção)
//   CENTRAL_STORAGE=local    → pasta local (padrão fora de produção)
// Sem a variável: produção usa Supabase; desenvolvimento usa local. Isso
// mantém dados de teste fora do banco real por padrão.
export function getStore(): CentralStore {
  if (cached) return cached;

  const mode =
    process.env.CENTRAL_STORAGE ?? (process.env.NODE_ENV === "production" ? "supabase" : "local");

  if (mode === "supabase") {
    cached = createSupabaseStore(createAdminClient());
  } else {
    const dir = process.env.CENTRAL_DATA_DIR || path.join(process.cwd(), ".central-data");
    cached = createLocalStore(dir, process.env.NODE_ENV === "production" ? "produção" : "desenvolvimento");
  }
  return cached;
}
