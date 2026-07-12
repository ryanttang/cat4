import Link from "next/link";
import Image from "next/image";
import { CATALOG_CATEGORIES } from "@/lib/product-filters";
import type { ProductCategory } from "@/lib/utils";
import { cn } from "@/lib/utils";

const categoryDescriptions: Record<ProductCategory, string> = {
  flower: "Top-shelf buds, indoor grown for quality.",
  preroll: "Hand-rolled and ready when you are.",
  cartridge: "Pods, cartridges, and all-in-one vapes.",
  extract: "Concentrated excellence for the discerning palate.",
  merch: "Rep the brand with CAT4 apparel and gear.",
};

type CategoryImageGridProps = {
  coverImages: Record<ProductCategory, string | null>;
  compact?: boolean;
};

export function CategoryPillNav({ className }: { className?: string }) {
  return (
    <div className={cn("grid grid-cols-5 gap-2 sm:flex sm:flex-wrap sm:gap-3", className)}>
      {CATALOG_CATEGORIES.map((cat) => (
        <Link
          key={cat.slug}
          href={`/products/${cat.slug}`}
          className="inline-flex min-h-10 items-center justify-center rounded-full border border-border bg-cat4-surface px-3 py-2 text-center text-xs font-semibold leading-tight text-cat4-light transition-colors hover:border-cat4-blue/60 hover:bg-cat4-blue hover:text-white sm:min-h-11 sm:px-5 sm:py-2.5 sm:text-sm"
        >
          {cat.label}
        </Link>
      ))}
    </div>
  );
}

export function CategoryImageGrid({ coverImages, compact = false }: CategoryImageGridProps) {
  return (
    <div
      className={
        compact
          ? "grid grid-cols-5 gap-1.5 sm:gap-3 lg:gap-4"
          : "grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5"
      }
    >
      {CATALOG_CATEGORIES.map((cat) => {
        const image = coverImages[cat.slug];
        return (
          <Link
            key={cat.slug}
            href={`/products/${cat.slug}`}
            className={`group overflow-hidden border border-border bg-cat4-surface transition-all hover:border-cat4-blue hover:shadow-lg ${
              compact ? "rounded-lg sm:rounded-xl" : "rounded-xl"
            }`}
          >
            <div className={`relative ${compact ? "aspect-square sm:aspect-[4/3]" : "aspect-square"}`}>
              {image ? (
                <Image
                  src={image}
                  alt={cat.label}
                  fill
                  className={`object-contain transition-transform duration-300 group-hover:scale-105 ${
                    compact ? "p-1.5 sm:p-3" : "p-3"
                  }`}
                  sizes={compact ? "(max-width: 640px) 20vw, 20vw" : "(max-width: 640px) 50vw, 20vw"}
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-cat4-blue/5 text-cat4-blue/30">
                  <span className={`font-bold ${compact ? "text-lg sm:text-3xl" : "text-3xl"}`}>{cat.label[0]}</span>
                </div>
              )}
            </div>
            <div className={compact ? "p-1.5 text-center sm:p-3 sm:text-left" : "p-4"}>
              <h3
                className={`font-semibold text-cat4-light group-hover:text-cat4-blue ${
                  compact ? "text-[10px] leading-tight sm:text-sm" : "text-sm sm:text-lg"
                }`}
              >
                {cat.label}
              </h3>
              {!compact && (
                <p className="mt-1 hidden text-sm text-cat4-light/60 sm:block">{categoryDescriptions[cat.slug]}</p>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export function ProductCollections({
  coverImages,
}: {
  coverImages: Record<ProductCategory, string | null>;
}) {
  return (
    <section className="bg-cat4-primary py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-cat4-light sm:text-4xl">
            Product Collections
          </h2>
          <p className="mt-3 text-lg text-cat4-light/70">
            Explore our full range of premium offerings.
          </p>
        </div>
        <div className="mt-12">
          <CategoryImageGrid coverImages={coverImages} />
        </div>
      </div>
    </section>
  );
}
