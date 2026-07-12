/**
 * Brand identity for this deploy.
 *
 * CAT4 is the reference brand. When cloning/white-labeling, edit this file
 * (and Tailwind `cat4.*` tokens — see `.cursor/skills/cat4-platform/white-label.md`).
 * Prefer importing from here over hardcoding the brand name in UI/copy defaults.
 */
export const brand = {
  /** Short machine id — used in storage key prefixes. Keep stable per deploy. */
  id: "cat4",
  /** Display name in chrome, metadata, and default copy. */
  name: "CAT4",
  /** Optional longer legal / entity name (consent, footer). Defaults to `name`. */
  legalName: "CAT4",
  /** Canonical public site URL (no trailing slash). Keep in sync with Vercel AUTH_URL. */
  url: "https://cat4.thcmoc.com",
  tagline: "100% Clean Cannabis",
  description:
    "100% clean cannabis with transparent quality, full-format variety, and value that keeps you coming back.",
  /** Minimum age for the public age gate. */
  ageGateMinYears: 21,
  colors: {
    /** Primary accent — keep in sync with `tailwind.config.ts` → `cat4.blue` / `primary`. */
    primary: "#2252d4",
    dark: "#1A1423",
    light: "#fdfdfd",
    surface: "#231c2e",
  },
  defaults: {
    seedAdminEmail: "admin@cat4.com",
    seedAdminName: "CAT4 Admin",
    marketingConsent: "I agree to receive marketing emails from CAT4. Unsubscribe anytime.",
    promotionConsent: "I agree to the official rules and to receive emails from CAT4.",
    rewardCodePrefix: "CAT4-",
    hubTitle: "CAT4",
    hubLinkLabel: "Visit CAT4",
  },
} as const;

export type Brand = typeof brand;

/** Cookie / localStorage / BroadcastChannel keys — namespaced by `brand.id`. */
export const brandStorageKeys = {
  ageVerified: `${brand.id}-age-verified`,
  analyticsSession: `${brand.id}_analytics_session`,
  homepagePreviewPopout: `${brand.id}-homepage-preview-popout`,
  homepagePreviewChannel: `${brand.id}-homepage-preview`,
} as const;

export function brandMetadataTitle(pageTitle?: string): string {
  if (!pageTitle) return `${brand.name} — ${brand.tagline}`;
  return `${pageTitle} | ${brand.name}`;
}
