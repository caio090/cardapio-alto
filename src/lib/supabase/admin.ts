import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Service-role client. Bypasses RLS — only ever import this from server-only
// code (route handlers, server actions). The `server-only` import makes any
// accidental client-component import a build error instead of a leak.
//
// Supabase's newer secret-key format (SUPABASE_SECRET_KEY) is preferred;
// SUPABASE_SERVICE_ROLE_KEY (the legacy JWT-based key) is kept as a
// fallback for compatibility. Both are server-only, never NEXT_PUBLIC.
export function createAdminClient() {
  const secretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secretKey) {
    throw new Error(
      "SUPABASE_SECRET_KEY (ou, em fallback, SUPABASE_SERVICE_ROLE_KEY) não configurada — copie em Supabase → Project Settings → API."
    );
  }

  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
