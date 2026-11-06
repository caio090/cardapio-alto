import "server-only";
import { getIntegration, getSecret, readApiError, saveIntegration, setSecret } from "./state";

// Google Drive pela API oficial (OAuth 2.0 + Drive API v3).
// Escopo mínimo: drive.file — a aplicação só enxerga arquivos e pastas que
// ela mesma criou ou que o usuário abriu com ela. Nenhum arquivo é
// compartilhado publicamente por esta integração.
export const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.file";
const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const API = "https://www.googleapis.com/drive/v3";
const UPLOAD = "https://www.googleapis.com/upload/drive/v3";
const SECRET_ID = "google_drive_oauth";

export function driveConfig() {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  return clientId && clientSecret ? { clientId, clientSecret } : null;
}

export function redirectUri(origin: string) {
  return `${process.env.CENTRAL_PUBLIC_URL || origin}/admin/central/integracoes/google/callback`;
}

export function buildAuthUrl(origin: string, state: string) {
  const cfg = driveConfig();
  if (!cfg) throw new Error("GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET não configurados no servidor.");
  const params = new URLSearchParams({
    client_id: cfg.clientId,
    redirect_uri: redirectUri(origin),
    response_type: "code",
    scope: DRIVE_SCOPE,
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "false",
    state,
  });
  return `${AUTH_URL}?${params}`;
}

export async function exchangeCode(origin: string, code: string) {
  const cfg = driveConfig();
  if (!cfg) throw new Error("Credenciais OAuth do Google ausentes.");
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: cfg.clientId,
      client_secret: cfg.clientSecret,
      redirect_uri: redirectUri(origin),
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) throw await readApiError("Google OAuth", res);
  const json = (await res.json()) as { refresh_token?: string; scope?: string };
  if (!json.refresh_token) throw new Error("O Google não devolveu refresh_token. Remova o acesso do app na conta Google e conecte de novo.");
  await setSecret(SECRET_ID, { refresh_token: json.refresh_token, scope: json.scope ?? "" });
  return json.scope ?? "";
}

export async function hasDriveToken() {
  return Boolean((await getSecret(SECRET_ID))?.refresh_token);
}

let cachedToken: { value: string; exp: number } | null = null;

async function accessToken(): Promise<string> {
  if (cachedToken && cachedToken.exp > Date.now() + 60_000) return cachedToken.value;
  const cfg = driveConfig();
  const secret = await getSecret(SECRET_ID);
  if (!cfg || !secret?.refresh_token) throw new Error("Google Drive não conectado.");
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: cfg.clientId,
      client_secret: cfg.clientSecret,
      refresh_token: secret.refresh_token,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) throw await readApiError("Google OAuth", res);
  const json = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = { value: json.access_token, exp: Date.now() + json.expires_in * 1000 };
  return json.access_token;
}

async function drive(path: string, init: RequestInit = {}, base = API) {
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${await accessToken()}`, ...(init.headers ?? {}) },
  });
  if (!res.ok) throw await readApiError("Google Drive", res);
  return res;
}

export async function driveWhoAmI() {
  const res = await drive("/about?fields=user(displayName,emailAddress)");
  return ((await res.json()) as { user: { displayName: string; emailAddress: string } }).user;
}

interface DriveFile {
  id: string;
  name: string;
  webViewLink?: string;
  trashed?: boolean;
  owners?: { emailAddress?: string; displayName?: string }[];
  permissions?: { type: string; role: string; emailAddress?: string }[];
}

const FILE_FIELDS = "id,name,webViewLink,trashed,owners(emailAddress,displayName),permissions(type,role,emailAddress)";

export function describePermissions(f: DriveFile): string {
  const perms = f.permissions ?? [];
  if (perms.some((p) => p.type === "anyone")) return "Público (qualquer pessoa com o link)";
  if (perms.some((p) => p.type === "domain")) return "Compartilhado com o domínio";
  const others = perms.filter((p) => p.role !== "owner");
  return others.length ? `Compartilhado com ${others.length} pessoa(s)` : "Privado (somente o dono)";
}

async function findByAppProperty(key: string, value: string, mimeType?: string): Promise<DriveFile | null> {
  const q = [`appProperties has { key='${key}' and value='${value}' }`, "trashed=false", mimeType ? `mimeType='${mimeType}'` : ""]
    .filter(Boolean)
    .join(" and ");
  const res = await drive(`/files?q=${encodeURIComponent(q)}&fields=files(${FILE_FIELDS})&pageSize=1`);
  return ((await res.json()) as { files: DriveFile[] }).files[0] ?? null;
}

async function getFileMeta(id: string): Promise<DriveFile | null> {
  try {
    const res = await drive(`/files/${encodeURIComponent(id)}?fields=${FILE_FIELDS}`);
    const f = (await res.json()) as DriveFile;
    return f.trashed ? null : f;
  } catch {
    return null;
  }
}

const FOLDER = "application/vnd.google-apps.folder";

async function createFolder(name: string, parent: string | null, props: Record<string, string>) {
  const res = await drive(`/files?fields=${FILE_FIELDS}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, mimeType: FOLDER, parents: parent ? [parent] : undefined, appProperties: props }),
  });
  return (await res.json()) as DriveFile;
}

