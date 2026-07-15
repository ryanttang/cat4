import { DEFAULT_HERO_YOUTUBE_URL } from "@/lib/hero-video";
import type { LandingPage, LandingPageBlock } from "@/lib/db/schema";

export const MOCK_SWEEPSTAKES_ID = "00000000-0000-4000-8000-000000000050";

const sweepstakesStart = new Date("2026-01-01T00:00:00.000Z");
const sweepstakesEnd = new Date("2026-12-31T23:59:59.000Z");
const seededAt = new Date("2026-01-01T00:00:00.000Z");

export const MOCK_SWEEPSTAKES_BLOCKS: LandingPageBlock = {
  hero: {
    headline: "Win a Year's Supply of CAT4",
    subheadline: "Join now for your chance to win premium products delivered all year long.",
    videoUrl: DEFAULT_HERO_YOUTUBE_URL,
  },
  prize: {
    label: "Grand Prize",
    title: "Grand Prize — $2,000+ Value",
    description:
      "One winner receives a full year of CAT4 products including cartridges, flower, extracts, and exclusive merch.",
  },
  prizes: [
    {
      label: "Grand Prize",
      title: "Grand Prize — $2,000+ Value",
      description:
        "One winner receives a full year of CAT4 products including cartridges, flower, extracts, and exclusive merch.",
    },
    {
      label: "Second Prize",
      title: "Runner-Up Prize Pack",
      description: "Five winners receive a curated CAT4 product bundle valued at $200+ MSRP.",
    },
  ],
  howItWorks: {
    title: "How It Works",
    steps: [
      {
        title: "Join the promotion",
        description: "Click Join Now and complete our quick entry wizard.",
      },
      {
        title: "Submit your entry",
        description: "Tell us a bit about yourself — it only takes a minute.",
      },
      {
        title: "Win big",
        description: "Winners will be selected when the promotion ends.",
      },
    ],
  },
  keyDetails: {
    title: "Key Details",
    promotionPeriod: "January 1, 2026 through December 31, 2026",
    eligibleProducts: "All CAT4 cartridges, flower, and extract products purchased from participating retailers.",
    purchaseLimits: "Limit one entry per person per day. No purchase necessary to enter.",
    redemptionWindow: "Winners must respond within 14 days and claim prizes within 30 days of notification.",
  },
  form: {
    fields: [
      { name: "email", label: "Email", required: true, type: "email" },
      { name: "firstName", label: "First Name", required: false, type: "text" },
      { name: "lastName", label: "Last Name", required: false, type: "text" },
    ],
    consentText:
      "I agree to the Official Rules, am 21 years of age or older, and consent to receive marketing emails from CAT4.",
  },
  rules: {
    content: `OFFICIAL RULES — CAT4 SUMMER SWEEPSTAKES

NO PURCHASE NECESSARY. Open to legal U.S. residents 21+. Void where prohibited.

1. SPONSOR: CAT4 Brand Co.
2. ELIGIBILITY: Must be 21+ and a legal U.S. resident.
3. ENTRY PERIOD: January 1, 2026 through December 31, 2026.
4. HOW TO ENTER: Click Join Now and complete the entry wizard with a valid email address.
5. PRIZE: One (1) Grand Prize consisting of CAT4 products valued at $2,000+ MSRP. No cash alternative.
6. WINNER SELECTION: Random drawing from all eligible entries. Odds depend on number of entries received.
7. WINNER NOTIFICATION: Winner will be notified by email within 14 days of drawing.
8. PRIVACY: Information collected will be used in accordance with CAT4's privacy policy.
9. GENERAL: By entering, participants agree to these Official Rules and Sponsor's decisions, which are final.`,
  },
};

export const MOCK_SWEEPSTAKES_PAGE: LandingPage = {
  id: MOCK_SWEEPSTAKES_ID,
  slug: "summer-sweepstakes",
  title: "CAT4 Summer Sweepstakes",
  type: "sweepstakes",
  status: "published",
  blocks: MOCK_SWEEPSTAKES_BLOCKS,
  startsAt: sweepstakesStart,
  endsAt: sweepstakesEnd,
  createdById: "00000000-0000-4000-8000-000000000099",
  publishedAt: seededAt,
  createdAt: seededAt,
  updatedAt: seededAt,
};

export const MOCK_SWEEPSTAKES_ENTRIES = [
  {
    id: "00000000-0000-4000-8000-000000000051",
    landingPageId: MOCK_SWEEPSTAKES_ID,
    email: "alex@example.com",
    firstName: "Alex",
    lastName: "Rivera",
    formData: null,
    createdAt: new Date("2026-06-15T14:30:00.000Z"),
  },
  {
    id: "00000000-0000-4000-8000-000000000052",
    landingPageId: MOCK_SWEEPSTAKES_ID,
    email: "jordan@example.com",
    firstName: "Jordan",
    lastName: "Lee",
    formData: null,
    createdAt: new Date("2026-06-20T09:15:00.000Z"),
  },
  {
    id: "00000000-0000-4000-8000-000000000053",
    landingPageId: MOCK_SWEEPSTAKES_ID,
    email: "sam@example.com",
    firstName: "Sam",
    lastName: "Taylor",
    formData: null,
    createdAt: new Date("2026-07-01T18:45:00.000Z"),
  },
];

export function sweepstakesTemplateBlocks(title: string): LandingPageBlock {
  return {
    ...MOCK_SWEEPSTAKES_BLOCKS,
    hero: {
      ...MOCK_SWEEPSTAKES_BLOCKS.hero!,
      headline: title || MOCK_SWEEPSTAKES_BLOCKS.hero!.headline,
    },
  };
}
