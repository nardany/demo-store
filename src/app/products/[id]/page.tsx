import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { MapPin, Phone, ShieldAlert } from "lucide-react";
import { db } from "@/lib/db";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductCard } from "@/components/ProductCard";
import { formatPrice, site, telLink, whatsappLink } from "@/lib/site";
import { ViberButton } from "@/components/ViberButton";
import { discountPercent, parseImages, parseSpecs } from "@/lib/products";

export const revalidate = 0;

type Props = { params: Promise<{ id: string }> };

const getProduct = cache((id: string) =>
  db.product.findUnique({ where: { id }, include: { category: { include: { parent: true } } } }),
);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct((await params).id);
  if (!product) return {};
  return {
    title: product.title,
    description: product.description.slice(0, 160),
    openGraph: { images: parseImages(product.images).slice(0, 1) },
  };
}

export default async function ProductPage({ params }: Props) {
  const product = await getProduct((await params).id);
  if (!product) notFound();

  const images = parseImages(product.images);
  const specs = parseSpecs(product.specs);
  const discount = discountPercent(product.price, product.oldPrice);
  const { category } = product;

  const related = await db.product.findMany({
    where: { id: { not: product.id }, categoryId: { in: [category.id, ...(category.parentId ? [category.parentId] : [])] } },
    take: 4,
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });

  const orderText = `Բարև Ձեզ, հետաքրքրում է «${product.title}» (${formatPrice(product.price)} ֏)։ Առկա՞ է։`;

  return (
    <div className="shell py-10">
      <nav className="text-xs text-stone-500">
        <Link href="/catalog" className="hover:text-steel-700">Կատալոգ</Link>
        {category.parent && (
          <><span className="mx-1.5">/</span><Link href={`/catalog?category=${category.parent.slug}`} className="hover:text-steel-700">{category.parent.name}</Link></>
        )}
        <span className="mx-1.5">/</span>
        <Link href={`/catalog?category=${category.slug}`} className="hover:text-steel-700">{category.name}</Link>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-14">
        <ProductGallery images={images} title={product.title} />

        <div>
          <div className="flex flex-wrap gap-1.5">
            {discount > 0 && <span className="badge-sale">−{discount}%</span>}
            {product.isNew && <span className="badge-new">Նոր</span>}
            <span className={`badge ${product.inStock ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300" : "bg-stone-200 text-stone-700 dark:bg-steel-900 dark:text-stone-300"}`}>
              {product.inStock ? `Առկա է ${site.place.in}` : "Պատվերով"}
            </span>
          </div>

          <h1 className="mt-3 text-2xl leading-tight sm:text-3xl">{product.title}</h1>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="text-3xl font-bold">{formatPrice(product.price)} ֏</span>
            {discount > 0 && <span className="text-lg text-stone-400 line-through">{formatPrice(product.oldPrice!)} ֏</span>}
          </div>

          {product.requiresLicense && (
            <div className="mt-6 flex gap-3 rounded-lg border border-blaze-500/40 bg-blaze-400/10 p-4 text-sm">
              <ShieldAlert className="h-5 w-5 shrink-0 text-blaze-600 dark:text-blaze-400" />
              <p className="leading-6 text-stone-700 dark:text-stone-300">
                Ձեռքբերման համար անհրաժեշտ է ՀՀ ոստիկանության թույլտվություն։ Մանրամասների համար զանգահարեք։
              </p>
            </div>
          )}

          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            <a href={whatsappLink(orderText)} target="_blank" rel="noreferrer" className="btn-whatsapp">Գրել WhatsApp-ով</a>
            <a href={telLink} className="btn-primary"><Phone className="h-4 w-4" />{site.phone}</a>
            <ViberButton className="btn-ghost sm:col-span-2" />
          </div>

          <p className="mt-4 flex items-center gap-2 text-sm text-stone-500">
            <MapPin className="h-4 w-4 text-steel-600 dark:text-blaze-400" />
            {site.address.venue}, {site.address.pavilion}
          </p>

          <div className="mt-8 border-t border-stone-200 pt-6 dark:border-steel-900">
            <h2 className="text-base">Նկարագրություն</h2>
            <p className="mt-2 whitespace-pre-line leading-7 text-stone-700 dark:text-stone-300">{product.description}</p>
          </div>

          {specs.length > 0 && (
            <div className="mt-8">
              <h2 className="text-base">Բնութագիր</h2>
              <dl className="mt-3 divide-y divide-stone-200 text-sm dark:divide-steel-900">
                {specs.map(([key, value]) => (
                  <div key={key} className="flex justify-between gap-6 py-2.5">
                    <dt className="text-stone-500">{key}</dt>
                    <dd className="text-right font-medium">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-24">
          <h2 className="h-section">Նմանատիպ ապրանքներ</h2>
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
