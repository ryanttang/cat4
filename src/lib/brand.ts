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
    surveyDisclaimer:
      "You must be 21 years of age or older to participate. By submitting this form, you confirm that the information you provide is accurate. CAT4 may use your responses to understand customer preferences and to improve products, events, and communications. If this survey is connected to a promotion, sweepstakes, or prize, official rules apply and no purchase is necessary unless otherwise stated. Limit one submission per person unless the survey says otherwise. CAT4 is not responsible for incomplete, lost, or misdirected submissions.",
    surveyParticipationConsent:
      "I confirm that I am 21 years of age or older and that I have read the disclaimer. I agree to participate in this survey and I consent to CAT4 collecting, storing, and using my responses and the contact information I provide for this survey.",
    surveyMarketingConsent:
      "I agree to receive marketing emails, product updates, event invitations, and other promotional messages from CAT4. I understand I can unsubscribe at any time using the link in any email or by contacting CAT4.",
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
