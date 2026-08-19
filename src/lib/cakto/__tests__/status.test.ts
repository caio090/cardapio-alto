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
