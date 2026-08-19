import { describe, expect, it } from "vitest";
import { sanitizeCaktoPayload } from "../sanitize";

describe("sanitizeCaktoPayload", () => {
  const basePayload = {
    secret: "super-secret-value",
    event: "purchase_approved",
    data: [
      {
        id: "item-1",
        customer: {
          name: "Ana",
          email: "ana@example.com",
          phone: "5589999999999",
          docNumber: "12345678900",
          birthDate: "1990-01-01",
          docType: "cpf",
        },
        card: { lastDigits: "4242", holderName: "Ana Silva", brand: "visa" },
      },
    ],
  };

  it("redacts the top-level secret", () => {
    const sanitized = sanitizeCaktoPayload(basePayload) as typeof basePayload;
    expect(sanitized.secret).not.toBe("super-secret-value");
  });

  it("redacts docNumber and birthDate but keeps other customer fields", () => {
    const sanitized = sanitizeCaktoPayload(basePayload) as typeof basePayload;
    const customer = sanitized.data[0].customer;
    expect(customer.docNumber).not.toBe("12345678900");
    expect(customer.birthDate).not.toBe("1990-01-01");
    expect(customer.name).toBe("Ana");
    expect(customer.email).toBe("ana@example.com");
  });

  it("redacts card details entirely", () => {
    const sanitized = sanitizeCaktoPayload(basePayload) as { data: [{ card: unknown }] };
    const card = sanitized.data[0].card;
    expect(JSON.stringify(card)).not.toContain("4242");
    expect(JSON.stringify(card)).not.toContain("Ana Silva");
    expect(JSON.stringify(card)).not.toContain("visa");
  });

  it("does not mutate the original payload", () => {
    sanitizeCaktoPayload(basePayload);
    expect(basePayload.secret).toBe("super-secret-value");
    expect(basePayload.data[0].customer.docNumber).toBe("12345678900");
  });
});
