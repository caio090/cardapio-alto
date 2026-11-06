import { promises as fs } from "node:fs";
import path from "node:path";
import type { BaseDoc, CentralStore, CollectionName, StoreInfo } from "./types";

const SAFE_ID = /^[a-zA-Z0-9_-]{1,80}$/;
const SAFE_KEY = /^[a-zA-Z0-9_.\/-]{1,200}$/;

function assertId(id: string) {
  if (!SAFE_ID.test(id)) throw new Error("Identificador inválido.");
}

function assertKey(key: string) {
  if (!SAFE_KEY.test(key) || key.includes("..")) throw new Error("Caminho de arquivo inválido.");
}

// Armazenamento em disco: um arquivo JSON por documento. Gravação atômica
// (escreve em .tmp e renomeia) para que uma queda no meio não corrompa
// o documento.
export function createLocalStore(rootDir: string, environment: StoreInfo["environment"]): CentralStore {
  const docsDir = (c: CollectionName) => path.join(rootDir, "docs", c);
  const filesDir = path.join(rootDir, "files");

  async function writeAtomic(target: string, data: string | Uint8Array) {
    await fs.mkdir(path.dirname(target), { recursive: true });
    const tmp = `${target}.${process.pid}.${Date.now()}.tmp`;
    await fs.writeFile(tmp, data);
    await fs.rename(tmp, target);
  }

  return {
    info() {
      return {
        kind: "local",
        label: "Arquivos locais",
        location: path.relative(process.cwd(), rootDir) || rootDir,
        environment,
        warning:
          process.env.VERCEL === "1"
            ? "Armazenamento local em servidor sem disco persistente: os dados podem ser perdidos. Configure o Supabase."
            : undefined,
      };
    },

    async list<T extends BaseDoc>(collection: CollectionName, filter?: { productId?: string }) {
      const dir = docsDir(collection);
      let names: string[];
      try {
        names = await fs.readdir(dir);
      } catch {
        return [];
      }
      const docs: T[] = [];
      for (const name of names) {
        if (!name.endsWith(".json")) continue;
        try {
          const doc = JSON.parse(await fs.readFile(path.join(dir, name), "utf8")) as T;
          if (filter?.productId && doc.productId !== filter.productId) continue;
          docs.push(doc);
        } catch {
          // documento ilegível é ignorado na listagem, não derruba a tela
        }
      }
      return docs.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    },

    async get<T extends BaseDoc>(collection: CollectionName, id: string) {
      assertId(id);
      try {
        return JSON.parse(await fs.readFile(path.join(docsDir(collection), `${id}.json`), "utf8")) as T;
      } catch {
        return null;
      }
    },

    async put<T extends BaseDoc>(collection: CollectionName, doc: T) {
      assertId(doc.id);
      await writeAtomic(path.join(docsDir(collection), `${doc.id}.json`), JSON.stringify(doc, null, 2));
      return doc;
    },

    async remove(collection: CollectionName, id: string) {
      assertId(id);
      await fs.rm(path.join(docsDir(collection), `${id}.json`), { force: true });
    },

    async putFile(key: string, bytes: Uint8Array) {
      assertKey(key);
      await writeAtomic(path.join(filesDir, key), bytes);
    },

    async getFile(key: string) {
      assertKey(key);
      try {
        return new Uint8Array(await fs.readFile(path.join(filesDir, key)));
      } catch {
        return null;
      }
    },

    async removeFile(key: string) {
      assertKey(key);
      await fs.rm(path.join(filesDir, key), { force: true });
    },
  };
}
