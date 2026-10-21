import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Search } from "lucide-react";
import { db } from "@/lib/db";
import { site, whatsappLink } from "@/lib/site";

export const metadata: Metadata = { title: "Էջը չի գտնվել" };

export default async function NotFound() {
  const categories = await db.category
    .findMany({ where: { parentId: null }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }], take: 6 })
    .catch(() => []);

  return (
    <div className="shell grid gap-12 py-16 sm:py-24 lg:grid-cols-[1.1fr_1fr] lg:items-center">
      <div>
        <p className="eyebrow">Սխալ 404</p>
        <h1 className="mt-3 text-4xl leading-tight sm:text-5xl">Վրիպում։ Այս էջը թիրախում չէ</h1>
        <p className="mt-5 max-w-md leading-7 text-stone-600 dark:text-stone-400">
          Հնարավոր է՝ ապրանքն արդեն վաճառվել է, կամ հղումը սխալ է։ Փորձեք որոնել կատալոգում կամ գրեք մեզ, կօգնենք գտնել։
        </p>

        <form action="/catalog" className="mt-8 flex max-w-md overflow-hidden rounded-md border border-stone-300 bg-white focus-within:border-steel-600 dark:border-steel-800 dark:bg-steel-950">
          <label htmlFor="nf-search" className="sr-only">Որոնում</label>
          <Search className="my-auto ml-3 h-4 w-4 shrink-0 text-stone-400" />
          <input id="nf-search" name="search" placeholder="Ի՞նչ եք փնտրում" className="w-full bg-transparent px-3 py-3 text-sm focus:outline-none" />
          <button className="bg-steel-700 px-4 text-sm font-semibold text-white hover:bg-steel-800 dark:bg-blaze-500 dark:text-ink">Գտնել</button>
        </form>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/" className="btn-ghost"><ArrowLeft className="h-4 w-4" />Գլխավոր էջ</Link>
          <a href={whatsappLink("Բարև Ձեզ, չեմ գտնում ապրանքը")} target="_blank" rel="noreferrer" className="btn-whatsapp">Գրել WhatsApp-ով</a>
        </div>

        {categories.length > 0 && (
          <div className="mt-10">
            <p className="label">Կամ ընտրեք բաժին</p>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <Link key={c.id} href={`/catalog?category=${c.slug}`} className="rounded-full border border-stone-300 px-3 py-1.5 text-sm hover:border-steel-600 hover:text-steel-700 dark:border-steel-800 dark:hover:border-blaze-500 dark:hover:text-blaze-300">
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-full border-8 border-white shadow-xl dark:border-steel-900">
        <Image src={site.images.notFound} alt="" fill sizes="384px" className="object-cover grayscale-[40%]" />
        {/* Նշանոցի խաչ */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="absolute h-px w-full bg-white/70" />
          <div className="absolute h-full w-px bg-white/70" />
          <div className="h-24 w-24 rounded-full border-2 border-white/80" />
          <span className="absolute bottom-8 rounded bg-ink/80 px-3 py-1 text-2xl font-bold tracking-widest text-blaze-300">404</span>
        </div>
      </div>
    </div>
  );
}
