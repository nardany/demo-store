import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { site } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products] = await Promise.all([
    db.category.findMany({ select: { slug: true } }),
    db.product.findMany({ select: { id: true, updatedAt: true } }),
  ]).catch(() => [[], []] as const);

  return [
    { url: site.url, changeFrequency: "daily", priority: 1 },
    { url: `${site.url}/catalog`, changeFrequency: "daily", priority: 0.9 },
    { url: `${site.url}/contact`, changeFrequency: "monthly", priority: 0.5 },
    ...categories.map((c) => ({ url: `${site.url}/catalog?category=${c.slug}`, changeFrequency: "weekly" as const, priority: 0.7 })),
    ...products.map((p) => ({ url: `${site.url}/products/${p.id}`, lastModified: p.updatedAt, changeFrequency: "weekly" as const, priority: 0.8 })),
  ];
}
