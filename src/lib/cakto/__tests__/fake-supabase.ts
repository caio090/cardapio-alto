// Minimal in-memory stand-in for the slice of the Supabase JS query builder
// that src/lib/cakto/process.ts actually uses (from/upsert/insert/update/
// select/eq/maybeSingle/single). Not a general-purpose mock — just enough
// surface to exercise the real upsert/idempotency logic without a live DB.

type Row = Record<string, unknown>;

const UNIQUE_MATCHERS: Record<string, (a: Row, b: Row) => boolean> = {
  orders: (a, b) => a.provider === b.provider && a.cakto_checkout_id === b.cakto_checkout_id,
  order_items: (a, b) => a.cakto_item_id === b.cakto_item_id,
};

export function createFakeSupabase() {
  const tables: Record<string, Row[]> = {
    orders: [],
    order_items: [],
    products: [],
    cakto_events: [],
  };

  let idCounter = 0;
  const nextId = () => `fake-${++idCounter}`;

  function from(table: string) {
    return {
      upsert(row: Row) {
        const matcher = UNIQUE_MATCHERS[table];
        const existing = matcher ? tables[table].find((r) => matcher(r, row)) : undefined;
        let saved: Row;
        if (existing) {
          Object.assign(existing, row);
          saved = existing;
        } else {
          saved = { id: nextId(), ...row };
          tables[table].push(saved);
        }

        const result = { data: saved, error: null as null };
        return {
          select: () => ({
            single: async () => result,
          }),
          // order_items is upserted without a trailing .select().single() —
          // the returned object must be directly awaitable too.
          then: (resolve: (v: typeof result) => void) => resolve(result),
        };
      },
      insert(row: Row) {
        const saved = { id: nextId(), ...row };
        tables[table].push(saved);
        const result = { data: saved, error: null as null };
        return {
          select: () => ({
            single: async () => result,
          }),
        };
      },
      update(patch: Row) {
        return {
          eq: async (col: string, val: unknown) => {
            const row = tables[table].find((r) => r[col] === val);
            if (row) Object.assign(row, patch);
            return { data: row ?? null, error: null };
          },
        };
      },
      select() {
        return {
          eq: (col: string, val: unknown) => ({
            maybeSingle: async () => {
              const found = tables[table].find((r) => r[col] === val);
              return { data: found ?? null, error: null };
            },
          }),
        };
      },
    };
  }

  return { from, tables } as unknown as import("@supabase/supabase-js").SupabaseClient & {
    tables: typeof tables;
  };
}
