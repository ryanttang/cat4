import type { Product } from "@/lib/db/schema";
import type { ProductCategory } from "@/lib/utils";
import { CATALOG_CATEGORIES } from "@/lib/product-filters";

/** Best representative product per category (from Catalyst catalog import). */
const PREFERRED_CATEGORY_SLUGS: Partial<Record<ProductCategory, string>> = {
  flower: "jet-fuel-14g",
  preroll: "indica-preroll-single-1g",
  cartridge: "strawberry-banana-all-in-one-1g",
  extract: "wedding-cake-badder-1g",
  merch: "cat-4-pod-battery",
};

function productImage(product: Product): string | null {
  return (product.images as string[] | null)?.[0] ?? null;
}

/** Pick the best catalog image to represent a product category. */
export function getCategoryCoverImage(
  products: Product[],
  category: ProductCategory
): string | null {
  const preferredSlug = PREFERRED_CATEGORY_SLUGS[category];
  if (preferredSlug) {
    const preferred = products.find((p) => p.slug === preferredSlug);
    const image = preferred ? productImage(preferred) : null;
    if (image) return image;
  }

  const inCategory = products.filter((p) => p.category === category && p.published);

  const featured = inCategory
    .filter((p) => p.featured)
    .sort((a, b) => (a.featuredOrder ?? 0) - (b.featuredOrder ?? 0));

  for (const product of featured) {
    const image = productImage(product);
    if (image) return image;
  }

  for (const product of inCategory) {
    const image = productImage(product);
    if (image) return image;
  }

  return null;
}

export function getAllCategoryCoverImages(
  products: Product[]
): Record<ProductCategory, string | null> {
  const images = {} as Record<ProductCategory, string | null>;
  for (const cat of CATALOG_CATEGORIES) {
    images[cat.slug] = getCategoryCoverImage(products, cat.slug);
  }
  return images;
}
