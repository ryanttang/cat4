import { z } from "zod";
import { PRODUCT_CATEGORY_SLUGS } from "@/lib/categories";

export const subscribeSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  consentMarketing: z.literal(true, {
    errorMap: () => ({ message: "You must agree to receive marketing emails" }),
  }),
  source: z.string().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
});

export const landingEntrySchema = z.object({
  landingPageId: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  consentMarketing: z.literal(true, {
    errorMap: () => ({ message: "Consent is required" }),
  }),
  formData: z.record(z.string()).optional(),
});

export const surveySubmitSchema = z.object({
  surveyId: z.string().uuid(),
  email: z.string().email().optional(),
  answers: z.array(
    z.object({
      questionId: z.string().uuid(),
      answer: z.any(),
    })
  ),
  metadata: z.record(z.unknown()).optional(),
});

export const productSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  category: z.enum(PRODUCT_CATEGORY_SLUGS),
  description: z.string().optional(),
  longDescription: z.string().optional(),
  images: z.array(z.string()).optional(),
  price: z.string().optional().nullable(),
  compareAtPrice: z.string().optional().nullable(),
  classification: z.string().optional().nullable(),
  subtype: z.string().optional().nullable(),
  size: z.string().optional().nullable(),
  thcPercent: z.string().optional().nullable(),
  discountPercent: z.number().int().optional().nullable(),
  featured: z.boolean().optional(),
  featuredOrder: z.number().optional(),
  published: z.boolean().optional(),
});

export const heroSchema = z.object({
  videoSourceType: z.enum(["embed", "paste", "upload"]).optional().nullable(),
  videoUrl: z.string().optional(),
  posterUrl: z.string().optional(),
  headline: z.string().min(1),
  subheadline: z.string().optional(),
  ctaLabel: z.string().optional(),
  ctaHref: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const locationSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  zip: z.string().min(1),
  phone: z.string().optional(),
  hours: z.string().optional(),
  imageUrl: z.string().optional(),
  shopUrl: z.string().optional(),
  directionsUrl: z.string().optional(),
  lat: z.string().optional(),
  lng: z.string().optional(),
  published: z.boolean().optional(),
});

export const educationSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  excerpt: z.string().optional(),
  body: z.string().min(1),
  coverImage: z.string().optional(),
  tags: z.array(z.string()).optional(),
  published: z.boolean().optional(),
});

export const aboutSectionSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  sortOrder: z.number().optional(),
  published: z.boolean().optional(),
});

export const landingPageSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  type: z.enum(["sweepstakes", "raffle", "giveaway", "contest"]),
  status: z.enum(["draft", "published", "archived"]).optional(),
  blocks: z.record(z.unknown()).optional(),
  startsAt: z.string().optional().nullable(),
  endsAt: z.string().optional().nullable(),
});

const surveySettingsSchema = z.object({
  allowMultipleVotes: z.boolean().optional(),
  anonymousOnly: z.boolean().optional(),
  resultsRefreshSeconds: z.number().int().min(3).max(60).optional(),
});

export const surveySchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  type: z.enum(["survey", "poll", "questionnaire"]),
  description: z.string().optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  emailRequired: z.boolean().optional(),
  publicResultsEnabled: z.boolean().optional(),
  showResultsAfterVote: z.boolean().optional(),
  settings: surveySettingsSchema.optional(),
  startsAt: z.string().optional().nullable(),
  endsAt: z.string().optional().nullable(),
});

export const surveyQuestionSchema = z.object({
  type: z.enum([
    "single_choice",
    "multi_choice",
    "text",
    "scale",
    "rating",
    "yes_no",
    "dropdown",
    "short_text",
    "feedback",
    "email",
    "number",
    "nps",
  ]),
  questionText: z.string().min(1),
  options: z.array(z.string()).optional(),
  required: z.boolean().optional(),
  sortOrder: z.number().optional(),
});

export const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).optional(),
  name: z.string().optional(),
  role: z.enum(["admin", "staff", "ambassador"]),
});

const ambassadorHubLinkSchema = z.object({
  label: z.string().min(1),
  url: z.string().min(1),
  enabled: z.boolean().optional(),
});

export const ambassadorHubDefaultsSchema = z.object({
  hubTitle: z.string().min(1),
  hubBio: z.string().optional(),
  hubImageUrl: z.string().optional(),
  links: z.array(ambassadorHubLinkSchema).min(1),
});

