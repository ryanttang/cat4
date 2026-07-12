import {
  CATALOG_CATEGORIES,
  getProductCategoryHref,
} from "@/lib/categories";
import { getPublishedLandingPages } from "@/lib/data";

export type FooterLink = { href: string; label: string };

const STATIC_COMPANY_LINKS: FooterLink[] = [
  { href: "/about", label: "About" },
  { href: "/education", label: "Education" },
  { href: "/find", label: "Where to Find" },
  { href: "/subscribe", label: "Subscribe" },
];

export function getProductFooterLinks(): FooterLink[] {
  return CATALOG_CATEGORIES.map((cat) => ({
    href: getProductCategoryHref(cat.slug),
    label: cat.label,
  }));
}

export async function getFooterLinks(): Promise<{
  products: FooterLink[];
  company: FooterLink[];
}> {
  const publishedPages = await getPublishedLandingPages();
  const promotionLinks: FooterLink[] = publishedPages.map((page) => ({
    href: `/l/${page.slug}`,
    label: page.title,
  }));

  return {
    products: getProductFooterLinks(),
    company: [...STATIC_COMPANY_LINKS, ...promotionLinks],
  };
}
