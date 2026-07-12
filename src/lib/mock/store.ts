import { DEFAULT_HERO_YOUTUBE_URL } from "@/lib/hero-video";
import {
  MOCK_SWEEPSTAKES_PAGE,
  MOCK_SWEEPSTAKES_ENTRIES,
} from "@/lib/mock/sweepstakes-seed";
import { MOCK_PRODUCTS } from "@/lib/mock/products-seed";
import { MOCK_EDUCATION_ARTICLES } from "@/lib/mock/education-seed";
import { MOCK_LOCATIONS } from "@/lib/mock/locations-seed";
import {
  MOCK_QR_CODES,
  MOCK_QR_SCANS,
  MOCK_REWARD_CLAIMS,
} from "@/lib/mock/rewards-seed";
import {
  MOCK_AMBASSADORS,
  MOCK_AMBASSADOR_QR_CODES,
  MOCK_AMBASSADOR_LINK_CLICKS,
  MOCK_AMBASSADOR_USER,
} from "@/lib/mock/ambassadors-seed";
import { MOCK_PAGE_VIEWS } from "@/lib/mock/analytics-seed";
import type {
  Product,
  Location,
  EducationArticle,
  LandingPage,
  Survey,
  Capture,
  User,
  QrCode,
  QrScan,
  RewardClaim,
  BrandAmbassador,
  AmbassadorLinkClick,
  PageView,
} from "@/lib/db/schema";
import type { heroBlocks, aboutSections, surveyQuestions, landingPageEntries } from "@/lib/db/schema";

type HeroBlock = typeof heroBlocks.$inferSelect;
type AboutSection = typeof aboutSections.$inferSelect;
type SurveyQuestion = typeof surveyQuestions.$inferSelect;
type LandingPageEntry = typeof landingPageEntries.$inferSelect;

const now = new Date("2026-01-01T00:00:00.000Z");

function ts() {
  return { createdAt: now, updatedAt: now };
}

export const mockStore = {
  heroes: [
    {
      id: "00000000-0000-4000-8000-000000000001",
      videoSourceType: "embed" as const,
      videoUrl: DEFAULT_HERO_YOUTUBE_URL,
      posterUrl: null,
      headline: "Elevate Your Experience",
      subheadline: "Premium cannabis products crafted with precision and passion.",
      ctaLabel: "Explore Products",
      ctaHref: "/products",
      isActive: true,
      sortOrder: 0,
      ...ts(),
    },
  ] satisfies HeroBlock[],

  products: [...MOCK_PRODUCTS] satisfies Product[],

  locations: [...MOCK_LOCATIONS] satisfies Location[],

  educationArticles: [...MOCK_EDUCATION_ARTICLES] satisfies EducationArticle[],

  aboutSections: [
    {
      id: "00000000-0000-4000-8000-000000000040",
      title: "Our Mission",
      body: "CAT4 is dedicated to delivering premium cannabis products that elevate every experience. We combine rigorous quality standards with innovative formulations to create products our community trusts.",
      sortOrder: 0,
      published: true,
      ...ts(),
    },
    {
      id: "00000000-0000-4000-8000-000000000041",
      title: "Our Story",
      body: "Founded by cannabis enthusiasts who saw an opportunity to raise the bar, CAT4 started with a simple belief: consumers deserve transparency, quality, and consistency. Today, we partner with licensed retailers across the country to bring our products to discerning customers.",
      sortOrder: 1,
      published: true,
      ...ts(),
    },
    {
      id: "00000000-0000-4000-8000-000000000042",
      title: "Our Values",
      body: "Quality without compromise. Transparency in everything we do. Respect for the plant and the people who enjoy it. Community-first partnerships with retailers and consumers alike.",
      sortOrder: 2,
      published: true,
      ...ts(),
    },
  ] satisfies AboutSection[],

  landingPages: [MOCK_SWEEPSTAKES_PAGE] as LandingPage[],
  landingPageEntries: [...MOCK_SWEEPSTAKES_ENTRIES] as LandingPageEntry[],

  surveys: [] as Survey[],
  surveyQuestions: [] as SurveyQuestion[],
  surveyResponses: [] as Array<{
    id: string;
    surveyId: string;
    respondentEmail: string | null;
    submittedAt: Date;
    metadata: Record<string, unknown> | null;
  }>,
  surveyAnswers: [] as Array<{
    id: string;
    responseId: string;
    questionId: string;
    answer: unknown;
  }>,

  siteSettings: [
    {
      id: "00000000-0000-4000-8000-000000000050",
      key: "homepage",
      value: {},
      updatedAt: now,
    },
    {
      id: "00000000-0000-4000-8000-000000000051",
      key: "ambassador_hub_defaults",
      value: {
        hubTitle: "CAT4",
        hubBio: "Connect with CAT4",
        links: [
          { label: "Shop Products", url: "/products", enabled: true },
          { label: "Subscribe", url: "/subscribe", enabled: true },
          { label: "Follow on Instagram", url: "https://instagram.com", enabled: true },
        ],
      },
      updatedAt: now,
    },
  ] as Array<{
    id: string;
    key: string;
    value: Record<string, unknown>;
    updatedAt: Date;
  }>,

  captures: [] as Capture[],
  subscribers: [] as Array<{
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    consentMarketing: boolean;
    source: string | null;
    createdAt: Date;
  }>,

  qrCodes: [...MOCK_QR_CODES, ...MOCK_AMBASSADOR_QR_CODES] as QrCode[],
  qrScans: [...MOCK_QR_SCANS] as QrScan[],
  rewardClaims: [...MOCK_REWARD_CLAIMS] as RewardClaim[],

  brandAmbassadors: [...MOCK_AMBASSADORS] as BrandAmbassador[],
  ambassadorLinkClicks: [...MOCK_AMBASSADOR_LINK_CLICKS] as AmbassadorLinkClick[],

  pageViews: [...MOCK_PAGE_VIEWS] as PageView[],

  users: [
    {
      id: "00000000-0000-4000-8000-000000000099",
      email: "admin@cat4.com",
      passwordHash: "$mock$",
      name: "CAT4 Admin",
      role: "admin" as const,
      ...ts(),
    },
    MOCK_AMBASSADOR_USER,
  ] satisfies User[],
};
