// Isolated on purpose — every monetary field from Cakto goes through this
// one function, so the unit assumption below only ever needs to change in
// one place.
//
// CONFIRMED (Cakto's own docs): order amounts are decimal reais, not
// integer cents — e.g. baseAmount: "33.00", amount: "34.35", fees: "1.52".
// The docs show these as strings; the webhook's live payload has shown
// them as bare numbers too (e.g. `fees: 4.5`, which is only sensible as
// R$4,50 — Brazilian currency has no sub-centavo unit, so this couldn't be
// cents either way). Accepts both shapes rather than assuming one.
export function reaisToCents(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  // `Number("")` is 0, not NaN — an empty/whitespace string means "no
  // value", not "R$0,00", so it's rejected before the numeric coercion.
  if (typeof value === "string" && value.trim() === "") return null;

  const numeric = typeof value === "string" ? Number(value) : value;
  if (typeof numeric !== "number" || !Number.isFinite(numeric)) return null;

  return Math.round(numeric * 100);
}
