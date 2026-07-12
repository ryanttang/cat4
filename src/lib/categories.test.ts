import { describe, expect, it } from "vitest";
import {
  CATALOG_CATEGORIES,
  PRODUCT_CATEGORIES,
  getAdminCategoryLabel,
  getCatalogCategoryLabel,
  getProductCategoryHref,
  isProductCategory,
} from "@/lib/categories";

describe("categories", () => {
  it("uses the same slugs for admin and catalog lists", () => {
    expect(PRODUCT_CATEGORIES.map((c) => c.slug)).toEqual(CATALOG_CATEGORIES.map((c) => c.slug));
  });

  it("returns context-specific labels", () => {
    expect(getAdminCategoryLabel("cartridge")).toBe("Cartridge");
    expect(getCatalogCategoryLabel("cartridge")).toBe("Vapes");
  });

  it("builds product hrefs", () => {
    expect(getProductCategoryHref("flower")).toBe("/products/flower");
  });

  it("validates category slugs", () => {
    expect(isProductCategory("flower")).toBe(true);
    expect(isProductCategory("invalid")).toBe(false);
  });
});
