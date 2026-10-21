import type { Metadata } from "next";
import { Clock, Facebook, Instagram, MapPin, Phone } from "lucide-react";
import { OpenStatus } from "@/components/OpenStatus";
import { hoursLabel, site, telLink, whatsappLink } from "@/lib/site";
import { ViberButton } from "@/components/ViberButton";

export const metadata: Metadata = { title: "Կապ և հասցե" };

export default function ContactPage() {
  return (
    <div className="shell py-10">
      <p className="eyebrow">Կապ</p>
      <h1 className="mt-1 text-3xl sm:text-4xl">Ինչպես գտնել մեզ</h1>
      <OpenStatus className="mt-4" />

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-8">
          <div className="flex gap-4">
            <MapPin className="mt-1 h-5 w-5 shrink-0 text-steel-600 dark:text-blaze-400" />
            <div>
              <h2 className="text-base">Հասցե</h2>
              <p className="mt-1 text-stone-700 dark:text-stone-300">
                {site.address.venue}, {site.address.pavilion}
                <br />
                {site.address.city}, {site.address.street}
              </p>
              <a href={site.mapLink} target="_blank" rel="noreferrer" className="link-more mt-2">Բացել քարտեզում</a>
            </div>
          </div>

          <div className="flex gap-4">
            <Clock className="mt-1 h-5 w-5 shrink-0 text-steel-600 dark:text-blaze-400" />
            <div>
              <h2 className="text-base">Աշխատանքային ժամեր</h2>
              <p className="mt-1 text-stone-700 dark:text-stone-300">Ամեն օր՝ {hoursLabel}</p>
            </div>
          </div>

          <div className="flex gap-4">
            <Phone className="mt-1 h-5 w-5 shrink-0 text-steel-600 dark:text-blaze-400" />
            <div>
              <h2 className="text-base">Հեռախոս</h2>
              <a href={telLink} className="mt-1 block text-lg font-semibold hover:text-steel-700 dark:hover:text-blaze-400">{site.phone}</a>
              <div className="mt-3 flex flex-wrap gap-2">
                <a href={whatsappLink("Բարև Ձեզ")} target="_blank" rel="noreferrer" className="btn-whatsapp py-2">WhatsApp</a>
                <ViberButton className="btn-ghost py-2">Viber</ViberButton>
              </div>
            </div>
          </div>

          <div className="flex gap-2 border-t border-stone-200 pt-6 dark:border-steel-900">
            {site.social.instagram && <a href={site.social.instagram} target="_blank" rel="noreferrer" className="btn-ghost py-2"><Instagram className="h-4 w-4" />Instagram</a>}
            {site.social.facebook && <a href={site.social.facebook} target="_blank" rel="noreferrer" className="btn-ghost py-2"><Facebook className="h-4 w-4" />Facebook</a>}
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-stone-200 dark:border-steel-900">
          <iframe
            title={`${site.nameLatin} — քարտեզ`}
            src={site.mapEmbed}
            className="h-full min-h-[420px] w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </div>
  );
}
