import { MapPin, MessageCircle, Phone } from "lucide-react";
import { site, telLink, whatsappLink } from "@/lib/site";

export function MobileCallBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden dark:border-steel-900 dark:bg-steel-950/95">
      <div className="grid grid-cols-3 text-xs font-semibold">
        <a href={telLink} className="flex flex-col items-center gap-1 py-2.5 text-steel-700 dark:text-blaze-400">
          <Phone className="h-5 w-5" />
          Զանգել
        </a>
        <a href={whatsappLink("Բարև Ձեզ")} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-1 py-2.5 text-[#1f8f4e]">
          <MessageCircle className="h-5 w-5" />
          WhatsApp
        </a>
        <a href={site.mapLink} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-1 py-2.5 text-stone-700 dark:text-stone-300">
          <MapPin className="h-5 w-5" />
          Ճանապարհ
        </a>
      </div>
    </div>
  );
}
