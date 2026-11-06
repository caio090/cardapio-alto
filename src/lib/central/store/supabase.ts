import type { SupabaseClient } from "@supabase/supabase-js";
import type { BaseDoc, CentralStore, CollectionName } from "./types";

export const CENTRAL_BUCKET = "central-files";

// Produção: public.central_docs (ver supabase/migrations/..._central_produtos.sql)
// + bucket privado. Usa o cliente service-role, que só existe no servidor.
export function createSupabaseStore(client: SupabaseClient): CentralStore {
  function fail(action: string, error: { message?: string } | null): never {
    throw new Error(`Supabase (${action}): ${error?.message ?? "erro desconhecido"}`);
  }

  return {
    info() {
      let host = "projeto Supabase";
      try {
        host = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").host || host;
      } catch {
        /* sem URL válida */
      }
      return {
        kind: "supabase",
        label: "Supabase",
        location: `${host} · tabela central_docs · bucket ${CENTRAL_BUCKET}`,
        environment: process.env.NODE_ENV === "production" ? "produção" : "desenvolvimento",
      };
    },

    async list<T extends BaseDoc>(collection: CollectionName, filter?: { productId?: string }) {
      let query = client.from("central_docs").select("data").eq("collection", collection);
      if (filter?.productId) query = query.eq("product_id", filter.productId);
      const { data, error } = await query.order("created_at", { ascending: true });
      if (error) fail("listar", error);
      return (data ?? []).map((row) => row.data as T);
    },

    async get<T extends BaseDoc>(collection: CollectionName, id: string) {
      const { data, error } = await client
        .from("central_docs")
        .select("data")
        .eq("collection", collection)
        .eq("id", id)
        .maybeSingle();
      if (error) fail("ler", error);
      return (data?.data as T) ?? null;
    },

    async put<T extends BaseDoc>(collection: CollectionName, doc: T) {
      const { error } = await client.from("central_docs").upsert(
        {
          collection,
          id: doc.id,
          product_id: doc.productId ?? null,
          data: doc,
          created_at: doc.createdAt,
          updated_at: doc.updatedAt,
        },
        { onConflict: "collection,id" }
      );
      if (error) fail("salvar", error);
      return doc;
    },

    async remove(collection: CollectionName, id: string) {
      const { error } = await client.from("central_docs").delete().eq("collection", collection).eq("id", id);
      if (error) fail("remover", error);
    },

    async putFile(key: string, bytes: Uint8Array, contentType: string) {
      const { error } = await client.storage
        .from(CENTRAL_BUCKET)
        .upload(key, bytes, { contentType, upsert: true });
      if (error) fail("enviar arquivo", error);
    },

    async getFile(key: string) {
      const { data, error } = await client.storage.from(CENTRAL_BUCKET).download(key);
      if (error || !data) return null;
      return new Uint8Array(await data.arrayBuffer());
    },

    async removeFile(key: string) {
      await client.storage.from(CENTRAL_BUCKET).remove([key]);
    },
  };
}
