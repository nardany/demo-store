import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { matchProducts, normalize, searchTokens } from "@/lib/search";
import { parseImages } from "@/lib/products";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.slice(0, 80) ?? "";
  if (searchTokens(q).length === 0) return NextResponse.json({ products: [], categories: [], total: 0 });

  const [products, categories] = await Promise.all([
    db.product.findMany({
      select: { id: true, title: true, description: true, specs: true, price: true, oldPrice: true, images: true, category: { select: { name: true, parent: { select: { name: true } } } } },
      orderBy: { createdAt: "desc" },
    }),
    db.category.findMany({ select: { name: true, slug: true } }),
  ]);

  const matches = matchProducts(products, q);
  const needle = normalize(q);

  return NextResponse.json({
    total: matches.length,
    products: matches.slice(0, 6).map((p) => ({
      id: p.id,
      title: p.title,
      price: p.price,
      oldPrice: p.oldPrice,
      image: parseImages(p.images)[0],
      category: p.category.name,
    })),
    categories: categories.filter((c) => normalize(c.name).includes(needle)).slice(0, 3),
  });
}
