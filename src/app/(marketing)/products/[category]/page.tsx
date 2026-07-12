import { notFound } from "next/navigation";
import { getPublishedProducts } from "@/lib/data";
import { ProductCatalog } from "@/components/marketing/product-catalog";
import {
  getCatalogCategoryLabel,
  parseProductFilters,
} from "@/lib/product-filters";
import { getCategoryCoverImage } from "@/lib/category-images";
import { PRODUCT_CATEGORIES, type ProductCategory } from "@/lib/utils";

type Props = {
  params: Promise<{ category: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props) {
  const { category } = await params;
  const valid = PRODUCT_CATEGORIES.some((c) => c.slug === category);
  if (!valid) return { title: "Products" };
  return { title: getCatalogCategoryLabel(category as ProductCategory) };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { category } = await params;
  const valid = PRODUCT_CATEGORIES.some((c) => c.slug === category);
  if (!valid) notFound();

  const paramsResolved = await searchParams;
  const initialFilters = {
    ...parseProductFilters(paramsResolved),
    category: category as ProductCategory,
  };

  const allProducts = await getPublishedProducts();
  const label = getCatalogCategoryLabel(category as ProductCategory);
  const categoryImage = getCategoryCoverImage(allProducts, category as ProductCategory);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <ProductCatalog
        products={allProducts}
        initialFilters={initialFilters}
        title={label}
        description={`Explore CAT4 ${label.toLowerCase()} — filter by subtype, classification, size, and deals.`}
        basePath={`/products/${category}`}
        categoryImage={categoryImage}
      />
    </div>
  );
}
