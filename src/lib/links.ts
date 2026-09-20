import { brand } from "@/lib/brand";
import type { Product, Survey } from "@/lib/db/schema";

export const LINKS_SETTING_KEY = "links";
export const LINKS_PAGE_PATH = "/links";

export function linksPagePath(slug: string): string {
  return `${LINKS_PAGE_PATH}/${slug}`;
}

export const LINKS_BUTTON_TYPES = [
  "url",
  "product",
  "survey",
  "poll",
  "subscribe",
  "spacer",
] as const;

export type LinksButtonType = (typeof LINKS_BUTTON_TYPES)[number];

export const LINKS_BUTTON_TYPE_LABELS: Record<LinksButtonType, string> = {
  url: "Custom URL",
  product: "Product",
  survey: "Survey",
  poll: "Poll",
  subscribe: "Subscribe",
  spacer: "Space",
};

export type LinksButton = {
  id: string;
  type: LinksButtonType;
  label: string;
  enabled: boolean;
  url?: string;
  productId?: string;
  surveyId?: string;
};

export type LinksPageContent = {
  published: boolean;
  seo: {
    title: string;
    description: string;
  };
  appearance: {
    title: string;
    bio: string;
    heroImageUrl: string;
    logoImageUrl: string;
    heroStyle: "avatar" | "banner";
    backgroundStyle: "brand" | "image";
    backgroundImageUrl: string;
    buttonStyle: "filled" | "outline";
  };
  buttons: LinksButton[];
  products: {
    enabled: boolean;
    heading: string;
    productIds: string[];
  };
  subscribe: {
    modalTitle: string;
    modalBody: string;
  };
};

export type ResolvedLinksButton = {
  id: string;
  type: LinksButtonType;
  label: string;
  href?: string;
};

export type ResolvedLinksProduct = {
  id: string;
  name: string;
  href: string;
  imageUrl: string | null;
};

export type LinksPageViewModel = {
  content: LinksPageContent;
  buttons: ResolvedLinksButton[];
  products: ResolvedLinksProduct[];
};

export const DEFAULT_LINKS_BUTTONS: LinksButton[] = [
  {
    id: "shop",
    type: "url",
    label: "Shop Products",
    enabled: true,
    url: "/products",
  },
  {
    id: "find",
    type: "url",
    label: "Find Near You",
    enabled: true,
    url: "/find",
  },
  {
    id: "subscribe",
    type: "subscribe",
    label: "Subscribe",
    enabled: true,
  },
];

export const DEFAULT_LINKS_PAGE_CONTENT: LinksPageContent = {
  published: true,
  seo: {
    title: "Links",
    description: `Links, products, and updates from ${brand.name}.`,
  },
  appearance: {
    title: brand.name,
    bio: brand.tagline,
    heroImageUrl: "",
    logoImageUrl: "",
    heroStyle: "banner",
    backgroundStyle: "brand",
    backgroundImageUrl: "",
    buttonStyle: "filled",
  },
  buttons: DEFAULT_LINKS_BUTTONS,
  products: {
    enabled: true,
    heading: "Featured products",
    productIds: [],
  },
  subscribe: {
    modalTitle: "Stay in the loop",
    modalBody: "Get updates on new products, events, and exclusive offers.",
  },
};

