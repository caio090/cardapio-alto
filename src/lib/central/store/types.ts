// Contrato de armazenamento da Central de Produtos.
//
// Tudo é guardado como "documentos" (JSON) agrupados por coleção, mais um
// armazenamento de arquivos binários. Duas implementações:
//   - local    → pasta .central-data/ (desenvolvimento; dados nunca vão ao git)
//   - supabase → tabela public.central_docs + bucket privado central-files
// O mesmo código de domínio roda nas duas, então o que é testado localmente
// é o mesmo comportamento de produção.

export type CollectionName =
  | "products"
  | "evidences"
  | "tasks"
  | "versions"
  | "files"
  | "creatives"
  | "experiments"
  | "cases"
  | "history"
  | "integrations"
  | "secrets";

export interface BaseDoc {
  id: string;
  productId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StoreInfo {
  kind: "local" | "supabase";
  label: string;
  /** Onde os dados ficam, sem revelar credenciais. */
  location: string;
  environment: "desenvolvimento" | "produção";
  warning?: string;
}

export interface CentralStore {
  info(): StoreInfo;
  list<T extends BaseDoc>(collection: CollectionName, filter?: { productId?: string }): Promise<T[]>;
  get<T extends BaseDoc>(collection: CollectionName, id: string): Promise<T | null>;
  put<T extends BaseDoc>(collection: CollectionName, doc: T): Promise<T>;
  remove(collection: CollectionName, id: string): Promise<void>;
  putFile(key: string, bytes: Uint8Array, contentType: string): Promise<void>;
  getFile(key: string): Promise<Uint8Array | null>;
  removeFile(key: string): Promise<void>;
}
