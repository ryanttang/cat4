"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, ArrowDown, ArrowUp, ArrowUpDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdminTableThumbnail, adminTableWrapClass } from "@/components/admin/admin-ui";
import {
  ADMIN_PRODUCT_CATEGORY_OPTIONS,
  DEFAULT_ADMIN_PRODUCT_FILTERS,
  adminProductFiltersActive,
  filterAdminProducts,
  getNextSortForColumn,
  getSortDirection,
  type AdminProductFilters,
  type AdminProductFeaturedFilter,
  type AdminProductSortColumn,
  type AdminProductStatusFilter,
} from "@/lib/admin-product-filters";
import { cn, formatPriceDisplay, getCategoryLabel } from "@/lib/utils";
import type { Product, QrCode } from "@/lib/db/schema";
import type { ProductCategory } from "@/lib/categories";
import { ProductQrCell } from "@/components/admin/product-qr-dialog";

type ProductsTableProps = {
  products: Product[];
  qrByProductId?: Record<string, QrCode>;
  scanCounts?: Record<string, number>;
  onEdit?: (product: Product) => void;
  onConfigureQr?: (product: Product) => void;
};

function SortableHeader({
  label,
  column,
  sort,
  onSort,
  className,
}: {
  label: string;
  column: AdminProductSortColumn;
  sort: AdminProductFilters["sort"];
  onSort: (column: AdminProductSortColumn) => void;
  className?: string;
}) {
  const direction = getSortDirection(sort, column);
  const Icon = direction === "asc" ? ArrowUp : direction === "desc" ? ArrowDown : ArrowUpDown;

  return (
    <th className={cn("p-0", className)}>
      <button
        type="button"
        onClick={() => onSort(column)}
        className={cn(
          "flex w-full items-center gap-1.5 p-4 text-left text-sm font-medium transition-colors hover:text-foreground",
          direction ? "text-foreground" : "text-muted-foreground"
        )}
      >
        <span>{label}</span>
        <Icon className={cn("h-3.5 w-3.5 shrink-0", !direction && "opacity-50")} />
      </button>
    </th>
  );
}

export function ProductsTable({
  products,
  qrByProductId = {},
  scanCounts = {},
  onEdit,
  onConfigureQr,
}: ProductsTableProps) {
  const [filters, setFilters] = useState<AdminProductFilters>(DEFAULT_ADMIN_PRODUCT_FILTERS);

  const filteredProducts = useMemo(
    () => filterAdminProducts(products, filters),
    [products, filters]
  );

  function updateFilters(update: Partial<AdminProductFilters>) {
    setFilters((current) => ({ ...current, ...update }));
  }

  function clearFilters() {
    setFilters(DEFAULT_ADMIN_PRODUCT_FILTERS);
  }

  function handleColumnSort(column: AdminProductSortColumn) {
    setFilters((current) => ({
      ...current,
      sort: getNextSortForColumn(current.sort, column),
    }));
  }

  const hasActiveFilters = adminProductFiltersActive(filters);

  return (
    <div className="mt-8 space-y-4">
      <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={filters.search}
              onChange={(event) => updateFilters({ search: event.target.value })}
              placeholder="Search by name, slug, or description..."
              className="pl-9"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Select
              value={filters.category}
              onValueChange={(value) =>
                updateFilters({ category: value as ProductCategory | "all" })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {ADMIN_PRODUCT_CATEGORY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.status}
              onValueChange={(value) =>
                updateFilters({ status: value as AdminProductStatusFilter })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.featured}
              onValueChange={(value) =>
                updateFilters({ featured: value as AdminProductFeaturedFilter })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Featured" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All products</SelectItem>
                <SelectItem value="yes">Featured only</SelectItem>
                <SelectItem value="no">Not featured</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
          <p>
            Showing {filteredProducts.length} of {products.length} products
          </p>
          {hasActiveFilters && (
            <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
              <X className="mr-2 h-4 w-4" />
              Clear filters
            </Button>
          )}
        </div>
      </div>

      <div className={cn(adminTableWrapClass, "mt-0")}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left">
              <SortableHeader label="Name" column="name" sort={filters.sort} onSort={handleColumnSort} />
              <SortableHeader
                label="Category"
                column="category"
                sort={filters.sort}
                onSort={handleColumnSort}
              />
              <SortableHeader label="Price" column="price" sort={filters.sort} onSort={handleColumnSort} />
              <SortableHeader label="Status" column="status" sort={filters.sort} onSort={handleColumnSort} />
              <SortableHeader
                label="Featured"
                column="featured"
                sort={filters.sort}
                onSort={handleColumnSort}
              />
              <th className="p-4 text-muted-foreground">QR</th>
              <th className="p-4" />
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr
                key={product.id}
                className="border-b border-border/50 transition-colors hover:bg-muted/30"
              >
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <AdminTableThumbnail
                      src={(product.images as string[] | undefined)?.[0]}
                      alt={product.name}
                    />
                    <span className="font-medium">{product.name}</span>
                  </div>
                </td>
                <td className="p-4">{getCategoryLabel(product.category)}</td>
                <td className="p-4">{formatPriceDisplay(product.price) ?? "—"}</td>
                <td className="p-4">
                  <Badge variant={product.published ? "success" : "secondary"}>
                    {product.published ? "Published" : "Draft"}
                  </Badge>
                </td>
                <td className="p-4">{product.featured ? "Yes" : "—"}</td>
                <td className="p-4">
                  {onConfigureQr ? (
                    <ProductQrCell
                      product={product}
                      qrCode={qrByProductId[product.id] ?? null}
                      scanCount={
                        qrByProductId[product.id]
                          ? scanCounts[qrByProductId[product.id].id] ?? 0
                          : 0
                      }
                      onOpen={onConfigureQr}
                    />
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="p-4">
                  {onEdit ? (
                    <Button type="button" variant="ghost" size="sm" onClick={() => onEdit(product)}>
                      Edit
                    </Button>
                  ) : (
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/admin/products/${product.id}`}>Edit</Link>
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {products.length === 0 && (
          <p className="p-8 text-center text-muted-foreground">No products yet.</p>
        )}
        {products.length > 0 && filteredProducts.length === 0 && (
          <p className="p-8 text-center text-muted-foreground">
            No products match your search or filters.
          </p>
        )}
      </div>
    </div>
  );
}
