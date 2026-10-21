"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ImagePlus, Link2, Loader2, Star, X } from "lucide-react";

type Item = { key: string; url?: string; preview: string; status: "done" | "uploading" | "error"; error?: string };

const MAX_SIDE = 1800;

async function shrink(file: File): Promise<Blob> {
  if (file.type === "image/gif") return file;
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size < 1.5 * 1024 * 1024) return file;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const type = file.type === "image/png" ? "image/webp" : "image/jpeg";
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.85));
    return blob && blob.size < file.size ? blob : file;
  } catch {
    return file;
  }
}

export function ImageManager({
  name,
  initial = [],
  max = 12,
  onBusyChange,
}: {
  name: string;
  initial?: string[];
  max?: number;
  onBusyChange?: (busy: boolean) => void;
}) {
  const [items, setItems] = useState<Item[]>(() => initial.map((url) => ({ key: url, url, preview: url, status: "done" })));
  const [dragging, setDragging] = useState(false);
  const [linkValue, setLinkValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const busy = items.some((i) => i.status === "uploading");
  useEffect(() => onBusyChange?.(busy), [busy, onBusyChange]);

  const update = (key: string, patch: Partial<Item>) => setItems((list) => list.map((i) => (i.key === key ? { ...i, ...patch } : i)));

  const addFiles = async (files: FileList | File[]) => {
    const room = max - items.filter((i) => i.status !== "error").length;
    const picked = Array.from(files).filter((f) => f.type.startsWith("image/")).slice(0, Math.max(room, 0));
    const queued = picked.map((file) => ({ file, key: crypto.randomUUID(), preview: URL.createObjectURL(file) }));
    setItems((list) => [...list, ...queued.map(({ key, preview }) => ({ key, preview, status: "uploading" as const }))]);

    for (const { file, key } of queued) {
      try {
        const body = new FormData();
        body.append("file", await shrink(file), file.name);
        const res = await fetch("/api/admin/upload", { method: "POST", body });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Սխալ");
        update(key, { url: data.url, status: "done" });
      } catch (err) {
        update(key, { status: "error", error: err instanceof Error ? err.message : "Սխալ" });
      }
    }
  };

  const addLink = () => {
    const url = linkValue.trim();
    if (!url.startsWith("https://") && !url.startsWith("/")) return;
    if (!items.some((i) => i.url === url)) setItems((list) => [...list, { key: url, url, preview: url, status: "done" as const }].slice(-max));
    setLinkValue("");
  };

  const move = (index: number, to: number) =>
    setItems((list) => {
      const next = [...list];
      const [item] = next.splice(index, 1);
      next.splice(to, 0, item);
      return next;
    });

  const remove = (key: string) => setItems((list) => list.filter((i) => i.key !== key));

  const value = JSON.stringify(items.filter((i) => i.status === "done" && i.url).map((i) => i.url));
  const full = items.filter((i) => i.status !== "error").length >= max;

  return (
    <div>
      <input type="hidden" name={name} value={value} />

      {items.length > 0 && (
        <ul className="mb-3 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
          {items.map((item, i) => (
            <li key={item.key} className="group relative aspect-square overflow-hidden rounded-md border border-stone-200 bg-stone-100 dark:border-steel-800 dark:bg-steel-900">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.preview} alt="" className={`h-full w-full object-cover ${item.status === "uploading" ? "opacity-50" : ""}`} />
              {item.status === "uploading" && <Loader2 className="absolute inset-0 m-auto h-6 w-6 animate-spin text-white drop-shadow" />}
              {item.status === "error" && (
                <span className="absolute inset-0 flex items-center bg-red-900/80 p-2 text-center text-[11px] leading-tight text-white">{item.error}</span>
              )}
              {i === 0 && item.status === "done" && max > 1 && (
                <span className="absolute left-1 top-1 rounded bg-blaze-400 px-1.5 py-0.5 text-[10px] font-semibold text-ink">Գլխավոր</span>
              )}
              <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/60 p-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                {max > 1 ? (
                  <span className="flex gap-0.5">
                    <button type="button" disabled={i === 0} onClick={() => move(i, i - 1)} className="rounded p-1 text-white hover:bg-white/20 disabled:opacity-30" aria-label="Ձախ"><ArrowLeft className="h-3.5 w-3.5" /></button>
                    <button type="button" disabled={i === 0} onClick={() => move(i, 0)} className="rounded p-1 text-white hover:bg-white/20 disabled:opacity-30" aria-label="Դարձնել գլխավոր"><Star className="h-3.5 w-3.5" /></button>
                    <button type="button" disabled={i === items.length - 1} onClick={() => move(i, i + 1)} className="rounded p-1 text-white hover:bg-white/20 disabled:opacity-30" aria-label="Աջ"><ArrowRight className="h-3.5 w-3.5" /></button>
                  </span>
                ) : <span />}
                <button type="button" onClick={() => remove(item.key)} className="rounded p-1 text-white hover:bg-red-600" aria-label="Հեռացնել"><X className="h-3.5 w-3.5" /></button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {!full && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
          onClick={() => inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed px-4 py-6 text-center text-sm transition-colors ${dragging ? "border-steel-600 bg-steel-50 dark:bg-steel-900" : "border-stone-300 hover:border-steel-500 dark:border-steel-800"}`}
        >
          <ImagePlus className="h-6 w-6 text-stone-400" />
          <span className="font-medium">Ընտրեք նկարներ կամ քաշեք այստեղ</span>
          <span className="text-xs text-stone-500">{max > 1 ? `Մինչև ${max} նկար, ` : ""}JPG, PNG, WEBP</span>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple={max > 1}
            hidden
            onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = ""; }}
          />
        </div>
      )}

      {!full && (
        <div className="mt-2 flex gap-2">
          <div className="relative flex-1">
            <Link2 className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
            <input
              value={linkValue}
              onChange={(e) => setLinkValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addLink(); } }}
              placeholder="կամ տեղադրեք նկարի հղումը (https://...)"
              className="input py-1.5 pl-8 text-xs"
            />
          </div>
          <button type="button" onClick={addLink} className="btn-ghost px-3 py-1.5 text-xs">Ավելացնել</button>
        </div>
      )}
    </div>
  );
}
