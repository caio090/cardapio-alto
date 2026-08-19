import { describe, expect, it } from "vitest";
import { reaisToCents } from "../money";

describe("reaisToCents", () => {
  it("converts whole reais to cents", () => {
    expect(reaisToCents(100)).toBe(10000);
  });

  it("converts fractional reais (fees) to cents", () => {
    expect(reaisToCents(4.5)).toBe(450);
  });

  it("rounds instead of truncating on floating point noise", () => {
    expect(reaisToCents(0.1 + 0.2)).toBe(30);
  });

  it("returns null for null/undefined", () => {
    expect(reaisToCents(null)).toBeNull();
    expect(reaisToCents(undefined)).toBeNull();
  });

  it("returns null for non-finite input", () => {
    expect(reaisToCents(NaN)).toBeNull();
    expect(reaisToCents(Infinity)).toBeNull();
  });

  it("handles zero", () => {
    expect(reaisToCents(0)).toBe(0);
  });

  // Cakto's official docs show order amounts as decimal-string reais.
  it("converts decimal-string reais from the official docs example", () => {
    expect(reaisToCents("33.00")).toBe(3300);
    expect(reaisToCents("34.35")).toBe(3435);
    expect(reaisToCents("1.52")).toBe(152);
  });

  it("converts the task's worked examples (number and string forms)", () => {
    expect(reaisToCents(90)).toBe(9000);
    expect(reaisToCents(4.5)).toBe(450);
    expect(reaisToCents(34.35)).toBe(3435);
  });

  it("returns null for a non-numeric string instead of NaN cents", () => {
    expect(reaisToCents("not-a-number")).toBeNull();
    expect(reaisToCents("")).toBeNull();
  });
});
