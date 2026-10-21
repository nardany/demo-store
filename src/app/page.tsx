import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BadgeCheck, Clock, Headset, MapPin, MessageCircle, Phone, Star, Truck } from "lucide-react";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/ProductCard";
import { OpenStatus } from "@/components/OpenStatus";
import { HeroSearch } from "@/components/HeroSearch";
import { isExternalImage } from "@/lib/products";
import { hoursLabel, site, telLink, whatsappLink } from "@/lib/site";

export const revalidate = 0;

const benefitIcons = { advice: Headset, original: BadgeCheck, chat: MessageCircle, order: Truck };

function SectionHeader({ eyebrow, title, href, linkLabel }: { eyebrow: string; title: string; href?: string; linkLabel?: string }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="h-section">{title}</h2>
      </div>
      {href && (
        <Link href={href} className="link-more shrink-0">
          {linkLabel} <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

export default async function HomePage() {
  const [categories, newest, onSale, productCount] = await Promise.all([
    db.category.findMany({
      where: { parentId: null },
      include: { children: { select: { _count: { select: { products: true } } } }, _count: { select: { products: true } } },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
    db.product.findMany({ take: 8, orderBy: [{ isNew: "desc" }, { createdAt: "desc" }], include: { category: true } }),
    db.product.findMany({ where: { oldPrice: { not: null } }, take: 4, orderBy: { updatedAt: "desc" }, include: { category: true } }),
    db.product.count(),
  ]).catch((err) => {
    console.error("Failed to load home page data:", err);
    return [[], [], [], 0] as const;
  });

  const sale = onSale.filter((p) => p.oldPrice && p.oldPrice > p.price);

  return (
    <div className="space-y-20 pb-8 sm:space-y-24">
      {/* Hero. Լուսավոր՝ տեքստը ձախում, նկարը աջում։ z-10, որ որոնման պատուհանը մնա բովանդակության վրա */}
      <section className="relative z-10 border-b border-stone-200 bg-white dark:border-steel-800 dark:bg-steel-950">
        <div className="shell grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-2 lg:gap-16 lg:py-20">
          <div>
            <OpenStatus />
            <h1 className="mt-4 text-3xl leading-[1.15] text-ink sm:text-5xl sm:leading-[1.1] dark:text-white">{site.hero.title}</h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-stone-600 dark:text-stone-400">{site.hero.text}</p>
            <HeroSearch light />

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-stone-600 dark:text-stone-400">
              <span className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-blaze-500" />{productCount}+ ապրանք</span>
              <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-blaze-500" />Ամեն օր՝ {hoursLabel}</span>
              <a href={telLink} className="flex items-center gap-2 font-medium text-ink hover:text-blaze-600 dark:text-stone-200"><Phone className="h-4 w-4 text-blaze-500" />{site.phone}</a>
            </div>
          </div>

          <div className="relative">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-steel-900 shadow-xl">
              <Image src={site.images.hero} alt="" fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
            </div>
            {sale[0] && (
              <Link
                href={`/products/${sale[0].id}`}
                className="absolute -bottom-6 left-4 flex max-w-[16rem] items-center gap-3 rounded-xl border border-stone-200 bg-white p-3 shadow-lg transition-transform hover:-translate-y-0.5 sm:left-6 dark:border-steel-700 dark:bg-steel-900"
              >
                <span className="rounded-md bg-blaze-500 px-2 py-1 text-xs font-bold text-ink">Զեղչ</span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-ink dark:text-white">{sale[0].title}</span>
                  <span className="text-xs text-stone-500">Տեսնել առաջարկը →</span>
                </span>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Առավելություններ */}
      <section className="shell">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {site.benefits.map((b) => {
            const Icon = benefitIcons[b.icon];
            return (
              <div key={b.title} className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blaze-500/10 text-blaze-600 dark:text-blaze-400">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-[15px]">{b.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-stone-500 dark:text-stone-400">{b.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Բաժիններ՝ միատեսակ քարտեր */}
      <section className="shell">
        <SectionHeader eyebrow="Տեսականի" title="Ընտրեք բաժինը" href="/catalog" linkLabel="Ամբողջ կատալոգը" />
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((cat) => {
            const count = cat._count.products + cat.children.reduce((n, c) => n + c._count.products, 0);
            return (
              <Link key={cat.id} href={`/catalog?category=${cat.slug}`} className="group card overflow-hidden transition-shadow hover:shadow-lg">
                <div className="relative aspect-[4/3] overflow-hidden bg-stone-100 dark:bg-steel-800">
                  {cat.image && (
                    <Image src={cat.image} unoptimized={isExternalImage(cat.image)} alt="" fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  )}
                </div>
                <div className="flex items-center justify-between gap-2 p-4">
                  <div>
                    <h3 className="text-[15px] group-hover:text-blaze-600 dark:group-hover:text-blaze-400">{cat.name}</h3>
                    <p className="text-xs text-stone-500">{count} ապրանք</p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-stone-400 transition-transform group-hover:translate-x-0.5 group-hover:text-blaze-500" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Զեղչեր */}
      {sale.length > 0 && (
        <section className="shell">
          <SectionHeader eyebrow="Ակցիա" title="Զեղչված ապրանքներ" href="/catalog?sale=1" linkLabel="Բոլոր զեղչերը" />
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
            {sale.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* Ինչպես գնել */}
      <section className="bg-steel-900 py-16 text-stone-100 sm:py-20">
        <div className="shell grid gap-10 lg:grid-cols-[1fr_2fr] lg:items-center">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blaze-400">Ինչպես է աշխատում</p>
            <h2 className="mt-1 text-2xl sm:text-3xl">Գնեք երեք պարզ քայլով</h2>
            <a href={whatsappLink("Բարև Ձեզ, ունեմ հարց")} target="_blank" rel="noreferrer" className="btn-primary mt-6">
              <MessageCircle className="h-4 w-4" />Գրել մեզ
            </a>
          </div>
          <ol className="grid gap-4 sm:grid-cols-3">
            {site.steps.map((step, i) => (
              <li key={step.title} className="rounded-xl border border-white/10 bg-white/5 p-5">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blaze-500 text-sm font-bold text-ink">{i + 1}</span>
                <h3 className="mt-4 text-base text-white">{step.title}</h3>
                <p className="mt-1 text-sm leading-6 text-stone-400">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Նոր ապրանքներ */}
      <section className="shell">
        <SectionHeader eyebrow="Թարմ ստացումներ" title={`Նոր ${site.place.in}`} href="/catalog?sort=new" linkLabel="Տեսնել բոլորը" />
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
          {newest.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* Կարծիքներ */}
      <section className="shell">
        <SectionHeader eyebrow="Կարծիքներ" title="Ինչ են ասում հաճախորդները" />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {site.testimonials.map((t) => (
            <figure key={t.name} className="card flex flex-col p-6">
              <div className="flex gap-0.5 text-blaze-500" role="img" aria-label={`${t.rating} աստղ 5-ից`}>
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < t.rating ? "fill-current" : "opacity-30"}`} />
                ))}
              </div>
              <blockquote className="mt-4 flex-1 text-sm leading-6 text-stone-700 dark:text-stone-300">«{t.text}»</blockquote>
              <figcaption className="mt-5 flex items-center gap-3 text-sm font-semibold">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-steel-100 text-xs text-steel-700 dark:bg-steel-800 dark:text-stone-200">{t.name.charAt(0)}</span>
                {t.name}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Այցելեք մեզ */}
      <section className="shell">
        <div className="card grid overflow-hidden lg:grid-cols-2">
          <div className="grid grid-cols-2 gap-1 bg-stone-100 dark:bg-steel-800">
            {site.images.store.slice(0, 4).map((photo) => (
              <div key={photo.src} className="relative aspect-square">
                <Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 1024px) 50vw, 25vw" className="object-cover" />
              </div>
            ))}
          </div>
          <div className="flex flex-col justify-center p-8 sm:p-12">
            <p className="eyebrow">Այցելեք մեզ</p>
            <h2 className="h-section">Տեսեք, բռնեք ձեռքում, ընտրեք</h2>
            <p className="mt-4 max-w-md leading-7 text-stone-600 dark:text-stone-400">
              Կայքում ամբողջ տեսականին չէ։ Եթե չգտաք անհրաժեշտ ապրանքը, գրեք կամ զանգեք։ Հնարավոր է՝ այն կա {site.place.in} կամ կբերենք պատվերով։
            </p>
            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex gap-3"><dt className="flex w-24 shrink-0 items-center gap-2 text-stone-500"><MapPin className="h-4 w-4" />Հասցե</dt><dd>{site.address.city}, {site.address.street}</dd></div>
              <div className="flex gap-3"><dt className="flex w-24 shrink-0 items-center gap-2 text-stone-500"><Clock className="h-4 w-4" />Ժամեր</dt><dd>Ամեն օր՝ {hoursLabel}</dd></div>
              <div className="flex gap-3"><dt className="flex w-24 shrink-0 items-center gap-2 text-stone-500"><Phone className="h-4 w-4" />Հեռախոս</dt><dd><a href={telLink} className="font-semibold hover:text-blaze-600">{site.phone}</a></dd></div>
            </dl>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={whatsappLink("Բարև Ձեզ")} target="_blank" rel="noreferrer" className="btn-whatsapp">Գրել WhatsApp-ով</a>
              <Link href="/contact" className="btn-ghost">Քարտեզ և կոնտակտներ</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
