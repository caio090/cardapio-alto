import "server-only";
import { getStore } from "../store";
import type { BaseDoc } from "../store/types";

export type IntegrationKey = "armazenamento" | "google_drive" | "cakto_api" | "cakto_webhook" | "meta" | "gerador_imagem";

export type IntegrationStatus =
  | "desconectado"
  | "credencial_presente"
  | "autenticado"
  | "testado"
  | "erro"
  | "permissao_insuficiente"
  | "nao_configurado";

export const STATUS_LABEL: Record<IntegrationStatus, { label: string; tone: string }> = {
  desconectado: { label: "Desconectado", tone: "gray" },
  nao_configurado: { label: "Nenhum provedor configurado", tone: "gray" },
  credencial_presente: { label: "Credencial presente — não testada", tone: "amber" },
  autenticado: { label: "Autenticado", tone: "blue" },
  testado: { label: "Testado", tone: "green" },
  erro: { label: "Erro", tone: "red" },
  permissao_insuficiente: { label: "Permissão insuficiente", tone: "orange" },
};

export interface TestResult {
  ok: boolean;
  status: IntegrationStatus;
  at: string;
  message: string;
  detail?: Record<string, unknown>;
}

export interface IntegrationDoc extends BaseDoc {
  key: IntegrationKey;
  lastTest?: TestResult;
  data?: Record<string, unknown>;
}

export async function getIntegration(key: IntegrationKey): Promise<IntegrationDoc> {
  const doc = await getStore().get<IntegrationDoc>("integrations", key);
  const t = new Date().toISOString();
  return doc ?? { id: key, key, productId: null, createdAt: t, updatedAt: t };
}

export async function saveIntegration(doc: IntegrationDoc) {
  doc.updatedAt = new Date().toISOString();
  return getStore().put("integrations", doc);
}

export async function recordTest(key: IntegrationKey, result: Omit<TestResult, "at">) {
  const doc = await getIntegration(key);
  doc.lastTest = { ...result, at: new Date().toISOString() };
  await saveIntegration(doc);
  return doc.lastTest;
}

/** Segredos ficam só no servidor (coleção "secrets"), nunca na tela, PDF ou log. */
export async function getSecret(id: string): Promise<Record<string, string> | null> {
  const doc = await getStore().get<BaseDoc & { values: Record<string, string> }>("secrets", id);
  return doc?.values ?? null;
}

export async function setSecret(id: string, values: Record<string, string>) {
  const t = new Date().toISOString();
  await getStore().put("secrets", { id, productId: null, createdAt: t, updatedAt: t, values });
}

export async function deleteSecret(id: string) {
  await getStore().remove("secrets", id);
}

export function errorMessage(e: unknown) {
  return e instanceof Error ? e.message : String(e);
}

/** Erro HTTP de API externa, sem ecoar credenciais. */
export class ApiError extends Error {
  constructor(
    public service: string,
    public httpStatus: number,
    message: string
  ) {
    super(`${service}: HTTP ${httpStatus} — ${message}`);
  }
}

export async function readApiError(service: string, res: Response): Promise<ApiError> {
  let detail = res.statusText;
  try {
    const body = (await res.json()) as { error?: { message?: string } | string; error_description?: string; detail?: string };
    detail =
      (typeof body.error === "object" ? body.error?.message : body.error_description ?? body.error) ?? body.detail ?? detail;
  } catch {
    /* corpo não-JSON */
  }
  return new ApiError(service, res.status, String(detail).slice(0, 300));
}
