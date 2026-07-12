import { getPublishedProducts } from "@/lib/data";
import { ProductCatalog } from "@/components/marketing/product-catalog";
import { CategoryPillNav } from "@/components/marketing/product-collections";
import { parseProductFilters } from "@/lib/product-filters";

export const metadata = { title: "Products" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams;
  const initialFilters = parseProductFilters(params);
  const allProducts = await getPublishedProducts();
  const showCategoryGrid = !initialFilters.category && !initialFilters.q?.trim();

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      {showCategoryGrid && (
        <div className="mb-10">
          <h2 className="mb-4 text-lg font-semibold text-cat4-light">Shop by Category</h2>
          <CategoryPillNav />
        </div>
      )}
      <ProductCatalog products={allProducts} initialFilters={initialFilters} />
    </div>
  );
}
