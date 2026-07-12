/** Single source of truth for product category slugs and display labels. */
const CATEGORY_DEFINITIONS = [
  { slug: "flower", adminLabel: "Flower", catalogLabel: "Flower" },
  { slug: "preroll", adminLabel: "Preroll", catalogLabel: "Prerolls" },
  { slug: "cartridge", adminLabel: "Cartridge", catalogLabel: "Vapes" },
  { slug: "extract", adminLabel: "Extract", catalogLabel: "Concentrates" },
  { slug: "merch", adminLabel: "Merch", catalogLabel: "Merch" },
] as const;

export type ProductCategory = (typeof CATEGORY_DEFINITIONS)[number]["slug"];

export const PRODUCT_CATEGORY_SLUGS = CATEGORY_DEFINITIONS.map((c) => c.slug) as [
  ProductCategory,
  ...ProductCategory[],
];

/** Admin CMS labels (product forms, admin tables). */
export const PRODUCT_CATEGORIES: Array<{ slug: ProductCategory; label: string }> =
  CATEGORY_DEFINITIONS.map((c) => ({ slug: c.slug, label: c.adminLabel }));

/** Public catalog / marketing labels. */
export const CATALOG_CATEGORIES: Array<{ slug: ProductCategory; label: string }> =
  CATEGORY_DEFINITIONS.map((c) => ({ slug: c.slug, label: c.catalogLabel }));

export function getAdminCategoryLabel(slug: string): string {
  return PRODUCT_CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;
}

export function getCatalogCategoryLabel(category: ProductCategory): string {
  return CATALOG_CATEGORIES.find((c) => c.slug === category)?.label ?? category;
}

export function getProductCategoryHref(slug: ProductCategory): string {
  return `/products/${slug}`;
}

export function isProductCategory(slug: string): slug is ProductCategory {
  return PRODUCT_CATEGORY_SLUGS.includes(slug as ProductCategory);
}
