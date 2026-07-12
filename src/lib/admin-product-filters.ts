import type { Product } from "@/lib/db/schema";
import { PRODUCT_CATEGORIES, type ProductCategory } from "@/lib/categories";

export type AdminProductSort =
  | "updated-desc"
  | "updated-asc"
  | "name-asc"
  | "name-desc"
  | "category-asc"
  | "category-desc"
  | "price-asc"
  | "price-desc"
  | "status-asc"
  | "status-desc"
  | "featured-asc"
  | "featured-desc";

export type AdminProductSortColumn = "name" | "category" | "price" | "status" | "featured";

export type AdminProductStatusFilter = "all" | "published" | "draft";
export type AdminProductFeaturedFilter = "all" | "yes" | "no";

export type AdminProductFilters = {
  search: string;
  category: ProductCategory | "all";
  status: AdminProductStatusFilter;
  featured: AdminProductFeaturedFilter;
  sort: AdminProductSort;
};

export const DEFAULT_ADMIN_PRODUCT_FILTERS: AdminProductFilters = {
  search: "",
  category: "all",
  status: "all",
  featured: "all",
  sort: "updated-desc",
};

export function filterAdminProducts(
  products: Product[],
  filters: AdminProductFilters
): Product[] {
  const query = filters.search.trim().toLowerCase();

  let result = products.filter((product) => {
    if (query) {
      const haystack = [product.name, product.slug, product.description]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(query)) return false;
    }

    if (filters.category !== "all" && product.category !== filters.category) {
      return false;
    }

    if (filters.status === "published" && !product.published) return false;
    if (filters.status === "draft" && product.published) return false;

    if (filters.featured === "yes" && !product.featured) return false;
    if (filters.featured === "no" && product.featured) return false;

    return true;
  });

  result = sortAdminProducts(result, filters.sort);
  return result;
}

export function sortAdminProducts(products: Product[], sort: AdminProductSort): Product[] {
  const copy = [...products];

  switch (sort) {
    case "name-asc":
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    case "name-desc":
      return copy.sort((a, b) => b.name.localeCompare(a.name));
    case "updated-asc":
      return copy.sort((a, b) => a.updatedAt.getTime() - b.updatedAt.getTime());
    case "category-asc":
      return copy.sort((a, b) => {
        const categoryCompare = a.category.localeCompare(b.category);
        return categoryCompare !== 0 ? categoryCompare : a.name.localeCompare(b.name);
      });
    case "category-desc":
      return copy.sort((a, b) => {
        const categoryCompare = b.category.localeCompare(a.category);
        return categoryCompare !== 0 ? categoryCompare : a.name.localeCompare(b.name);
      });
    case "price-asc":
      return copy.sort((a, b) => Number(a.price ?? 0) - Number(b.price ?? 0));
    case "price-desc":
      return copy.sort((a, b) => Number(b.price ?? 0) - Number(a.price ?? 0));
    case "status-asc":
      return copy.sort((a, b) => {
        if (a.published !== b.published) return a.published ? 1 : -1;
        return a.name.localeCompare(b.name);
      });
    case "status-desc":
      return copy.sort((a, b) => {
        if (a.published !== b.published) return a.published ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
    case "featured-asc":
      return copy.sort((a, b) => {
        if (a.featured !== b.featured) return a.featured ? 1 : -1;
        return a.name.localeCompare(b.name);
      });
    case "featured-desc":
      return copy.sort((a, b) => {
        if (a.featured !== b.featured) return a.featured ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
    case "updated-desc":
    default:
      return copy.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }
}

export function adminProductFiltersActive(filters: AdminProductFilters): boolean {
  return (
    filters.search.trim() !== "" ||
    filters.category !== "all" ||
    filters.status !== "all" ||
    filters.featured !== "all" ||
    filters.sort !== DEFAULT_ADMIN_PRODUCT_FILTERS.sort
  );
}

export function getSortDirection(
  sort: AdminProductSort,
  column: AdminProductSortColumn
): "asc" | "desc" | null {
  if (sort === `${column}-asc`) return "asc";
  if (sort === `${column}-desc`) return "desc";
  return null;
}

export function getNextSortForColumn(
  current: AdminProductSort,
  column: AdminProductSortColumn
): AdminProductSort {
  if (current === `${column}-asc`) return `${column}-desc` as AdminProductSort;
  return `${column}-asc` as AdminProductSort;
}

export const ADMIN_PRODUCT_CATEGORY_OPTIONS = [
  { value: "all", label: "All categories" },
  ...PRODUCT_CATEGORIES.map((category) => ({
    value: category.slug,
    label: category.label,
  })),
];
