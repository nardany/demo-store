"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { FolderOpen, Loader2, Search, X } from "lucide-react";
import { formatPrice, site } from "@/lib/site";
import { isExternalImage } from "@/lib/products";

type Result = {
  total: number;
  products: { id: string; title: string; price: number; oldPrice: number | null; image: string; category: string }[];
  categories: { name: string; slug: string }[];
};


export function HeroSearch({ light = false }: { light?: boolean }) {
  const router = useRouter();
  const listId = useId();
  const boxRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResult(null);
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: controller.signal });
        setResult(await res.json());
        setActive(-1);
      } catch {
        /* aborted */
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 200);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const links = [
    ...(result?.categories.map((c) => `/catalog?category=${c.slug}`) ?? []),
    ...(result?.products.map((p) => `/products/${p.id}`) ?? []),
  ];
  const catalogHref = `/catalog?search=${encodeURIComponent(query.trim())}`;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setOpen(false);
    router.push(active >= 0 && links[active] ? links[active] : query.trim() ? catalogHref : "/catalog");
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(i + 1, links.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, -1));
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const showPanel = open && query.trim().length >= 2 && result !== null;
  let index = -1;

  return (
    <div ref={boxRef} className="relative mt-8 max-w-lg">
      <form onSubmit={submit} role="search" className={`flex overflow-hidden rounded-xl bg-white ring-blaze-400 focus-within:ring-2 ${light ? "border border-stone-200 shadow-sm dark:border-steel-700" : "shadow-lg"}`}>
        <label htmlFor="hero-search" className="sr-only">Որոնում</label>
        {loading ? <Loader2 className="my-auto ml-4 h-5 w-5 shrink-0 animate-spin text-stone-400" /> : <Search className="my-auto ml-4 h-5 w-5 shrink-0 text-stone-400" />}
        <input
          id="hero-search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          autoComplete="off"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={listId}
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          placeholder="Օր.՝ 12 կալիբր, հեռադիտակ, կոճ"
          className="w-full bg-transparent px-3 py-3.5 text-sm text-ink placeholder:text-stone-400 focus:outline-none"
        />
        {query && (
          <button type="button" onClick={() => setQuery("")} className="px-2 text-stone-400 hover:text-stone-700" aria-label="Մաքրել">
            <X className="h-4 w-4" />
          </button>
        )}
        <button className="bg-blaze-500 px-5 text-sm font-semibold text-ink hover:bg-blaze-400">Գտնել</button>
      </form>

      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        {site.quickSearches.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => router.push(`/catalog?search=${encodeURIComponent(q)}`)}
            className={`rounded-full border px-3 py-1 transition-colors ${light ? "border-stone-300 text-stone-600 hover:border-blaze-500 hover:text-blaze-600 dark:border-steel-700 dark:text-stone-300 dark:hover:text-blaze-400" : "border-white/20 text-stone-300 hover:border-blaze-400 hover:text-white"}`}
          >
            {q}
          </button>
        ))}
      </div>

      {showPanel && (
        <div id={listId} role="listbox" className="absolute inset-x-0 top-[3.5rem] z-30 overflow-hidden rounded-md bg-white text-ink shadow-2xl ring-1 ring-black/5">
          {result.total === 0 && result.categories.length === 0 ? (
            <p className="px-4 py-5 text-sm text-stone-500">«{query.trim()}» — ոչինչ չգտնվեց։ Գրեք մեզ, հնարավոր է՝ կա {site.place.in}։</p>
          ) : (
            <>
              {result.categories.map((c) => {
                index++;
                const i = index;
                return (
                  <a key={c.slug} id={`${listId}-${i}`} role="option" aria-selected={active === i} href={links[i]} onClick={(e) => { e.preventDefault(); router.push(links[i]); }} className={`flex items-center gap-3 px-4 py-2.5 text-sm ${active === i ? "bg-stone-100" : "hover:bg-stone-50"}`}>
                    <FolderOpen className="h-4 w-4 text-steel-600" />
                    <span>Բաժին՝ <b>{c.name}</b></span>
                  </a>
                );
              })}
              {result.products.map((p) => {
                index++;
                const i = index;
                return (
                  <a key={p.id} id={`${listId}-${i}`} role="option" aria-selected={active === i} href={links[i]} onClick={(e) => { e.preventDefault(); router.push(links[i]); }} className={`flex items-center gap-3 px-4 py-2 ${active === i ? "bg-stone-100" : "hover:bg-stone-50"}`}>
                    <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded bg-stone-100">
                      <Image src={p.image} unoptimized={isExternalImage(p.image)} alt="" fill sizes="44px" className="object-cover" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{p.title}</span>
                      <span className="block text-xs text-stone-500">{p.category}</span>
                    </span>
                    <span className="shrink-0 text-right text-sm font-semibold">
                      {formatPrice(p.price)} ֏
                      {p.oldPrice && p.oldPrice > p.price && <span className="block text-xs font-normal text-stone-400 line-through">{formatPrice(p.oldPrice)} ֏</span>}
                    </span>
                  </a>
                );
              })}
              {result.total > 0 && (
                <a href={catalogHref} onClick={(e) => { e.preventDefault(); router.push(catalogHref); }} className="block border-t border-stone-100 px-4 py-2.5 text-sm font-semibold text-steel-700 hover:bg-stone-50">
                  Տեսնել բոլոր {result.total} արդյունքները →
                </a>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
