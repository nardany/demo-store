import type { Metadata } from "next";
import Link from "next/link";
import type { Category, Prisma } from "@prisma/client";
import { PackageSearch, SlidersHorizontal, X } from "lucide-react";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/ProductCard";
import { SearchInput } from "@/components/SearchInput";
import { formatPrice, site, whatsappLink } from "@/lib/site";
import { matchProducts, parseAmount } from "@/lib/search";

export const revalidate = 0;
export const metadata: Metadata = { title: "Կատալոգ" };

type Params = { category?: string; stock?: string; search?: string; sale?: string; sort?: string; min?: string; max?: string };

const sorts = {
  new: { label: "Նորերը", orderBy: [{ isNew: "desc" }, { createdAt: "desc" }] },
  cheap: { label: "Էժանից թանկ", orderBy: [{ price: "asc" }] },
  expensive: { label: "Թանկից էժան", orderBy: [{ price: "desc" }] },
} satisfies Record<string, { label: string; orderBy: Prisma.ProductOrderByWithRelationInput[] }>;

const pricePresets = [
  { label: "Մինչև 20 000", min: null, max: 20000 },
  { label: "20 000 – 50 000", min: 20000, max: 50000 },
  { label: "50 000 – 150 000", min: 50000, max: 150000 },
  { label: "150 000-ից ավել", min: 150000, max: null },
];

function hrefWith(current: Params, patch: Partial<Params>) {
  const next = new URLSearchParams();
  for (const [k, v] of Object.entries({ ...current, ...patch })) if (v) next.set(k, v);
  const qs = next.toString();
  return qs ? `/catalog?${qs}` : "/catalog";
}

