"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

export function SearchInput({ defaultValue = "" }: { defaultValue?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState(defaultValue);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (document.activeElement !== inputRef.current) setQuery(defaultValue);
  }, [defaultValue]);

  const push = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) params.set("search", value.trim());
    else params.delete("search");
    startTransition(() => router.replace(`${pathname}?${params.toString()}`, { scroll: false }));
  };

  const onChange = (value: string) => {
    setQuery(value);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => push(value), 300);
  };

  return (
    <div className="relative">
      <label htmlFor="catalog-search" className="sr-only">Որոնում</label>
      <Search className={`pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${isPending ? "animate-pulse text-steel-600" : "text-stone-400"}`} />
      <input
        ref={inputRef}
        id="catalog-search"
        value={query}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Որոնել կատալոգում"
        className="input pl-9 pr-8"
      />
      {query && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
          aria-label="Մաքրել"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
