"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { ChevronDown, Menu, Phone, Search, X } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { Logo } from "./Logo";
import { site, telLink } from "@/lib/site";

export interface NavCategory {
  id: string;
  name: string;
  slug: string;
  children: { id: string; name: string; slug: string }[];
}

export function Navbar({ categories = [] }: { categories?: NavCategory[] }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [query, setQuery] = useState("");
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    setMobileOpen(false);
    setCatalogOpen(false);
  }, [pathname, query]);

  const saleActive = pathname === "/catalog" && new URLSearchParams(query).has("sale");

  const openCatalog = () => {
    clearTimeout(closeTimer.current);
    setCatalogOpen(true);
  };
  const closeCatalog = () => {
    closeTimer.current = setTimeout(() => setCatalogOpen(false), 120);
  };

  const navLink = (href: string, label: string, active = pathname === href) => (
    <Link
      href={href}
      className={`py-2 transition-colors hover:text-steel-700 dark:hover:text-blaze-400 ${
        active ? "text-steel-700 dark:text-blaze-400" : ""
      }`}
    >
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-paper/90 backdrop-blur-md dark:border-steel-900 dark:bg-steel-950/90">
      <Suspense fallback={null}>
        <QueryWatcher onChange={setQuery} />
      </Suspense>
      <div className="shell flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3">
          <Logo size={40} />
          <span className="leading-tight">
            <span className="block text-lg font-bold tracking-[0.12em] text-steel-800 dark:text-stone-50">{site.nameLatin}</span>
            <span className="hidden text-[11px] text-stone-500 sm:block dark:text-stone-400">{site.address.venue} · {site.address.pavilion}</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium text-stone-700 md:flex dark:text-stone-300">
          {navLink("/", "Գլխավոր")}

          <div className="relative" onMouseEnter={openCatalog} onMouseLeave={closeCatalog}>
            <Link
              href="/catalog"
              aria-expanded={catalogOpen}
              className={`flex items-center gap-1 py-2 transition-colors hover:text-steel-700 dark:hover:text-blaze-400 ${
                pathname.startsWith("/catalog") && !saleActive ? "text-steel-700 dark:text-blaze-400" : ""
              }`}
            >
              Կատալոգ
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${catalogOpen ? "rotate-180" : ""}`} />
            </Link>

            {catalogOpen && categories.length > 0 && (
              <div className="absolute left-1/2 top-full w-[640px] -translate-x-1/2 pt-3">
                <div className="grid grid-cols-3 gap-x-6 gap-y-5 rounded-lg border border-stone-200 bg-white p-6 shadow-xl dark:border-steel-800 dark:bg-steel-950 dark:shadow-black/50">
                  {categories.map((parent) => (
                    <div key={parent.id}>
                      <Link href={`/catalog?category=${parent.slug}`} className="text-sm font-semibold text-ink hover:text-steel-700 dark:text-stone-50 dark:hover:text-blaze-400">
                        {parent.name}
                      </Link>
                      <ul className="mt-1.5 space-y-1">
                        {parent.children.map((sub) => (
                          <li key={sub.id}>
                            <Link href={`/catalog?category=${sub.slug}`} className="text-[13px] text-stone-500 hover:text-steel-700 dark:text-stone-400 dark:hover:text-blaze-400">
                              {sub.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {navLink("/catalog?sale=1", "Զեղչեր", saleActive)}
          {navLink("/contact", "Կապ")}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/catalog" className="rounded-md p-2 text-stone-600 hover:bg-stone-200/60 md:hidden dark:text-stone-300 dark:hover:bg-steel-900" aria-label="Որոնել">
            <Search className="h-5 w-5" />
          </Link>
          <a href={telLink} className="hidden items-center gap-2 rounded-md border border-stone-300 px-3 py-2 text-sm font-semibold text-ink hover:border-steel-600 sm:flex dark:border-steel-800 dark:text-stone-100">
            <Phone className="h-4 w-4 text-steel-600 dark:text-blaze-400" />
            {site.phone}
          </a>
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="rounded-md p-2 text-stone-700 hover:bg-stone-200/60 md:hidden dark:text-stone-300 dark:hover:bg-steel-900"
            aria-label="Մենյու"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-stone-200 bg-paper md:hidden dark:border-steel-900 dark:bg-steel-950">
          <div className="shell space-y-1 py-4 text-sm">
            <Link href="/" className="block rounded-md px-3 py-2 font-medium hover:bg-stone-200/60 dark:hover:bg-steel-900">Գլխավոր</Link>
            <Link href="/catalog" className="block rounded-md px-3 py-2 font-medium hover:bg-stone-200/60 dark:hover:bg-steel-900">Ամբողջ կատալոգը</Link>
            <Link href="/catalog?sale=1" className="block rounded-md px-3 py-2 font-medium hover:bg-stone-200/60 dark:hover:bg-steel-900">Զեղչեր</Link>
            <div className="grid grid-cols-2 gap-1 border-y border-stone-200 py-2 dark:border-steel-900">
              {categories.map((c) => (
                <Link key={c.id} href={`/catalog?category=${c.slug}`} className="rounded-md px-3 py-2 text-stone-600 hover:bg-stone-200/60 dark:text-stone-300 dark:hover:bg-steel-900">
                  {c.name}
                </Link>
              ))}
            </div>
            <Link href="/contact" className="block rounded-md px-3 py-2 font-medium hover:bg-stone-200/60 dark:hover:bg-steel-900">Կապ և հասցե</Link>
          </div>
        </div>
      )}
    </header>
  );
}

function QueryWatcher({ onChange }: { onChange: (query: string) => void }) {
  const query = useSearchParams().toString();
  useEffect(() => onChange(query), [query, onChange]);
  return null;
}
