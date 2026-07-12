import Image from "next/image";
import Link from "next/link";
import { formatPriceDisplay } from "@/lib/utils";
import type { Product } from "@/lib/db/schema";

export function MiniProductCard({ product }: { product: Product }) {
  const image = product.images && (product.images as string[])[0];
  const price = formatPriceDisplay(product.price);

  return (
    <Link
      href={`/products/${product.category}/${product.slug}`}
      className="group flex overflow-hidden rounded-xl border border-border bg-cat4-surface transition-all hover:border-cat4-blue hover:shadow-md"
    >
      <div className="relative h-14 w-14 shrink-0 bg-cat4-primary/80 sm:h-20 sm:w-20">
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            className="object-contain p-1.5 transition-transform group-hover:scale-105 sm:p-2"
            sizes="80px"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-lg font-bold text-cat4-blue/40">
            {product.name[0]}
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center px-2 py-1.5 sm:px-3 sm:py-2">
        <h4 className="line-clamp-2 text-xs font-semibold leading-snug text-cat4-light group-hover:text-cat4-blue sm:text-sm">
          {product.name}
        </h4>
        {price && <p className="mt-0.5 text-xs font-medium text-cat4-blue">{price}</p>}
      </div>
    </Link>
  );
}
