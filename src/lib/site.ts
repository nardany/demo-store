import { brand } from "@/brands";

export const site = {
  ...brand,
  url:
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) ||
    (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`) ||
    "http://localhost:3000",

  author: {
    name: "Narek Danielyan",
    url: "https://www.linkedin.com/in/nar-danielyan",
  },
};

export const telLink = `tel:${site.phoneRaw}`;
export const viberLink = `viber://chat?number=%2B${site.whatsapp}`;

export function whatsappLink(text?: string) {
  return `https://wa.me/${site.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

export function formatPrice(value: number) {
  return new Intl.NumberFormat("hy-AM").format(value);
}

export const hoursLabel = `${site.hours.open} – ${site.hours.close}`;
