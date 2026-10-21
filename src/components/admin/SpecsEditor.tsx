"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

const suggestions = ["Կալիբր", "Փողի երկարություն", "Քաշը", "Արտադրող", "Երկիր", "Նյութ", "Չափսեր", "Գույն", "Խոշորացում"];

export function SpecsEditor({ name, initial = [] }: { name: string; initial?: [string, string][] }) {
  const [rows, setRows] = useState<{ id: number; key: string; value: string }[]>(() =>
    (initial.length ? initial : [["", ""]]).map(([key, value], id) => ({ id, key, value })),
  );
  const [nextId, setNextId] = useState(rows.length);

  const add = (key = "") => {
    setRows((r) => [...r.filter((x) => x.key || x.value), { id: nextId, key, value: "" }]);
    setNextId((n) => n + 1);
  };
  const set = (id: number, patch: Partial<{ key: string; value: string }>) =>
    setRows((r) => r.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  const used = new Set(rows.map((r) => r.key.trim()));

  return (
    <div>
      <input type="hidden" name={name} value={JSON.stringify(rows.map((r) => [r.key, r.value]))} />
      <div className="space-y-2">
        {rows.map((row) => (
          <div key={row.id} className="flex gap-2">
            <input value={row.key} onChange={(e) => set(row.id, { key: e.target.value })} placeholder="Անուն (օր.՝ Կալիբր)" aria-label="Բնութագրի անուն" className="input w-2/5" />
            <input value={row.value} onChange={(e) => set(row.id, { value: e.target.value })} placeholder="Արժեք (օր.՝ 12/76)" aria-label="Բնութագրի արժեք" className="input flex-1" />
            <button type="button" onClick={() => setRows((r) => r.filter((x) => x.id !== row.id))} className="rounded-md px-2 text-stone-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40" aria-label="Հեռացնել տողը">
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <button type="button" onClick={() => add()} className="btn-ghost px-3 py-1.5 text-xs"><Plus className="h-3.5 w-3.5" />Տող</button>
        {suggestions.filter((s) => !used.has(s)).slice(0, 6).map((s) => (
          <button key={s} type="button" onClick={() => add(s)} className="rounded-full border border-stone-200 px-2.5 py-1 text-xs text-stone-600 hover:border-steel-500 hover:text-steel-700 dark:border-steel-800 dark:text-stone-400">
            + {s}
          </button>
        ))}
      </div>
    </div>
  );
}