export function createLinksButton(partial?: Partial<LinksButton>): LinksButton {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `btn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  return {
    id,
    type: "url",
    label: "New button",
    enabled: true,
    url: "/",
    ...partial,
  };
}

export function productDetailHref(product: { category: string; slug: string }): string {
  return `/products/${product.category}/${product.slug}`;
}

export function surveyPageHref(survey: { slug: string; type: Survey["type"] }): string {
  return survey.type === "poll" ? `/poll/${survey.slug}` : `/survey/${survey.slug}`;
}

export function mergeLinksPageContent(
  stored: Partial<LinksPageContent> | null | undefined
): LinksPageContent {
  if (!stored) return DEFAULT_LINKS_PAGE_CONTENT;

  return {
    published: stored.published ?? DEFAULT_LINKS_PAGE_CONTENT.published,
    seo: { ...DEFAULT_LINKS_PAGE_CONTENT.seo, ...stored.seo },
    appearance: { ...DEFAULT_LINKS_PAGE_CONTENT.appearance, ...stored.appearance },
    buttons: stored.buttons ?? DEFAULT_LINKS_PAGE_CONTENT.buttons,
    products: {
      ...DEFAULT_LINKS_PAGE_CONTENT.products,
      ...stored.products,
      productIds: stored.products?.productIds ?? DEFAULT_LINKS_PAGE_CONTENT.products.productIds,
    },
    subscribe: { ...DEFAULT_LINKS_PAGE_CONTENT.subscribe, ...stored.subscribe },
  };
}

export function resolveLinksButtons(
  buttons: LinksButton[],
  deps: {
    productsById: Map<string, { category: string; slug: string; published: boolean }>;
    surveysById: Map<string, { slug: string; type: Survey["type"]; status: string }>;
    includeUnresolved?: boolean;
  }
): ResolvedLinksButton[] {
  const resolved: ResolvedLinksButton[] = [];

  for (const button of buttons) {
    if (!button.enabled) continue;
    if (button.type === "spacer") {
      resolved.push({ id: button.id, type: "spacer", label: "" });
      continue;
    }
    if (!button.label.trim()) continue;

    if (button.type === "subscribe") {
      resolved.push({ id: button.id, type: "subscribe", label: button.label });
      continue;
    }

    if (button.type === "url") {
      const href = button.url?.trim();
      if (!href) continue;
      resolved.push({ id: button.id, type: "url", label: button.label, href });
      continue;
    }

    if (button.type === "product") {
      const product = button.productId ? deps.productsById.get(button.productId) : undefined;
      if (!product?.published) {
        if (deps.includeUnresolved) {
          resolved.push({ id: button.id, type: "product", label: button.label });
        }
        continue;
      }
      resolved.push({
        id: button.id,
        type: "product",
        label: button.label,
        href: productDetailHref(product),
      });
      continue;
    }

    if (button.type === "survey" || button.type === "poll") {
      const survey = button.surveyId ? deps.surveysById.get(button.surveyId) : undefined;
      const isPoll = survey?.type === "poll";
      if (
        !survey ||
        survey.status !== "published" ||
        (button.type === "poll" ? !isPoll : isPoll)
      ) {
        if (deps.includeUnresolved) {
          resolved.push({ id: button.id, type: button.type, label: button.label });
        }
        continue;
      }
      resolved.push({
        id: button.id,
        type: button.type,
        label: button.label,
        href: surveyPageHref(survey),
      });
    }
  }

  return resolved;
}

export function resolveLinksProducts(
  productIds: string[],
  productsById: Map<string, Product>
): ResolvedLinksProduct[] {
  const resolved: ResolvedLinksProduct[] = [];

  for (const id of productIds) {
    const product = productsById.get(id);
    if (!product?.published) continue;
    const images = (product.images ?? []) as string[];
    resolved.push({
      id: product.id,
      name: product.name,
      href: productDetailHref(product),
      imageUrl: images[0] ?? null,
    });
  }

  return resolved;
}

export function buildLinksPageViewModel(
  content: LinksPageContent,
  products: Product[],
  surveys: Survey[],
  options?: { includeUnresolvedButtons?: boolean }
): LinksPageViewModel {
  const productsById = new Map(products.map((product) => [product.id, product]));
  const surveysById = new Map(surveys.map((survey) => [survey.id, survey]));

  return {
    content,
    buttons: resolveLinksButtons(content.buttons, {
      productsById,
      surveysById,
      includeUnresolved: options?.includeUnresolvedButtons,
    }),
    products: content.products.enabled
      ? resolveLinksProducts(content.products.productIds, productsById)
      : [],
  };
}

export function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href);
}
