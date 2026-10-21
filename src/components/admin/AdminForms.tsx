"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { ArrowDown, ArrowUp, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import {
  deleteCategoryAction,
  deleteProductAction,
  moveCategoryAction,
  saveCategoryAction,
  saveProductAction,
  type ActionResult,
} from "@/lib/actions/admin-actions";
import { ImageManager } from "./ImageManager";
import { SpecsEditor } from "./SpecsEditor";
import { keepValuesSubmit } from "./useKeepValuesSubmit";

function Notice({ state }: { state: ActionResult }) {
  if (!state) return null;
  return (
    <p className={`rounded-md px-3 py-2 text-sm ${state.error ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300" : "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"}`}>
      {state.error ?? state.ok}
    </p>
  );
}


type Cat = { id: string; name: string; slug: string; image: string | null; parentId: string | null };

export function CategoryForm({ parents, editing }: { parents: Cat[]; editing?: Cat }) {
  const [state, action, pending] = useActionState(saveCategoryAction, null);
  const [busy, setBusy] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok && !editing) {
      formRef.current?.reset();
      setResetKey((k) => k + 1);
    }
  }, [state, editing]);

  return (
    <form ref={formRef} onSubmit={keepValuesSubmit(action)} className="grid gap-4 sm:grid-cols-2">
      {editing && <input type="hidden" name="id" value={editing.id} />}
      <div className="space-y-4">
        <div>
          <label className="label" htmlFor="cat-name">Անվանում</label>
          <input id="cat-name" name="name" required defaultValue={editing?.name} placeholder="օր.՝ Նշանոցներ" className="input" />
        </div>
        <div>
          <label className="label" htmlFor="cat-parent">Մայր բաժին</label>
          <select id="cat-parent" name="parentId" defaultValue={editing?.parentId ?? ""} className="input">
            <option value="">— Գլխավոր բաժին —</option>
            {parents.filter((p) => p.id !== editing?.id).map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <details className="text-xs text-stone-500">
          <summary className="cursor-pointer">Լրացուցիչ՝ URL-ի անուն (slug)</summary>
          <input name="slug" defaultValue={editing?.slug} placeholder="Ինքնաբերաբար կստեղծվի անվանումից" className="input mt-2 font-mono" />
        </details>
      </div>
      <div>
        <span className="label">Նկար (երևում է գլխավոր էջում՝ գլխավոր բաժինների համար)</span>
        <ImageManager key={resetKey} name="image" max={1} initial={editing?.image ? [editing.image] : []} onBusyChange={setBusy} />
      </div>
      <div className="flex gap-2 sm:col-span-2">
        <button disabled={pending || busy} className="btn-primary py-2">{busy ? "Նկարը բեռնվում է…" : editing ? "Պահպանել" : "Ավելացնել"}</button>
        {editing && <Link href="/admin/dashboard?tab=categories" className="btn-ghost py-2">Չեղարկել</Link>}
      </div>
      <div className="sm:col-span-2"><Notice state={state} /></div>
    </form>
  );
}