export default async function CatalogPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  // Կրկնվող պարամետրը (?min=1&min=2) գալիս է զանգվածով. վերցնում ենք առաջինը
  const raw = await searchParams;
  const params: Params = Object.fromEntries(
    Object.entries(raw).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]),
  );
  const { category, stock, search, sale } = params;
  const sort = params.sort && params.sort in sorts ? (params.sort as keyof typeof sorts) : "new";

  let min = parseAmount(params.min);
  let max = parseAmount(params.max);
  if (min !== null && max !== null && min > max) [min, max] = [max, min];

  const allCategories = await db.category.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });
  const selected = allCategories.find((c) => c.slug === category);

  const where: Prisma.ProductWhereInput = {};
  if (selected) {
    const ids = [selected.id, ...allCategories.filter((c) => c.parentId === selected.id).map((c) => c.id)];
    where.categoryId = { in: ids };
  }
  if (stock === "instock") where.inStock = true;
  if (sale) where.oldPrice = { not: null };

  let products = await db.product.findMany({
    where,
    orderBy: sorts[sort].orderBy,
    include: { category: { include: { parent: true } } },
  });

  if (search?.trim()) {
    const matched = matchProducts(products, search);
    products = params.sort ? products.filter((p) => matched.includes(p)) : matched;
  }
  if (sale) products = products.filter((p) => p.oldPrice! > p.price);

  const prices = products.map((p) => p.price);
  const bounds = prices.length ? { low: Math.min(...prices), high: Math.max(...prices) } : null;
  const presetCounts = pricePresets.map((r) => prices.filter((x) => (r.min === null || x >= r.min) && (r.max === null || x <= r.max)).length);

  products = products.filter((p) => (min === null || p.price >= min) && (max === null || p.price <= max));

  const priceActive = min !== null || max !== null;
  const title = sale ? "Զեղչեր" : selected?.name ?? "Կատալոգ";
  const activeFilters = [
    selected && { label: selected.name, href: hrefWith(params, { category: undefined }) },
    search?.trim() && { label: `«${search.trim()}»`, href: hrefWith(params, { search: undefined }) },
    priceActive && { label: `${min !== null ? formatPrice(min) : "0"} – ${max !== null ? formatPrice(max) : "∞"} ֏`, href: hrefWith(params, { min: undefined, max: undefined }) },
    stock && { label: "Միայն առկա", href: hrefWith(params, { stock: undefined }) },
    sale && { label: "Զեղչված", href: hrefWith(params, { sale: undefined }) },
  ].filter(Boolean) as { label: string; href: string }[];

  const filters = (
    <Filters
      params={params}
      categories={allCategories}
      selected={selected}
      min={min}
      max={max}
      bounds={bounds}
      presetCounts={presetCounts}
    />
  );

  return (
    <div className="shell py-10">
      <nav className="text-xs text-stone-500">
        <Link href="/" className="hover:text-steel-700">Գլխավոր</Link>
        <span className="mx-1.5">/</span>
        <Link href="/catalog" className="hover:text-steel-700">Կատալոգ</Link>
        {selected && <><span className="mx-1.5">/</span><span>{selected.name}</span></>}
      </nav>

      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl">{title}</h1>
          <p className="mt-1 text-sm text-stone-500">{products.length} ապրանք</p>
        </div>
        <div className="flex flex-wrap gap-1.5 text-sm">
          {Object.entries(sorts).map(([key, s]) => (
            <Link
              key={key}
              href={hrefWith(params, { sort: key === "new" && !search ? undefined : key })}
              className={`rounded-md px-3 py-1.5 ${sort === key && (params.sort || !search) ? "bg-steel-700 text-white dark:bg-blaze-500 dark:text-ink" : "text-stone-600 hover:bg-stone-200/70 dark:text-stone-300 dark:hover:bg-steel-900"}`}
            >
              {s.label}
            </Link>
          ))}
        </div>
      </div>

      {activeFilters.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {activeFilters.map((f) => (
            <Link key={f.label} href={f.href} className="inline-flex items-center gap-1 rounded-full bg-steel-100 px-3 py-1 text-xs font-medium text-steel-800 hover:bg-steel-200 dark:bg-steel-900 dark:text-stone-200">
              {f.label}
              <X className="h-3 w-3" />
            </Link>
          ))}
          {activeFilters.length > 1 && <Link href="/catalog" className="text-xs text-stone-500 underline hover:text-ink">Մաքրել բոլորը</Link>}
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[250px_1fr] lg:gap-10">
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <SearchInput defaultValue={search ?? ""} />
          <details className="group rounded-lg border border-stone-200 lg:hidden dark:border-steel-900">
            <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-semibold">
              <SlidersHorizontal className="h-4 w-4" />
              Ֆիլտրեր և բաժիններ
            </summary>
            <div className="border-t border-stone-200 p-4 dark:border-steel-900">{filters}</div>
          </details>
          <div className="hidden lg:block">{filters}</div>
        </aside>

        <section>
          {products.length === 0 ? (
            <div className="card flex flex-col items-center px-6 py-16 text-center">
              <PackageSearch className="h-10 w-10 text-stone-400" />
              <h2 className="mt-4 text-lg">Ոչինչ չգտնվեց</h2>
              <p className="mt-2 max-w-sm text-sm text-stone-500">
                Կայքում ամբողջ տեսականին չէ։ Գրեք մեզ, և կասենք՝ կա արդյոք {site.place.in}։
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <a href={whatsappLink(search ? `Բարև Ձեզ, ունե՞ք ${search}` : "Բարև Ձեզ")} target="_blank" rel="noreferrer" className="btn-whatsapp">Հարցնել WhatsApp-ով</a>
                <Link href="/catalog" className="btn-ghost">Մաքրել ֆիլտրերը</Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
          <p className="mt-12 text-xs text-stone-500">Գները կարող են փոխվել։ Ճշտեք {site.phone} համարով։</p>
        </section>
      </div>
    </div>
  );
}

function Filters({
  params,
  categories,
  selected,
  min,
  max,
  bounds,
  presetCounts,
}: {
  params: Params;
  categories: Category[];
  selected?: Category;
  min: number | null;
  max: number | null;
  bounds: { low: number; high: number } | null;
  presetCounts: number[];
}) {
  const { stock, sale } = params;
  const activeParentId = selected?.parentId ?? selected?.id;
  const keep = (["category", "stock", "search", "sale", "sort"] as const).filter((k) => params[k]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="label">Բաժիններ</h2>
        <ul className="space-y-0.5 text-sm">
          <li>
            <Link href={hrefWith(params, { category: undefined })} className={`block rounded-md px-2 py-1.5 ${!selected ? "bg-stone-200/70 font-semibold dark:bg-steel-900" : "hover:bg-stone-200/50 dark:hover:bg-steel-900/60"}`}>
              Բոլորը
            </Link>
          </li>
          {categories.filter((c) => !c.parentId).map((parent) => (
            <li key={parent.id}>
              <Link href={hrefWith(params, { category: parent.slug })} className={`block rounded-md px-2 py-1.5 ${selected?.id === parent.id ? "bg-stone-200/70 font-semibold dark:bg-steel-900" : "hover:bg-stone-200/50 dark:hover:bg-steel-900/60"}`}>
                {parent.name}
              </Link>
              {activeParentId === parent.id && (
                <ul className="ml-3 border-l border-stone-200 pl-2 dark:border-steel-900">
                  {categories.filter((c) => c.parentId === parent.id).map((sub) => (
                    <li key={sub.id}>
                      <Link href={hrefWith(params, { category: sub.slug })} className={`block rounded-md px-2 py-1 text-[13px] ${selected?.id === sub.id ? "font-semibold text-steel-700 dark:text-blaze-400" : "text-stone-600 hover:text-steel-700 dark:text-stone-400"}`}>
                        {sub.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="label">Գին (֏)</h2>
        <form action="/catalog" className="space-y-3">
          {keep.map((k) => <input key={k} type="hidden" name={k} value={params[k]} />)}
          <div className="flex items-center gap-2">
            <input
              name="min"
              inputMode="numeric"
              aria-label="Նվազագույն գին"
              defaultValue={min !== null ? formatPrice(min) : ""}
              placeholder={bounds ? `${formatPrice(bounds.low)}-ից` : "Սկսած"}
              className="input px-2.5"
            />
            <span className="text-stone-400">–</span>
            <input
              name="max"
              inputMode="numeric"
              aria-label="Առավելագույն գին"
              defaultValue={max !== null ? formatPrice(max) : ""}
              placeholder={bounds ? `${formatPrice(bounds.high)}` : "Մինչև"}
              className="input px-2.5"
            />
          </div>
          <button className="btn-primary w-full py-2">Կիրառել</button>
        </form>
        <ul className="mt-3 space-y-1 text-sm">
          {pricePresets.map((r, i) =>
            presetCounts[i] > 0 || (min === r.min && max === r.max) ? (
              <li key={r.label}>
                <Link
                  href={hrefWith(params, { min: r.min?.toString(), max: r.max?.toString() })}
                  className={`flex justify-between rounded-md px-2 py-1 ${min === r.min && max === r.max ? "bg-stone-200/70 font-semibold dark:bg-steel-900" : "text-stone-600 hover:bg-stone-200/50 dark:text-stone-400 dark:hover:bg-steel-900/60"}`}
                >
                  {r.label}
                  <span className="text-stone-400">{presetCounts[i]}</span>
                </Link>
              </li>
            ) : null,
          )}
        </ul>
      </div>

      <div className="space-y-2 text-sm">
        <h2 className="label">Ֆիլտրեր</h2>
        <Link href={hrefWith(params, { stock: stock ? undefined : "instock" })} className="flex items-center gap-2">
          <span className={`flex h-4 w-4 items-center justify-center rounded border text-[10px] ${stock ? "border-steel-700 bg-steel-700 text-white" : "border-stone-400"}`}>{stock && "✓"}</span>
          Միայն առկա
        </Link>
        <Link href={hrefWith(params, { sale: sale ? undefined : "1" })} className="flex items-center gap-2">
          <span className={`flex h-4 w-4 items-center justify-center rounded border text-[10px] ${sale ? "border-steel-700 bg-steel-700 text-white" : "border-stone-400"}`}>{sale && "✓"}</span>
          Միայն զեղչված
        </Link>
      </div>
    </div>
  );
}
