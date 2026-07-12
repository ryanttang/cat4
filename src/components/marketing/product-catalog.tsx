"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { ProductCard } from "@/components/marketing/product-card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  activeFilterCount,
  filterProducts,
  getCatalogCategoryLabel,
  getFilterOptions,
  serializeProductFilters,
  type ProductFilters,
  type ProductSort,
} from "@/lib/product-filters";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/db/schema";

type ProductCatalogProps = {
  products: Product[];
  initialFilters?: ProductFilters;
  title?: string;
  description?: string;
  basePath?: string;
  categoryImage?: string | null;
};

function FilterSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border py-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-left text-sm font-semibold text-cat4-light"
      >
        {title}
        <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
      </button>
      {open && <div className="mt-3 space-y-1">{children}</div>}
    </div>
  );
}

function FilterOption({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors",
        active
          ? "bg-cat4-blue/10 font-medium text-cat4-blue"
          : "text-cat4-light/80 hover:bg-muted hover:text-cat4-light"
      )}
    >
      <span>{label}</span>
      <span className="text-xs text-cat4-light/50">{count}</span>
    </button>
  );
}

export function ProductCatalog({
  products,
  initialFilters = {},
  title = "CAT4 Cannabis Products",
  description = "Browse the full CAT4 catalog with Bellflower pricing.",
  basePath = "/products",
  categoryImage,
}: ProductCatalogProps) {
  const router = useRouter();
  const [filters, setFilters] = useState<ProductFilters>(initialFilters);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const options = useMemo(() => getFilterOptions(products), [products]);
  const filtered = useMemo(() => filterProducts(products, filters), [products, filters]);

  function navigate(next: ProductFilters) {
    setFilters(next);
    router.replace(`${basePath}${serializeProductFilters(next)}`, { scroll: false });
  }

  function updateFilters(update: Partial<ProductFilters>, resetKeys: Array<keyof ProductFilters> = []) {
    const next = { ...filters, ...update };
    for (const key of resetKeys) delete next[key];
    navigate(next);
  }

  function clearFilters() {
    navigate({ sort: filters.sort ?? "popular" });
  }

  function countFor(partial: Partial<ProductFilters>): number {
    return filterProducts(products, { ...filters, ...partial }).length;
  }

  const filterPanel = (
    <div className="space-y-1">
      <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 p-3">
        <div>
          <Label htmlFor="deals-toggle" className="text-sm font-semibold">
            Deals
          </Label>
          <p className="text-xs text-cat4-light/60">Show discounted products only</p>
        </div>
        <Switch
          id="deals-toggle"
          checked={Boolean(filters.deals)}
          onCheckedChange={(checked) => updateFilters({ deals: checked || undefined }, checked ? [] : ["deals"])}
        />
      </div>

      <FilterSection title="Category" defaultOpen>
        <FilterOption
          label="All Categories"
          count={products.length}
          active={!filters.category}
          onClick={() => updateFilters({}, ["category", "subtype"])}
        />
        {options.categories.map((cat) => (
          <FilterOption
            key={cat.slug}
            label={cat.label}
            count={filterProducts(products, { category: cat.slug }).length}
            active={filters.category === cat.slug}
            onClick={() => updateFilters({ category: cat.slug }, ["subtype"])}
          />
        ))}
      </FilterSection>

      {options.subtypes.length > 0 && (
        <FilterSection title="Subtype">
          <FilterOption
            label="All Subtypes"
            count={countFor({ subtype: undefined })}
            active={!filters.subtype}
            onClick={() => updateFilters({}, ["subtype"])}
          />
          {options.subtypes.map((subtype) => (
            <FilterOption
              key={subtype}
              label={subtype}
              count={countFor({ subtype })}
              active={filters.subtype === subtype}
              onClick={() => updateFilters({ subtype })}
            />
          ))}
        </FilterSection>
      )}

      {options.classifications.length > 0 && (
        <FilterSection title="Classification">
          <FilterOption
            label="All Classifications"
            count={countFor({ classification: undefined })}
            active={!filters.classification}
            onClick={() => updateFilters({}, ["classification"])}
          />
          {options.classifications.map((classification) => (
            <FilterOption
              key={classification}
              label={classification}
              count={countFor({ classification })}
              active={filters.classification === classification}
              onClick={() => updateFilters({ classification })}
            />
          ))}
        </FilterSection>
      )}

      {options.sizes.length > 0 && (
        <FilterSection title="Size">
          <FilterOption
            label="All Sizes"
            count={countFor({ size: undefined })}
            active={!filters.size}
            onClick={() => updateFilters({}, ["size"])}
          />
          {options.sizes.map((size) => (
            <FilterOption
              key={size}
              label={size}
              count={countFor({ size })}
              active={filters.size === size}
              onClick={() => updateFilters({ size })}
            />
          ))}
        </FilterSection>
      )}

      {activeFilterCount(filters) > 0 && (
        <Button variant="outline" size="sm" className="mt-4 w-full" onClick={clearFilters}>
          Clear all filters
        </Button>
      )}
    </div>
  );

  return (
    <div>
      <div className="mb-8">
        {categoryImage && (
          <div className="relative mb-6 aspect-[21/9] max-h-56 overflow-hidden rounded-xl bg-cat4-surface">
            <Image
              src={categoryImage}
              alt=""
              fill
              className="object-contain p-6"
              sizes="(max-width: 1280px) 100vw, 1280px"
              priority
            />
          </div>
        )}
        <h1 className="text-4xl font-bold text-cat4-light">{title}</h1>
        <p className="mt-3 text-lg text-cat4-light/70">{description}</p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-24 rounded-xl border border-border bg-cat4-surface p-4 shadow-sm">
            <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-cat4-light/70">
              Product Filters
            </h2>
            <p className="mb-4 text-xs text-cat4-light/50">({products.length} total)</p>
            {filterPanel}
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-cat4-surface p-4">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="lg:hidden"
                onClick={() => setMobileFiltersOpen(true)}
              >
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Filter
                {activeFilterCount(filters) > 0 && (
                  <span className="ml-2 rounded-full bg-cat4-blue px-2 py-0.5 text-xs text-white">
                    {activeFilterCount(filters)}
                  </span>
                )}
              </Button>
              <p className="text-sm font-medium text-cat4-light">
                FILTER <span className="text-cat4-light/60">({filtered.length} results)</span>
              </p>
            </div>

            <Select
              value={filters.sort ?? "popular"}
              onValueChange={(value) => updateFilters({ sort: value as ProductSort })}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Popular</SelectItem>
                <SelectItem value="name">Name (A–Z)</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filters.q?.trim() && (
            <p className="mb-4 text-sm text-cat4-light/70">
              Search: <span className="font-medium">&ldquo;{filters.q.trim()}&rdquo;</span>
            </p>
          )}

          {filters.category && (
            <p className="mb-4 text-sm text-cat4-light/70">
              Category: <span className="font-medium">{getCatalogCategoryLabel(filters.category)}</span>
            </p>
          )}

          <div className="grid grid-cols-3 gap-2 sm:gap-4 lg:gap-6">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="rounded-xl border border-dashed p-12 text-center">
              <p className="text-cat4-light/60">
                {filters.q?.trim()
                  ? `No products match "${filters.q.trim()}".`
                  : "No products match your filters."}
              </p>
              <Button variant="outline" className="mt-4" onClick={clearFilters}>
                Clear filters
              </Button>
            </div>
          )}
        </div>
      </div>

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-full max-w-sm flex-col bg-cat4-surface shadow-xl">
            <div className="flex items-center justify-between border-b p-4">
              <h2 className="font-bold text-cat4-light">Product Filters</h2>
              <Button variant="ghost" size="icon" onClick={() => setMobileFiltersOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">{filterPanel}</div>
            <div className="border-t p-4">
              <Button className="w-full" onClick={() => setMobileFiltersOpen(false)}>
                Show {filtered.length} results
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
