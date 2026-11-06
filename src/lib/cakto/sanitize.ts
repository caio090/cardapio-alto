// Strips fields we never want sitting in cakto_events.payload before it's
// logged for audit — the secret itself, documents, birth dates, and any
// card details (not in Cakto's documented payload today, stripped
// defensively in case a future event type adds one).

const REDACTED = "[redacted]";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function sanitizeCustomer(customer: unknown): unknown {
  if (!isPlainObject(customer)) return customer;
  const clone = { ...customer };
  if ("docNumber" in clone) clone.docNumber = REDACTED;
  if ("birthDate" in clone) clone.birthDate = REDACTED;
  return clone;
}

function sanitizeItem(item: unknown): unknown {
  if (!isPlainObject(item)) return item;
  const clone: Record<string, unknown> = { ...item };
  if ("customer" in clone) clone.customer = sanitizeCustomer(clone.customer);
  if ("card" in clone) clone.card = REDACTED;
  // Endereço não é necessário para auditar o evento.
  if ("address" in clone && clone.address) clone.address = REDACTED;
  if ("shipping" in clone && clone.shipping) clone.shipping = REDACTED;
  return clone;
}

export function sanitizeCaktoPayload(payload: unknown): unknown {
  if (!isPlainObject(payload)) return payload;

  const clone: Record<string, unknown> = { ...payload };
  clone.secret = REDACTED;

  if (Array.isArray(clone.data)) {
    clone.data = clone.data.map(sanitizeItem);
  } else if (isPlainObject(clone.data)) {
    // Webhook V1 entrega `data` como objeto — sanitizar do mesmo jeito.
    clone.data = sanitizeItem(clone.data);
  }

  return clone;
}