export const ambassadorSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  photoUrl: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  territory: z.string().optional().nullable(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  slug: z
    .string()
    .min(2)
    .max(48)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens")
    .optional(),
  linkMode: z.enum(["global", "custom", "merge"]).optional(),
  customLinks: z.array(ambassadorHubLinkSchema).optional(),
  hubOverrides: z
    .object({
      hubTitle: z.string().optional(),
      hubBio: z.string().optional(),
      hubImageUrl: z.string().optional(),
    })
    .optional(),
});

export const ambassadorPortalAccessSchema = z.object({
  password: z.string().min(8),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const homepageCtaSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
});

export const homepageSchema = z.object({
  seo: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
  }),
  hero: z.object({
    badge: z.string().min(1),
    headline: z.string().min(1),
    headlineAccent: z.string().min(1),
    body: z.string().min(1),
    primaryCta: homepageCtaSchema,
    secondaryCta: homepageCtaSchema,
  }),
  stats: z
    .array(
      z.object({
        value: z.string(),
        label: z.string().min(1),
        useProductCount: z.boolean().optional(),
      })
    )
    .min(1)
    .max(4),
  lineup: z.object({
    sectionLabel: z.string().min(1),
  }),
  fanFavorites: z.object({
    title: z.string().min(1),
    ctaLabel: z.string().min(1),
    ctaHref: z.string().min(1),
  }),
  whatIsCat4: z.object({
    sectionLabel: z.string().min(1),
    title: z.string().min(1),
    body: z.string().min(1),
    imageUrl: z.string().min(1),
    imageCaption: z.string().min(1),
    bullets: z.array(
      z.object({
        icon: z.string().min(1),
        text: z.string().min(1),
      })
    ),
    ctaLabel: z.string().min(1),
    ctaHref: z.string().min(1),
  }),
  benefits: z.object({
    sectionLabel: z.string().min(1),
    title: z.string().min(1),
    cards: z.array(
      z.object({
        title: z.string().min(1),
        description: z.string().min(1),
        imageUrl: z.string().min(1),
        icon: z.string().min(1),
      })
    ),
  }),
  educationPreview: z.object({
    sectionLabel: z.string().min(1),
    title: z.string().min(1),
    ctaLabel: z.string().min(1),
    ctaHref: z.string().min(1),
  }),
  finalCta: z.object({
    sectionLabel: z.string().min(1),
    title: z.string().min(1),
    subtitle: z.string().min(1),
    bodyParagraphs: z.array(z.string().min(1)).min(1),
    imageUrl: z.string().min(1),
    primaryCta: homepageCtaSchema,
    secondaryCta: homepageCtaSchema,
  }),
});

const qrDestinationConfigSchema = z.object({
  hubTitle: z.string().optional(),
  hubBio: z.string().optional(),
  hubImageUrl: z.string().optional(),
  links: z
    .array(
      z.object({
        label: z.string().min(1),
        url: z.string().min(1),
      })
    )
    .optional(),
  landingPageId: z.string().uuid().optional(),
  surveyId: z.string().uuid().optional(),
  claimForm: z
    .object({
      fields: z.array(
        z.object({
          name: z.string().min(1),
          label: z.string().min(1),
          type: z.string().min(1),
          required: z.boolean(),
        })
      ),
      consentText: z.string().optional(),
    })
    .optional(),
  claimOutcome: z
    .object({
      type: z.enum(["confirmation", "code", "redirect"]),
      message: z.string().optional(),
      redirectUrl: z.string().optional(),
      codePrefix: z.string().optional(),
    })
    .optional(),
  externalUrl: z.string().optional(),
});

export const qrCodeSchema = z.object({
  title: z.string().min(1),
  code: z
    .string()
    .min(3)
    .max(32)
    .regex(/^[a-z0-9-]+$/, "Code must be lowercase letters, numbers, and hyphens")
    .optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  productId: z.string().uuid().nullable().optional(),
  destinationType: z.enum([
    "product_page",
    "link_hub",
    "promotion",
    "survey",
    "poll",
    "subscribe",
    "claim_reward",
    "external_url",
  ]),
  destinationConfig: qrDestinationConfigSchema.optional(),
});

export const rewardClaimSchema = z.object({
  qrCodeId: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  consentMarketing: z.literal(true, {
    errorMap: () => ({ message: "Consent is required" }),
  }),
  formData: z.record(z.string()).optional(),
});