export function CategoryRowActions({ id, isFirst, isLast }: { id: string; isFirst: boolean; isLast: boolean }) {
  const [pending, start] = useTransition();
  const [state, remove] = useActionState(async () => deleteCategoryAction(id), null);

  return (
    <div className="flex items-center gap-1">
      {state?.error && <span className="mr-2 max-w-56 text-right text-xs text-red-600">{state.error}</span>}
      <button disabled={isFirst || pending} onClick={() => start(() => moveCategoryAction(id, "up"))} className="rounded p-1.5 text-stone-500 hover:bg-stone-100 disabled:opacity-30 dark:hover:bg-steel-900" aria-label="Վեր">
        <ArrowUp className="h-4 w-4" />
      </button>
      <button disabled={isLast || pending} onClick={() => start(() => moveCategoryAction(id, "down"))} className="rounded p-1.5 text-stone-500 hover:bg-stone-100 disabled:opacity-30 dark:hover:bg-steel-900" aria-label="Վար">
        <ArrowDown className="h-4 w-4" />
      </button>
      <Link href={`/admin/dashboard?tab=categories&edit=${id}`} className="rounded p-1.5 text-stone-500 hover:bg-stone-100 dark:hover:bg-steel-900" aria-label="Խմբագրել">
        <Pencil className="h-4 w-4" />
      </Link>
      <form action={remove} onSubmit={(e) => { if (!confirm("Ջնջե՞լ բաժինը")) e.preventDefault(); }}>
        <button className="rounded p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40" aria-label="Ջնջել">
          <Trash2 className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}


type ProductFormValues = {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  price: number;
  oldPrice: number | null;
  images: string[];
  specs: [string, string][];
  inStock: boolean;
  isNew: boolean;
  requiresLicense: boolean;
};

type CategoryTree = { id: string; name: string; children: { id: string; name: string }[] }[];

const priceText = (n?: number | null) => (n == null ? "" : new Intl.NumberFormat("hy-AM", { maximumFractionDigits: 0 }).format(n));

export function ProductForm({ categories, editing }: { categories: CategoryTree; editing?: ProductFormValues }) {
  const [state, action, pending] = useActionState(saveProductAction, null);
  const [busy, setBusy] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok && !editing) {
      formRef.current?.reset();
      setResetKey((k) => k + 1);
    }
  }, [state, editing]);

  return (
    <form ref={formRef} onSubmit={keepValuesSubmit(action)} className="grid gap-4 md:grid-cols-6">
      {editing && <input type="hidden" name="id" value={editing.id} />}
      <div className="md:col-span-4">
        <label className="label" htmlFor="p-title">Անվանում</label>
        <input id="p-title" name="title" required defaultValue={editing?.title} className="input" />
      </div>
      <div className="md:col-span-2">
        <label className="label" htmlFor="p-cat">Բաժին</label>
        <select id="p-cat" name="categoryId" required defaultValue={editing?.categoryId ?? ""} className="input">
          <option value="" disabled>Ընտրեք</option>
          {categories.map((parent) => (
            <optgroup key={parent.id} label={parent.name}>
              <option value={parent.id}>{parent.name} (ընդհանուր)</option>
              {parent.children.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </optgroup>
          ))}
        </select>
      </div>

      <div className="md:col-span-2">
        <label className="label" htmlFor="p-price">Գին (֏)</label>
        <input id="p-price" name="price" inputMode="numeric" required defaultValue={priceText(editing?.price)} placeholder="օր.՝ 360 000" className="input" />
      </div>
      <div className="md:col-span-2">
        <label className="label" htmlFor="p-old">Հին գին՝ զեղչի համար (֏)</label>
        <input id="p-old" name="oldPrice" inputMode="numeric" defaultValue={priceText(editing?.oldPrice)} placeholder="Դատարկ = առանց զեղչի" className="input" />
      </div>
      <div className="flex flex-wrap items-end gap-x-5 gap-y-2 pb-2 text-sm md:col-span-2">
        <label className="flex items-center gap-2"><input type="checkbox" name="inStock" defaultChecked={editing?.inStock ?? true} />Առկա է</label>
        <label className="flex items-center gap-2"><input type="checkbox" name="isNew" defaultChecked={editing?.isNew} />«Նոր» նշան</label>
        <label className="flex items-center gap-2"><input type="checkbox" name="requiresLicense" defaultChecked={editing?.requiresLicense} />Թույլտվությամբ</label>
      </div>

      <div className="md:col-span-6">
        <label className="label" htmlFor="p-desc">Նկարագրություն</label>
        <textarea id="p-desc" name="description" required rows={3} defaultValue={editing?.description} className="input" />
      </div>
      <div className="md:col-span-6">
        <span className="label">Նկարներ (առաջինը գլխավորն է)</span>
        <ImageManager key={resetKey} name="images" initial={editing?.images} onBusyChange={setBusy} />
      </div>
      <div className="md:col-span-6">
        <span className="label">Բնութագիր</span>
        <SpecsEditor key={resetKey} name="specs" initial={editing?.specs} />
      </div>

      <div className="flex gap-2 md:col-span-6">
        <button disabled={pending || busy} className="btn-primary">
          {busy ? "Նկարները բեռնվում են…" : pending ? "Պահպանվում է…" : editing ? "Պահպանել փոփոխությունները" : "Ավելացնել ապրանքը"}
        </button>
        {editing && <Link href="/admin/dashboard?tab=products" className="btn-ghost">Չեղարկել</Link>}
      </div>
      <div className="md:col-span-6"><Notice state={state} /></div>
    </form>
  );
}

export function DeleteProductButton({ id }: { id: string }) {
  return (
    <form action={deleteProductAction.bind(null, id)} onSubmit={(e) => { if (!confirm("Ջնջե՞լ ապրանքը")) e.preventDefault(); }}>
      <button className="rounded p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40" aria-label="Ջնջել">
        <Trash2 className="h-4 w-4" />
      </button>
    </form>
  );
}
