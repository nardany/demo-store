import Link from "next/link";
import type { Prisma } from "@prisma/client";
import Image from "next/image";
import { redirect } from "next/navigation";
import { ExternalLink, LogOut, Pencil } from "lucide-react";
import { verifySession } from "@/lib/auth";
import { db } from "@/lib/db";
import { logoutAdminAction, updatePromoBannerAction } from "@/lib/actions/admin-actions";
import { CategoryForm, CategoryRowActions, DeleteProductButton, ProductForm } from "@/components/admin/AdminForms";
import { formatPrice } from "@/lib/site";
import { discountPercent, isExternalImage, parseImageList, parseImages, parseSpecs } from "@/lib/products";

export const revalidate = 0;

const tabs = { products: "Ապրանքներ", categories: "Բաժիններ", promo: "Բանների տեքստ" } as const;
type Tab = keyof typeof tabs;

export default async function AdminDashboardPage({ searchParams }: { searchParams: Promise<{ tab?: string; edit?: string; q?: string; saved?: string }> }) {
  const session = await verifySession();
  if (!session) redirect("/admin");

  const params = await searchParams;
  const tab: Tab = params.tab && params.tab in tabs ? (params.tab as Tab) : "products";

  const categories = await db.category.findMany({
    where: { parentId: null },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      _count: { select: { products: true } },
      children: { orderBy: [{ sortOrder: "asc" }, { name: "asc" }], include: { _count: { select: { products: true } } } },
    },
  });

  return (
    <div className="shell py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Կառավարում</p>
          <h1 className="mt-1 text-2xl sm:text-3xl">Ադմին պանել</h1>
          <p className="mt-1 text-sm text-stone-500">{session.email}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/" target="_blank" className="btn-ghost py-2"><ExternalLink className="h-4 w-4" />Կայքը</Link>
          <form action={logoutAdminAction}>
            <button className="btn-ghost py-2"><LogOut className="h-4 w-4" />Դուրս գալ</button>
          </form>
        </div>
      </div>

      <nav className="mt-8 flex gap-1 border-b border-stone-200 dark:border-steel-900">
        {(Object.keys(tabs) as Tab[]).map((key) => (
          <Link
            key={key}
            href={`/admin/dashboard?tab=${key}`}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium ${tab === key ? "border-steel-700 text-ink dark:border-blaze-400 dark:text-stone-50" : "border-transparent text-stone-500 hover:text-ink dark:hover:text-stone-200"}`}
          >
            {tabs[key]}
          </Link>
        ))}
      </nav>

      <div className="mt-8">
        {tab === "products" && <ProductsTab categories={categories} editId={params.edit} q={params.q} saved={!!params.saved} />}
        {tab === "categories" && <CategoriesTab categories={categories} editId={params.edit} />}
        {tab === "promo" && <PromoTab />}
      </div>
    </div>
  );
}

const countProducts = { _count: { select: { products: true } } } as const;
type Categories = Prisma.CategoryGetPayload<{ include: typeof countProducts & { children: { include: typeof countProducts } } }>[];

async function ProductsTab({ categories, editId, q, saved }: { categories: Categories; editId?: string; q?: string; saved?: boolean }) {
  const editing = editId ? await db.product.findUnique({ where: { id: editId } }) : null;
  let products = await db.product.findMany({ orderBy: { createdAt: "desc" }, include: { category: true } });
  const query = q?.trim().toLowerCase();
  if (query) products = products.filter((p) => p.title.toLowerCase().includes(query));

  return (
    <div className="space-y-10">
      {saved && !editing && (
        <p className="rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">Փոփոխությունները պահպանվեցին։</p>
      )}
      <section className="card p-6">
        <h2 className="text-lg">{editing ? `Խմբագրել՝ ${editing.title}` : "Նոր ապրանք"}</h2>
        <div className="mt-5">
          <ProductForm
            key={editing ? `${editing.id}-${editing.updatedAt.getTime()}` : "new"}
            categories={categories}
            editing={editing ? {
              id: editing.id,
              title: editing.title,
              description: editing.description,
              categoryId: editing.categoryId,
              price: editing.price,
              oldPrice: editing.oldPrice,
              images: parseImageList(editing.images),
              specs: parseSpecs(editing.specs),
              inStock: editing.inStock,
              isNew: editing.isNew,
              requiresLicense: editing.requiresLicense,
            } : undefined}
          />
        </div>
      </section>

      <section>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg">Բոլոր ապրանքները ({products.length})</h2>
          <form className="w-full max-w-xs">
            <input type="hidden" name="tab" value="products" />
            <input name="q" defaultValue={q} placeholder="Որոնել անվանումով" className="input" />
          </form>
        </div>
        <div className="card mt-4 divide-y divide-stone-200 dark:divide-steel-900">
          {products.map((p) => {
            const discount = discountPercent(p.price, p.oldPrice);
            return (
              <div key={p.id} className="flex items-center gap-4 p-3">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded bg-stone-100 dark:bg-steel-900">
                  <Image src={parseImages(p.images)[0]} unoptimized={isExternalImage(parseImages(p.images)[0])} alt="" fill sizes="56px" className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <Link href={`/products/${p.id}`} target="_blank" className="block truncate font-medium hover:text-steel-700">{p.title}</Link>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-stone-500">
                    <span>{p.category.name}</span>
                    {!p.inStock && <span className="badge bg-stone-200 text-stone-700 dark:bg-steel-900 dark:text-stone-300">Պատվերով</span>}
                    {p.isNew && <span className="badge-new">Նոր</span>}
                    {discount > 0 && <span className="badge-sale">−{discount}%</span>}
                  </p>
                </div>
                <span className="hidden text-right text-sm font-semibold sm:block">{formatPrice(p.price)} ֏</span>
                <Link href={`/admin/dashboard?tab=products&edit=${p.id}`} className="rounded p-1.5 text-stone-500 hover:bg-stone-100 dark:hover:bg-steel-900" aria-label="Խմբագրել">
                  <Pencil className="h-4 w-4" />
                </Link>
                <DeleteProductButton id={p.id} />
              </div>
            );
          })}
          {products.length === 0 && <p className="p-6 text-center text-sm text-stone-500">Ապրանքներ չկան</p>}
        </div>
      </section>
    </div>
  );
}

async function CategoriesTab({ categories, editId }: { categories: Categories; editId?: string }) {
  const editing = editId ? await db.category.findUnique({ where: { id: editId } }) : null;

  return (
    <div className="space-y-10">
      <section className="card p-6">
        <h2 className="text-lg">{editing ? `Խմբագրել՝ ${editing.name}` : "Նոր բաժին"}</h2>
        <p className="mt-1 text-sm text-stone-500">Բաժինները երկու մակարդակ են՝ գլխավոր բաժին և ենթաբաժին։ Հերթականությունը փոխեք սլաքներով։</p>
        <div className="mt-5">
          <CategoryForm key={editing?.id ?? "new"} parents={categories} editing={editing ?? undefined} />
        </div>
      </section>

      <section className="space-y-4">
        {categories.map((parent, i) => {
          const total = parent._count.products + parent.children.reduce((n, c) => n + c._count.products, 0);
          return (
            <div key={parent.id} className="card">
              <div className="flex items-center gap-3 p-3">
                {parent.image && (
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-stone-100">
                    <Image src={parent.image} unoptimized={isExternalImage(parent.image)} alt="" fill sizes="40px" className="object-cover" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-semibold">{parent.name}</p>
                  <p className="text-xs text-stone-500">/{parent.slug} · {total} ապրանք</p>
                </div>
                <CategoryRowActions id={parent.id} isFirst={i === 0} isLast={i === categories.length - 1} />
              </div>
              {parent.children.length > 0 && (
                <ul className="divide-y divide-stone-100 border-t border-stone-200 dark:divide-steel-900 dark:border-steel-900">
                  {parent.children.map((child, j) => (
                    <li key={child.id} className="flex items-center gap-3 py-2 pl-10 pr-3">
                      <div className="flex-1">
                        <p className="text-sm">{child.name}</p>
                        <p className="text-xs text-stone-500">/{child.slug} · {child._count.products} ապրանք</p>
                      </div>
                      <CategoryRowActions id={child.id} isFirst={j === 0} isLast={j === parent.children.length - 1} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </section>
    </div>
  );
}

async function PromoTab() {
  const promo = await db.promoBanner.findFirst({ orderBy: { updatedAt: "desc" } });

  return (
    <section className="card max-w-2xl p-6">
      <h2 className="text-lg">Կայքի վերևի բանները</h2>
      <p className="mt-1 text-sm text-stone-500">Կարճ հայտարարություն ակցիայի կամ նոր ստացման մասին։</p>
      <form action={updatePromoBannerAction} className="mt-5 space-y-4">
        <input name="text" defaultValue={promo?.text ?? ""} placeholder="օր.՝ 10% զեղչ բոլոր դանակների վրա մինչև ամսվա վերջ" className="input" />
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isActive" defaultChecked={promo?.isActive ?? true} />Ցուցադրել կայքում</label>
          <button className="btn-primary py-2">Պահպանել</button>
        </div>
      </form>
    </section>
  );
}
