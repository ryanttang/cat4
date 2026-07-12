import type { Product } from "@/lib/db/schema";
import {
  CATALOG_CATEGORIES,
  getCatalogCategoryLabel,
  type ProductCategory,
} from "@/lib/categories";
import { SIZE_SORT_FALLBACK } from "@/lib/constants";

export { CATALOG_CATEGORIES, getCatalogCategoryLabel };

export type ProductSort = "popular" | "name" | "price-asc" | "price-desc";

export type ProductFilters = {
  category?: ProductCategory;
  subtype?: string;
  classification?: string;
  size?: string;
  deals?: boolean;
  sort?: ProductSort;
  q?: string;
};

export function normalizeClassification(value: string | null | undefined): string | null {
  if (!value) return null;
  if (value.toLowerCase() === "i/s") return "Indica";
  return value;
}

export function inferSubtype(name: string, category: ProductCategory): string | null {
  const n = name.toLowerCase();
  if (n.includes("battery")) return "Battery";
  if (n.includes("all in one")) return "All in One";
  if (n.includes("pod")) return "Pod";
  if (n.includes("cartridge")) return "Cartridge";
  if (n.includes("infused") && (n.includes("pre-roll") || n.includes("preroll"))) return "Infused Pre-roll";
  if (n.includes("pre-roll") || n.includes("preroll")) return "Pre-roll";
  if (n.includes("badder")) return "Badder";
  if (n.includes("rosin")) return "Rosin";
  if (n.includes("shake")) return "Shake";
  if (category === "flower") return "Flower";
  if (category === "merch") return "Merch";
  return null;
}

export function productHasDeal(product: Product): boolean {
  if (product.discountPercent != null && product.discountPercent > 0) return true;
  if (!product.price || !product.compareAtPrice) return false;
  return Number(product.compareAtPrice) > Number(product.price);
}

export function getFilterOptions(products: Product[]) {
  const categories = CATALOG_CATEGORIES.filter((c) =>
    products.some((p) => p.category === c.slug)
  );

  const subtypes = [...new Set(products.map((p) => p.subtype).filter(Boolean) as string[])].sort();
  const classifications = [
    ...new Set(
      products.map((p) => normalizeClassification(p.classification)).filter(Boolean) as string[]
    ),
  ].sort();
  const sizes = [...new Set(products.map((p) => p.size).filter(Boolean) as string[])].sort(
    (a, b) => parseSizeValue(a) - parseSizeValue(b)
  );

  return { categories, subtypes, classifications, sizes };
}

function parseSizeValue(size: string): number {
  const match = size.match(/^([\d.]+)\s*G/i);
  return match ? Number.parseFloat(match[1]) : SIZE_SORT_FALLBACK;
}

function matchesProductSearch(product: Product, query: string): boolean {
  const haystack = [product.name, product.slug, product.description]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

export function filterProducts(products: Product[], filters: ProductFilters): Product[] {
  const searchQuery = filters.q?.trim().toLowerCase();

  let result = products.filter((p) => {
    if (searchQuery && !matchesProductSearch(p, searchQuery)) return false;
    if (filters.category && p.category !== filters.category) return false;
    if (filters.subtype && p.subtype !== filters.subtype) return false;
    if (
      filters.classification &&
      normalizeClassification(p.classification) !== filters.classification
    ) {
      return false;
    }
    if (filters.size && p.size !== filters.size) return false;
    if (filters.deals && !productHasDeal(p)) return false;
    return true;
  });

  result = sortProducts(result, filters.sort ?? "popular");
  return result;
}

export function sortProducts(products: Product[], sort: ProductSort): Product[] {
  const copy = [...products];
  switch (sort) {
    case "name":
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    case "price-asc":
      return copy.sort((a, b) => Number(a.price ?? 0) - Number(b.price ?? 0));
    case "price-desc":
      return copy.sort((a, b) => Number(b.price ?? 0) - Number(a.price ?? 0));
    case "popular":
    default:
      return copy.sort((a, b) => {
        if (a.featured !== b.featured) return a.featured ? -1 : 1;
        if (a.featured && b.featured) {
          return (a.featuredOrder ?? 0) - (b.featuredOrder ?? 0);
        }
        return a.name.localeCompare(b.name);
      });
  }
}

export function parseProductFilters(searchParams: Record<string, string | string[] | undefined>): ProductFilters {
  const get = (key: string) => {
    const v = searchParams[key];
    return typeof v === "string" ? v : undefined;
  };

  const category = get("category") as ProductCategory | undefined;
  const validCategory = CATALOG_CATEGORIES.some((c) => c.slug === category) ? category : undefined;

  const sort = get("sort") as ProductSort | undefined;
  const validSort = ["popular", "name", "price-asc", "price-desc"].includes(sort ?? "")
    ? sort
    : "popular";

  const q = get("q")?.trim();

  return {
    category: validCategory,
    subtype: get("subtype"),
    classification: get("classification"),
    size: get("size"),
    deals: get("deals") === "true",
    sort: validSort,
    q: q || undefined,
  };
}

export function serializeProductFilters(filters: ProductFilters): string {
  const params = new URLSearchParams();
  if (filters.category) params.set("category", filters.category);
  if (filters.subtype) params.set("subtype", filters.subtype);
  if (filters.classification) params.set("classification", filters.classification);
  if (filters.size) params.set("size", filters.size);
  if (filters.deals) params.set("deals", "true");
  if (filters.q?.trim()) params.set("q", filters.q.trim());
  if (filters.sort && filters.sort !== "popular") params.set("sort", filters.sort);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function buildFilterQuery(
  current: ProductFilters,
  update: Partial<ProductFilters>,
  resetKeys: Array<keyof ProductFilters> = []
): string {
  const next: ProductFilters = { ...current, ...update };
  for (const key of resetKeys) {
    delete next[key];
  }
  return serializeProductFilters(next);
}

export function activeFilterCount(filters: ProductFilters): number {
  let count = 0;
  if (filters.category) count++;
  if (filters.subtype) count++;
  if (filters.classification) count++;
  if (filters.size) count++;
  if (filters.deals) count++;
  if (filters.q?.trim()) count++;
  return count;
}
