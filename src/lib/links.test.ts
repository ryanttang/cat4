import { describe, expect, it } from "vitest";
import {
  DEFAULT_LINKS_PAGE_CONTENT,
  buildLinksPageViewModel,
  linksPagePath,
  mergeLinksPageContent,
  productDetailHref,
  resolveLinksButtons,
  surveyPageHref,
  type LinksButton,
} from "@/lib/links";
import type { Product, Survey } from "@/lib/db/schema";

const now = new Date("2026-01-01T00:00:00.000Z");

function product(overrides: Partial<Product> = {}): Product {
  return {
    id: "00000000-0000-4000-8000-000000000100",
    name: "Test Flower",
    slug: "test-flower",
    category: "flower",
    description: null,
    longDescription: null,
    images: ["/products/test.webp"],
    price: "10",
    compareAtPrice: null,
    classification: null,
    subtype: null,
    size: null,
    thcPercent: null,
    discountPercent: null,
    featured: false,
    featuredOrder: 0,
    published: true,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function survey(overrides: Partial<Survey> = {}): Survey {
  return {
    id: "00000000-0000-4000-8000-000000000200",
    title: "Flavor survey",
    slug: "flavor-survey",
    type: "survey",
    status: "published",
    description: null,
    emailRequired: false,
    publicResultsEnabled: false,
    showResultsAfterVote: false,
    settings: {},
    startsAt: null,
    endsAt: null,
    createdById: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe("links page helpers", () => {
  it("merges stored content over defaults", () => {
    const merged = mergeLinksPageContent({
      appearance: { ...DEFAULT_LINKS_PAGE_CONTENT.appearance, title: "Bio" },
      buttons: [],
    });

    expect(merged.appearance.title).toBe("Bio");
    expect(merged.appearance.bio).toBe(DEFAULT_LINKS_PAGE_CONTENT.appearance.bio);
    expect(merged.buttons).toEqual([]);
    expect(merged.published).toBe(true);
  });

  it("builds product, survey, and links page hrefs", () => {
    expect(linksPagePath("summer")).toBe("/links/summer");
    expect(productDetailHref({ category: "flower", slug: "jet-fuel" })).toBe(
      "/products/flower/jet-fuel"
    );
    expect(surveyPageHref({ slug: "flavor", type: "survey" })).toBe("/survey/flavor");
    expect(surveyPageHref({ slug: "favorite", type: "poll" })).toBe("/poll/favorite");
  });

  it("resolves enabled buttons and skips broken targets", () => {
    const buttons: LinksButton[] = [
      { id: "1", type: "url", label: "Shop", enabled: true, url: "/products" },
      { id: "2", type: "url", label: "Hidden", enabled: false, url: "/about" },
      { id: "3", type: "product", label: "Flower", enabled: true, productId: product().id },
      { id: "4", type: "product", label: "Missing", enabled: true, productId: "nope" },
      {
        id: "5",
        type: "survey",
        label: "Survey",
        enabled: true,
        surveyId: "00000000-0000-4000-8000-000000000200",
      },
      {
        id: "6",
        type: "poll",
        label: "Draft poll",
        enabled: true,
        surveyId: "00000000-0000-4000-8000-000000000201",
      },
      { id: "7", type: "subscribe", label: "Join", enabled: true },
    ];

    const resolved = resolveLinksButtons(buttons, {
      productsById: new Map([[product().id, product()]]),
      surveysById: new Map([
        ["00000000-0000-4000-8000-000000000200", survey()],
        [
          "00000000-0000-4000-8000-000000000201",
          survey({
            id: "00000000-0000-4000-8000-000000000201",
            type: "poll",
            status: "draft",
            slug: "draft-poll",
          }),
        ],
      ]),
    });

    expect(resolved.map((button) => button.id)).toEqual(["1", "3", "5", "7"]);
    expect(resolved[2]?.href).toBe("/survey/flavor-survey");
    expect(resolved[3]?.href).toBeUndefined();
  });

  it("builds a public view model from catalog + surveys", () => {
    const content = mergeLinksPageContent({
      products: {
        enabled: true,
        heading: "Picks",
        productIds: [product().id, "missing"],
      },
      buttons: [{ id: "s", type: "subscribe", label: "Subscribe", enabled: true }],
    });

    const view = buildLinksPageViewModel(content, [product()], [survey()]);
    expect(view.products).toHaveLength(1);
    expect(view.products[0]?.href).toBe("/products/flower/test-flower");
    expect(view.buttons).toHaveLength(1);
  });
});
