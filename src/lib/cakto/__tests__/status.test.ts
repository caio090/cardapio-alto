import { describe, expect, it } from "vitest";
import { mapCaktoEventToStatus } from "../status";

describe("mapCaktoEventToStatus", () => {
  it.each([
    ["purchase_approved", "paid"],
    ["pix_gerado", "pending"],
    ["PicPay gerado", "pending"],
    ["purchase_refused", "refused"],
    ["checkout_abandonment", "abandoned"],
    ["refund", "refunded"],
    ["chargeback", "chargeback"],
  ])("maps %s -> %s", (event, expected) => {
    expect(mapCaktoEventToStatus(event)).toBe(expected);
  });

  it("maps unknown events to 'unknown' instead of throwing", () => {
    expect(mapCaktoEventToStatus("something_cakto_adds_later")).toBe("unknown");
  });
});

import { resolveStatus } from "../status";

describe("resolveStatus (entregas fora de ordem)", () => {
  it.each([
    ["paid", "pending", "paid"],
    ["paid", "abandoned", "paid"],
    ["canceled", "paid", "paid"],
    ["paid", "refunded", "refunded"],
    ["refunded", "paid", "refunded"],
    ["refund_requested", "paid", "paid"],
    ["paid", "unknown", "paid"],
    [null, "pending", "pending"],
  ] as const)("%s + %s → %s", (current, incoming, expected) => {
    expect(resolveStatus(current, incoming)).toBe(expected);
  });
});
