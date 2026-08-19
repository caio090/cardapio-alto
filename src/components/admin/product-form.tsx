"use client";

import { useActionState } from "react";
import type { ProductFormState } from "@/app/admin/produtos/actions";
import type { Product } from "@/lib/products/types";

const initialState: ProductFormState = {};

function centsToReais(cents: number | null): string {
  if (cents === null) return "";
  return (cents / 100).toFixed(2).replace(".", ",");
}

const FIELD_CLASSES =
  "mt-1.5 w-full rounded-lg border border-black/15 bg-white px-3.5 py-2.5 text-base outline-none focus:border-black/40";
const LABEL_CLASSES = "block text-sm font-medium text-[#1a1a1a]/70";

export function ProductForm({
  action,
  product,
}: {
  action: (prevState: ProductFormState | undefined, formData: FormData) => Promise<ProductFormState>;
  product?: Product;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="mt-8 flex flex-col gap-6">
      <section className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={LABEL_CLASSES}>
            Nome *
          </label>
          <input
            id="name"
            name="name"
            defaultValue={product?.name}
            required
            className={FIELD_CLASSES}
          />
        </div>
        <div>
          <label htmlFor="slug" className={LABEL_CLASSES}>
            Slug *
          </label>
          <input
            id="slug"
            name="slug"
            defaultValue={product?.slug}
            required
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            placeholder="ex: novo-produto"
            className={FIELD_CLASSES}
          />
        </div>
      </section>

      <div>
        <label htmlFor="headline" className={LABEL_CLASSES}>
          Headline (hero)
        </label>
        <input
          id="headline"
          name="headline"
          defaultValue={product?.headline ?? ""}
          placeholder="Frase de impacto — se vazio, usa o Nome"
          className={FIELD_CLASSES}
        />
      </div>

      <div>
        <label htmlFor="shortDescription" className={LABEL_CLASSES}>
          Descrição curta (cards)
        </label>
        <textarea
          id="shortDescription"
          name="shortDescription"
          defaultValue={product?.shortDescription ?? ""}
          rows={2}
          className={FIELD_CLASSES}
        />
      </div>

      <div>
        <label htmlFor="offerDescription" className={LABEL_CLASSES}>
          Descrição da oferta (bloco de compra)
        </label>
        <textarea
          id="offerDescription"
          name="offerDescription"
          defaultValue={product?.offerDescription ?? ""}
          rows={3}
          className={FIELD_CLASSES}
        />
      </div>

      <div>
        <label htmlFor="description" className={LABEL_CLASSES}>
          Descrição (opcional, uso futuro)
        </label>
        <textarea
          id="description"
          name="description"
          defaultValue={product?.description ?? ""}
          rows={3}
          className={FIELD_CLASSES}
        />
      </div>

      <div>
        <label htmlFor="deliverables" className={LABEL_CLASSES}>
          Entregáveis (um por linha)
        </label>
        <textarea
          id="deliverables"
          name="deliverables"
          defaultValue={product?.deliverables?.join("\n") ?? ""}
          rows={6}
          placeholder={"Análise geral\nRelatório final"}
          className={FIELD_CLASSES}
        />
      </div>

      <section className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="priceReais" className={LABEL_CLASSES}>
            Preço (R$)
          </label>
          <input
            id="priceReais"
            name="priceReais"
            defaultValue={centsToReais(product?.priceCents ?? null)}
            placeholder="147,00"
            inputMode="decimal"
            className={FIELD_CLASSES}
          />
        </div>
        <div>
          <label htmlFor="compareAtPriceReais" className={LABEL_CLASSES}>
            Preço anterior (R$, opcional)
          </label>
          <input
            id="compareAtPriceReais"
            name="compareAtPriceReais"
            defaultValue={centsToReais(product?.compareAtPriceCents ?? null)}
            placeholder="197,00"
            inputMode="decimal"
            className={FIELD_CLASSES}
          />
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="checkoutProvider" className={LABEL_CLASSES}>
            Checkout provider
          </label>
          <input
            id="checkoutProvider"
            name="checkoutProvider"
            defaultValue={product?.checkoutProvider ?? ""}
            placeholder="cakto"
            className={FIELD_CLASSES}
          />
        </div>
        <div>
          <label htmlFor="checkoutUrl" className={LABEL_CLASSES}>
            Checkout URL
          </label>
          <input
            id="checkoutUrl"
            name="checkoutUrl"
            defaultValue={product?.checkoutUrl ?? ""}
            placeholder="https://pay.cakto.com.br/..."
            className={FIELD_CLASSES}
          />
          <p className="mt-1 text-xs text-[#1a1a1a]/45">
            Vazio = o botão de compra cai no WhatsApp automaticamente.
          </p>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="coverImageUrl" className={LABEL_CLASSES}>
            Imagem de capa (URL)
          </label>
          <input
            id="coverImageUrl"
            name="coverImageUrl"
            defaultValue={product?.coverImageUrl ?? ""}
            className={FIELD_CLASSES}
          />
        </div>
        <div>
          <label htmlFor="bannerImageUrl" className={LABEL_CLASSES}>
            Banner (URL)
          </label>
          <input
            id="bannerImageUrl"
            name="bannerImageUrl"
            defaultValue={product?.bannerImageUrl ?? ""}
            className={FIELD_CLASSES}
          />
        </div>
      </section>

      <div>
        <label htmlFor="whatsappMessage" className={LABEL_CLASSES}>
          Mensagem do WhatsApp (fallback quando não há checkout)
        </label>
        <input
          id="whatsappMessage"
          name="whatsappMessage"
          defaultValue={product?.whatsappMessage ?? ""}
          placeholder={`Olá! Quero saber mais sobre o pack ${product?.name ?? "..."}.`}
          className={FIELD_CLASSES}
        />
      </div>

      <section className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="seoTitle" className={LABEL_CLASSES}>
            SEO title
          </label>
          <input
            id="seoTitle"
            name="seoTitle"
            defaultValue={product?.seoTitle ?? ""}
            className={FIELD_CLASSES}
          />
        </div>
        <div>
          <label htmlFor="seoDescription" className={LABEL_CLASSES}>
            SEO description
          </label>
          <input
            id="seoDescription"
            name="seoDescription"
            defaultValue={product?.seoDescription ?? ""}
            className={FIELD_CLASSES}
          />
        </div>
      </section>

      <section className="grid gap-4 rounded-lg border border-black/10 bg-white p-4 sm:grid-cols-4">
        <div>
          <label htmlFor="status" className={LABEL_CLASSES}>
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={product?.status ?? "draft"}
            className={FIELD_CLASSES}
          >
            <option value="draft">Rascunho</option>
            <option value="published">Publicado</option>
            <option value="coming_soon">Em breve</option>
          </select>
        </div>
        <div>
          <label htmlFor="sortOrder" className={LABEL_CLASSES}>
            Ordem
          </label>
          <input
            id="sortOrder"
            name="sortOrder"
            type="number"
            defaultValue={product?.sortOrder ?? 0}
            className={FIELD_CLASSES}
          />
        </div>
        <label className="flex items-center gap-2 self-end pb-2.5 text-sm font-medium text-[#1a1a1a]/70">
          <input
            type="checkbox"
            name="isIndexable"
            defaultChecked={product?.isIndexable ?? false}
          />
          Indexável (Google)
        </label>
        <label className="flex items-center gap-2 self-end pb-2.5 text-sm font-medium text-[#1a1a1a]/70">
          <input type="checkbox" name="featured" defaultChecked={product?.featured ?? true} />
          Destacado na Home
        </label>
      </section>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-black/80 disabled:opacity-60"
        >
          {pending ? "Salvando…" : "Salvar"}
        </button>
      </div>
    </form>
  );
}
