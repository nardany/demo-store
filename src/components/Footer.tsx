import Link from "next/link";
import { Clock, Facebook, Instagram, MapPin, Phone } from "lucide-react";
import { Logo } from "./Logo";
import { hoursLabel, site, telLink } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-stone-200 bg-white pb-20 md:pb-0 dark:border-steel-900 dark:bg-steel-950">
      <div className="shell grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Logo size={44} />
            <span className="text-lg font-bold tracking-[0.12em] text-steel-800 dark:text-stone-50">{site.nameLatin}</span>
          </div>
          <p className="text-sm leading-6 text-stone-600 dark:text-stone-400">{site.tagline}։ Զենքեր, օպտիկա, ձկնորսական պարագաներ և հագուստ։</p>
          <div className="flex gap-2">
            {site.social.instagram && (
<a href={site.social.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="rounded-md border border-stone-200 p-2 text-stone-600 hover:border-steel-600 hover:text-steel-700 dark:border-steel-900 dark:text-stone-300 dark:hover:text-blaze-400">
              <Instagram className="h-4 w-4" />
            </a>
)}
            {site.social.facebook && (
<a href={site.social.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="rounded-md border border-stone-200 p-2 text-stone-600 hover:border-steel-600 hover:text-steel-700 dark:border-steel-900 dark:text-stone-300 dark:hover:text-blaze-400">
              <Facebook className="h-4 w-4" />
            </a>
)}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-ink dark:text-stone-50">Տեսականի</h3>
          <ul className="mt-3 space-y-2 text-sm text-stone-600 dark:text-stone-400">
            <li><Link href="/catalog?category=zenqer" className="hover:text-steel-700 dark:hover:text-blaze-400">Զենքեր</Link></li>
            <li><Link href="/catalog?category=zinamterq" className="hover:text-steel-700 dark:hover:text-blaze-400">Փամփուշտներ</Link></li>
            <li><Link href="/catalog?category=dzknorsutyun" className="hover:text-steel-700 dark:hover:text-blaze-400">Ձկնորսություն</Link></li>
            <li><Link href="/catalog?sale=1" className="hover:text-steel-700 dark:hover:text-blaze-400">Զեղչված ապրանքներ</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-ink dark:text-stone-50">Հասցե</h3>
          <a href={site.mapLink} target="_blank" rel="noreferrer" className="mt-3 flex gap-2 text-sm text-stone-600 hover:text-steel-700 dark:text-stone-400 dark:hover:text-blaze-400">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-steel-600 dark:text-blaze-400" />
            <span>
              {site.address.venue}, {site.address.pavilion}
              <br />
              {site.address.city}, {site.address.street}
            </span>
          </a>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-ink dark:text-stone-50">Կապ</h3>
          <div className="mt-3 space-y-2 text-sm text-stone-600 dark:text-stone-400">
            <a href={telLink} className="flex items-center gap-2 font-semibold text-ink hover:text-steel-700 dark:text-stone-100">
              <Phone className="h-4 w-4 text-steel-600 dark:text-blaze-400" />
              {site.phone}
            </a>
            <p className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-steel-600 dark:text-blaze-400" />
              Ամեն օր՝ {hoursLabel}
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-stone-200 dark:border-steel-900">
        <div className="shell flex flex-col gap-2 py-5 text-xs text-stone-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {site.nameLatin}։ Զենքի ձեռքբերումը՝ ՀՀ օրենսդրությամբ սահմանված կարգով։</p>
          <p>
            Կայքը պատրաստել է{" "}
            <a href={site.author.url} target="_blank" rel="noreferrer" className="font-semibold text-stone-700 underline-offset-2 hover:text-steel-700 hover:underline dark:text-stone-300 dark:hover:text-blaze-400">
              {site.author.name}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
