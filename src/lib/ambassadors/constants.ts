import type { AmbassadorHubDefaults } from "@/lib/db/schema";

export const AMBASSADOR_HUB_DEFAULTS_KEY = "ambassador_hub_defaults";
export const AMBASSADOR_VISIT_COOKIE_PREFIX = "ambassador_visit_";

export const DEFAULT_AMBASSADOR_HUB: AmbassadorHubDefaults = {
  hubTitle: "CAT4",
  hubBio: "Connect with CAT4",
  links: [
    { label: "Shop Products", url: "/products", enabled: true },
    { label: "Subscribe", url: "/subscribe", enabled: true },
    { label: "Follow on Instagram", url: "https://instagram.com", enabled: true },
  ],
};

export function ambassadorVanityPath(slug: string): string {
  return `/a/${slug}`;
}

export function ambassadorDisplayName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim();
}

export function appendAmbassadorUtm(url: string, slug: string): string {
  const isExternal = /^https?:\/\//i.test(url);
  const base = isExternal ? url : `https://cat4.local${url.startsWith("/") ? url : `/${url}`}`;
  const parsed = new URL(base);
  parsed.searchParams.set("utm_source", "ambassador");
  parsed.searchParams.set("utm_medium", slug);
  parsed.searchParams.set("utm_campaign", "hub");
  if (isExternal) return parsed.toString();
  return `${parsed.pathname}${parsed.search}`;
}
