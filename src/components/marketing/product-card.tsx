"use client";

import Link from "next/link";
import Image from "next/image";
import { getCategoryLabel, formatPriceDisplay } from "@/lib/utils";
import { productHasDeal } from "@/lib/product-filters";
import type { Product } from "@/lib/db/schema";

export function ProductCard({ product }: { product: Product }) {
  const image = product.images && (product.images as string[])[0];
  const price = formatPriceDisplay(product.price);
  const compareAt = formatPriceDisplay(product.compareAtPrice);
  const onSale = productHasDeal(product);

  return (
    <Link
      href={`/products/${product.category}/${product.slug}`}
      className="group relative overflow-hidden rounded-xl border border-border bg-cat4-surface transition-all hover:border-cat4-blue hover:shadow-lg"
    >
      {onSale && product.discountPercent && (
        <div className="absolute left-0 top-2 z-10 rounded-r bg-yellow-400 px-2 py-1 text-xs font-bold uppercase text-black shadow-sm">
          {product.discountPercent}% off
        </div>
      )}
      <div className="relative aspect-square">
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            className="object-contain p-3 transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-cat4-blue/5 text-cat4-blue/30">
            <span className="text-5xl font-bold">{product.name[0]}</span>
          </div>
        )}
      </div>
      <div className="p-2.5 sm:p-4">
        <div className="flex items-center justify-between gap-1.5 sm:gap-2">
          <span className="text-[10px] font-medium uppercase tracking-wider text-cat4-blue sm:text-xs">
            {getCategoryLabel(product.category)}
          </span>
          {product.classification && (
            <span className="rounded bg-cat4-blue px-1.5 py-0.5 text-[10px] font-semibold text-white sm:px-2 sm:text-xs">
              {product.classification}
            </span>
          )}
        </div>
        <h3 className="mt-1 text-sm font-semibold leading-snug text-cat4-light group-hover:text-cat4-blue sm:text-base">
          {product.name}
        </h3>
        {price && (
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 sm:mt-2 sm:gap-2">
            <span className="text-base font-semibold text-cat4-light sm:text-lg">{price}</span>
            {compareAt && compareAt !== price && (
              <span className="text-xs text-cat4-light/50 line-through sm:text-sm">{compareAt}</span>
            )}
            {product.size && (
              <span className="ml-auto text-[10px] text-cat4-light/60 sm:text-xs">{product.size}</span>
            )}
          </div>
        )}
        {product.description && (
          <p className="mt-1 hidden line-clamp-2 text-sm text-cat4-light/60 sm:block">{product.description}</p>
        )}
      </div>
    </Link>
  );
}