/** Pasta raiz "Central de Produtos" + uma pasta por produto. Reutiliza se já existir. */
export async function ensureProductFolder(product: { id: string; name: string; drive: { folderId?: string } }) {
  if (product.drive.folderId) {
    const existing = await getFileMeta(product.drive.folderId);
    if (existing) return existing;
  }
  const found = await findByAppProperty("centralProductId", product.id, FOLDER);
  if (found) return found;

  const integ = await getIntegration("google_drive");
  let rootId = (integ.data?.rootFolderId as string | undefined) ?? null;
  if (rootId && !(await getFileMeta(rootId))) rootId = null;
  if (!rootId) {
    const root = (await findByAppProperty("centralRoot", "1", FOLDER)) ?? (await createFolder("Central de Produtos", null, { centralRoot: "1" }));
    rootId = root.id;
    integ.data = { ...(integ.data ?? {}), rootFolderId: rootId };
    await saveIntegration(integ);
  }
  return createFolder(product.name, rootId, { centralProductId: product.id });
}

/**
 * Envia (ou atualiza) um arquivo na pasta do produto. Se o arquivo já foi
 * enviado antes (mesmo centralFileId), atualiza o conteúdo do MESMO arquivo
 * no Drive em vez de criar uma cópia — o Drive guarda as revisões.
 */
export async function uploadToDrive(input: {
  folderId: string;
  centralFileId: string;
  existingDriveId?: string;
  name: string;
  contentType: string;
  bytes: Uint8Array;
}) {
  let targetId = input.existingDriveId && (await getFileMeta(input.existingDriveId)) ? input.existingDriveId : undefined;
  if (!targetId) targetId = (await findByAppProperty("centralFileId", input.centralFileId))?.id;

  const boundary = `central${crypto.randomUUID()}`;
  const meta = targetId
    ? { name: input.name }
    : { name: input.name, parents: [input.folderId], appProperties: { centralFileId: input.centralFileId } };
  const head = new TextEncoder().encode(
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(meta)}\r\n--${boundary}\r\nContent-Type: ${input.contentType}\r\n\r\n`
  );
  const tail = new TextEncoder().encode(`\r\n--${boundary}--`);
  const body = new Uint8Array(head.length + input.bytes.length + tail.length);
  body.set(head, 0);
  body.set(input.bytes, head.length);
  body.set(tail, head.length + input.bytes.length);

  const path = targetId
    ? `/files/${encodeURIComponent(targetId)}?uploadType=multipart&fields=${FILE_FIELDS}`
    : `/files?uploadType=multipart&fields=${FILE_FIELDS}`;
  const res = await drive(
    path,
    { method: targetId ? "PATCH" : "POST", headers: { "Content-Type": `multipart/related; boundary=${boundary}` }, body },
    UPLOAD
  );
  const file = (await res.json()) as DriveFile;
  return { file, updatedExisting: Boolean(targetId) };
}
