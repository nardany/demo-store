import Link from "next/link";
import Image from "next/image";
import { ShieldAlert } from "lucide-react";
import { formatPrice } from "@/lib/site";
import { discountPercent, isExternalImage, parseImages, parseSpecs } from "@/lib/products";

export interface ProductCardData {
  id: string;
  title: string;
  price: number;
  oldPrice?: number | null;
  isNew: boolean;
  images: string;
  inStock: boolean;
  requiresLicense: boolean;
  specs?: string | null;
  category?: { name: string } | null;
}

export function ProductCard({ product, inverted = false }: { product: ProductCardData; inverted?: boolean }) {
  const [image] = parseImages(product.images);
  const discount = discountPercent(product.price, product.oldPrice);
  const caliber = parseSpecs(product.specs).find(([k]) => k === "Կալիբր")?.[1];

  return (
    <Link href={`/products/${product.id}`} className="group card flex flex-col overflow-hidden transition-shadow hover:shadow-lg">
      <div className="relative aspect-square overflow-hidden bg-stone-100 dark:bg-steel-800">
        <Image
          src={image}
          unoptimized={isExternalImage(image)}
          alt={product.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
          {discount > 0 && <span className="badge-sale">−{discount}%</span>}
          {product.isNew && <span className="badge-new">Նոր</span>}
        </div>
        {product.requiresLicense && (
          <span className="badge-license absolute right-2 top-2" title="Պահանջվում է թույլտվություն">
            <ShieldAlert className="h-3 w-3" />
            <span className="hidden sm:inline">Թույլտվությամբ</span>
          </span>
        )}
        {!product.inStock && (
          <span className="absolute inset-x-0 bottom-0 bg-ink/75 py-1.5 text-center text-xs font-medium text-stone-100">Պատվերով</span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className={`text-xs ${inverted ? "text-stone-300" : "text-stone-500 dark:text-stone-400"}`}>
          {product.category?.name}
          {caliber && <span className={inverted ? "text-blaze-300" : "text-steel-600 dark:text-blaze-400"}> · {caliber}</span>}
        </p>
        <h3 className={`mt-1 line-clamp-2 text-[15px] font-medium leading-snug ${inverted ? "text-stone-50 group-hover:text-blaze-300" : "text-ink group-hover:text-steel-700 dark:text-stone-100 dark:group-hover:text-blaze-300"}`}>
          {product.title}
        </h3>
        <div className="mt-auto flex items-baseline gap-2 pt-2">
          <span className={`text-lg font-bold ${inverted ? "text-white" : "text-ink dark:text-stone-50"}`}>{formatPrice(product.price)} ֏</span>
          {discount > 0 && <span className="text-sm text-stone-400 line-through">{formatPrice(product.oldPrice!)} ֏</span>}
        </div>
      </div>
    </Link>
  );
}
