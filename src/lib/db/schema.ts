import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  pgEnum,
  uuid,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Enums ───────────────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum("user_role", ["admin", "staff", "ambassador"]);
export const productCategoryEnum = pgEnum("product_category", [
  "cartridge",
  "preroll",
  "flower",
  "extract",
  "merch",
]);
export const landingPageTypeEnum = pgEnum("landing_page_type", [
  "sweepstakes",
  "raffle",
  "giveaway",
  "contest",
]);
export const contentStatusEnum = pgEnum("content_status", [
  "draft",
  "published",
  "archived",
]);
export const surveyTypeEnum = pgEnum("survey_type", [
  "survey",
  "poll",
  "questionnaire",
]);
export const questionTypeEnum = pgEnum("question_type", [
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
]);
export const captureSourceEnum = pgEnum("capture_source", [
  "subscribe",
  "landing_page",
  "survey",
  "manual",
  "reward_claim",
  "ambassador",
]);

export const ambassadorLinkModeEnum = pgEnum("ambassador_link_mode", [
  "global",
  "custom",
  "merge",
]);

export const qrDestinationTypeEnum = pgEnum("qr_destination_type", [
  "product_page",
  "link_hub",
  "promotion",
  "survey",
  "poll",
  "subscribe",
  "claim_reward",
  "external_url",
]);

export const qrDeviceTypeEnum = pgEnum("qr_device_type", [
  "mobile",
  "tablet",
  "desktop",
  "unknown",
]);

// ─── Users ───────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name"),
  role: userRoleEnum("role").notNull().default("staff"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  landingPages: many(landingPages),
  surveys: many(surveys),
}));

// ─── Site Settings & Hero ────────────────────────────────────────────────────

export const siteSettings = pgTable("site_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: text("key").notNull().unique(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const heroBlocks = pgTable("hero_blocks", {
  id: uuid("id").primaryKey().defaultRandom(),
  videoSourceType: text("video_source_type").$type<"embed" | "paste" | "upload">(),
  videoUrl: text("video_url"),
  posterUrl: text("poster_url"),
  headline: text("headline").notNull(),
  subheadline: text("subheadline"),
  ctaLabel: text("cta_label"),
  ctaHref: text("cta_href"),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─── Products ────────────────────────────────────────────────────────────────

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  category: productCategoryEnum("category").notNull(),
  description: text("description"),
  longDescription: text("long_description"),
  images: jsonb("images").$type<string[]>().default([]),
  price: text("price"),
  compareAtPrice: text("compare_at_price"),
  classification: text("classification"),
  subtype: text("subtype"),
  size: text("size"),
  thcPercent: text("thc_percent"),
  discountPercent: integer("discount_percent"),
  featured: boolean("featured").notNull().default(false),
  featuredOrder: integer("featured_order").default(0),
  published: boolean("published").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─── Locations ───────────────────────────────────────────────────────────────

export const locations = pgTable("locations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zip: text("zip").notNull(),
  phone: text("phone"),
  hours: text("hours"),
  imageUrl: text("image_url"),
  shopUrl: text("shop_url"),
  directionsUrl: text("directions_url"),
  lat: text("lat"),
  lng: text("lng"),
  published: boolean("published").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─── Education ───────────────────────────────────────────────────────────────

export const educationArticles = pgTable("education_articles", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt"),
  body: text("body").notNull(),
  coverImage: text("cover_image"),
  tags: jsonb("tags").$type<string[]>().default([]),
  published: boolean("published").notNull().default(false),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─── About Sections ──────────────────────────────────────────────────────────

export const aboutSections = pgTable("about_sections", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  published: boolean("published").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─── Captures & Subscribers ──────────────────────────────────────────────────

export const captures = pgTable("captures", {
  id: uuid("id").primaryKey().defaultRandom(),
  sourceType: captureSourceEnum("source_type").notNull(),
  sourceId: uuid("source_id"),
  email: text("email").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  consentMarketing: boolean("consent_marketing").notNull().default(false),
  utmSource: text("utm_source"),
  utmMedium: text("utm_medium"),
  utmCampaign: text("utm_campaign"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const subscribers = pgTable(
  "subscribers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    firstName: text("first_name"),
    lastName: text("last_name"),
    consentMarketing: boolean("consent_marketing").notNull().default(true),
    source: text("source"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("subscribers_email_idx").on(table.email)]
);

// ─── Landing Pages ───────────────────────────────────────────────────────────

export type LandingPageFeaturedProduct = {
  name: string;
  url: string;
  description?: string;
  imageUrl?: string;
};

export type LandingPageBlock = {
  settings?: {
    passwordProtected?: boolean;
    accessPassword?: string;
    countdownEnabled?: boolean;
  };
  hero?: {
    videoUrl?: string;
    imageUrl?: string;
    headline: string;
    subheadline?: string;
  };
  form?: {
    fields: Array<{ name: string; label: string; required: boolean; type: string }>;
    consentText: string;
  };
  rules?: { content: string };
  prize?: { title: string; description: string; imageUrl?: string };
  /** External product links shown on the promotion landing page. */
  featuredProducts?: LandingPageFeaturedProduct[];
};

export const landingPages = pgTable("landing_pages", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  type: landingPageTypeEnum("type").notNull(),
  status: contentStatusEnum("status").notNull().default("draft"),
  blocks: jsonb("blocks").$type<LandingPageBlock>().notNull().default({}),
  startsAt: timestamp("starts_at", { withTimezone: true }),
  endsAt: timestamp("ends_at", { withTimezone: true }),
  createdById: uuid("created_by_id").references(() => users.id),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const landingPagesRelations = relations(landingPages, ({ one, many }) => ({
  createdBy: one(users, { fields: [landingPages.createdById], references: [users.id] }),
  entries: many(landingPageEntries),
}));

export const landingPageEntries = pgTable("landing_page_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  landingPageId: uuid("landing_page_id")
    .notNull()
    .references(() => landingPages.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  formData: jsonb("form_data").$type<Record<string, string>>(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const landingPageEntriesRelations = relations(landingPageEntries, ({ one }) => ({
  landingPage: one(landingPages, {
    fields: [landingPageEntries.landingPageId],
    references: [landingPages.id],
  }),
}));

// ─── Surveys ─────────────────────────────────────────────────────────────────

export type SurveySettings = {
  allowMultipleVotes?: boolean;
  anonymousOnly?: boolean;
  resultsRefreshSeconds?: number;
};

export const surveys = pgTable("surveys", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  type: surveyTypeEnum("type").notNull(),
  description: text("description"),
  status: contentStatusEnum("status").notNull().default("draft"),
  emailRequired: boolean("email_required").notNull().default(false),
  publicResultsEnabled: boolean("public_results_enabled").notNull().default(false),
  showResultsAfterVote: boolean("show_results_after_vote").notNull().default(false),
  settings: jsonb("settings").$type<SurveySettings>().default({}),
  startsAt: timestamp("starts_at", { withTimezone: true }),
  endsAt: timestamp("ends_at", { withTimezone: true }),
  createdById: uuid("created_by_id").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const surveysRelations = relations(surveys, ({ one, many }) => ({
  createdBy: one(users, { fields: [surveys.createdById], references: [users.id] }),
  questions: many(surveyQuestions),
  responses: many(surveyResponses),
}));

export const surveyQuestions = pgTable("survey_questions", {
  id: uuid("id").primaryKey().defaultRandom(),
  surveyId: uuid("survey_id")
    .notNull()
    .references(() => surveys.id, { onDelete: "cascade" }),
  sortOrder: integer("sort_order").notNull().default(0),
  type: questionTypeEnum("type").notNull(),
  questionText: text("question_text").notNull(),
  options: jsonb("options").$type<string[]>(),
  required: boolean("required").notNull().default(false),
});

export const surveyQuestionsRelations = relations(surveyQuestions, ({ one, many }) => ({
  survey: one(surveys, { fields: [surveyQuestions.surveyId], references: [surveys.id] }),
  answers: many(surveyAnswers),
}));

export const surveyResponses = pgTable("survey_responses", {
  id: uuid("id").primaryKey().defaultRandom(),
  surveyId: uuid("survey_id")
    .notNull()
    .references(() => surveys.id, { onDelete: "cascade" }),
  respondentEmail: text("respondent_email"),
  submittedAt: timestamp("submitted_at", { withTimezone: true }).defaultNow().notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
});

export const surveyResponsesRelations = relations(surveyResponses, ({ one, many }) => ({
  survey: one(surveys, { fields: [surveyResponses.surveyId], references: [surveys.id] }),
  answers: many(surveyAnswers),
}));

export const surveyAnswers = pgTable("survey_answers", {
  id: uuid("id").primaryKey().defaultRandom(),
  responseId: uuid("response_id")
    .notNull()
    .references(() => surveyResponses.id, { onDelete: "cascade" }),
  questionId: uuid("question_id")
    .notNull()
    .references(() => surveyQuestions.id, { onDelete: "cascade" }),
  answer: jsonb("answer").notNull(),
});

export const surveyAnswersRelations = relations(surveyAnswers, ({ one }) => ({
  response: one(surveyResponses, {
    fields: [surveyAnswers.responseId],
    references: [surveyResponses.id],
  }),
  question: one(surveyQuestions, {
    fields: [surveyAnswers.questionId],
    references: [surveyQuestions.id],
  }),
}));

// ─── QR Codes & Rewards ──────────────────────────────────────────────────────

export type QrDestinationConfig = {
  hubTitle?: string;
  hubBio?: string;
  hubImageUrl?: string;
  links?: Array<{ label: string; url: string }>;
  landingPageId?: string;
  surveyId?: string;
  claimForm?: {
    fields: Array<{ name: string; label: string; type: string; required: boolean }>;
    consentText?: string;
  };
  claimOutcome?: {
    type: "confirmation" | "code" | "redirect";
    message?: string;
    redirectUrl?: string;
    codePrefix?: string;
  };
  externalUrl?: string;
};

export const qrCodes = pgTable(
  "qr_codes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    code: text("code").notNull().unique(),
    title: text("title").notNull(),
    status: contentStatusEnum("status").notNull().default("draft"),
    productId: uuid("product_id").references(() => products.id, { onDelete: "cascade" }),
    ambassadorId: uuid("ambassador_id").references(() => brandAmbassadors.id, {
      onDelete: "cascade",
    }),
    destinationType: qrDestinationTypeEnum("destination_type").notNull().default("external_url"),
    destinationConfig: jsonb("destination_config").$type<QrDestinationConfig>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("qr_codes_product_id_idx").on(table.productId),
    uniqueIndex("qr_codes_ambassador_id_idx").on(table.ambassadorId),
  ]
);

export const qrCodesRelations = relations(qrCodes, ({ one, many }) => ({
  product: one(products, { fields: [qrCodes.productId], references: [products.id] }),
  ambassador: one(brandAmbassadors, {
    fields: [qrCodes.ambassadorId],
    references: [brandAmbassadors.id],
  }),
  scans: many(qrScans),
  claims: many(rewardClaims),
}));

export const qrScans = pgTable("qr_scans", {
  id: uuid("id").primaryKey().defaultRandom(),
  qrCodeId: uuid("qr_code_id")
    .notNull()
    .references(() => qrCodes.id, { onDelete: "cascade" }),
  scannedAt: timestamp("scanned_at", { withTimezone: true }).defaultNow().notNull(),
  userAgent: text("user_agent"),
  referrer: text("referrer"),
  deviceType: qrDeviceTypeEnum("device_type").notNull().default("unknown"),
  utmSource: text("utm_source"),
  utmMedium: text("utm_medium"),
  utmCampaign: text("utm_campaign"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
});

export const qrScansRelations = relations(qrScans, ({ one }) => ({
  qrCode: one(qrCodes, { fields: [qrScans.qrCodeId], references: [qrCodes.id] }),
}));

export const rewardClaims = pgTable("reward_claims", {
  id: uuid("id").primaryKey().defaultRandom(),
  qrCodeId: uuid("qr_code_id")
    .notNull()
    .references(() => qrCodes.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  formData: jsonb("form_data").$type<Record<string, string>>(),
  rewardCode: text("reward_code"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const rewardClaimsRelations = relations(rewardClaims, ({ one }) => ({
  qrCode: one(qrCodes, { fields: [rewardClaims.qrCodeId], references: [qrCodes.id] }),
}));

// ─── Brand Ambassadors ───────────────────────────────────────────────────────

export type AmbassadorHubLink = {
  label: string;
  url: string;
  enabled?: boolean;
};

export type AmbassadorHubOverrides = {
  hubTitle?: string;
  hubBio?: string;
  hubImageUrl?: string;
};

export type AmbassadorHubDefaults = {
  hubTitle: string;
  hubBio?: string;
  hubImageUrl?: string;
  links: AmbassadorHubLink[];
};

export const brandAmbassadors = pgTable(
  "brand_ambassadors",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    photoUrl: text("photo_url"),
    bio: text("bio"),
    territory: text("territory"),
    status: contentStatusEnum("status").notNull().default("draft"),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    linkMode: ambassadorLinkModeEnum("link_mode").notNull().default("global"),
    customLinks: jsonb("custom_links").$type<AmbassadorHubLink[]>().notNull().default([]),
    hubOverrides: jsonb("hub_overrides").$type<AmbassadorHubOverrides>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("brand_ambassadors_user_id_idx").on(table.userId)]
);

export const brandAmbassadorsRelations = relations(brandAmbassadors, ({ one, many }) => ({
  user: one(users, { fields: [brandAmbassadors.userId], references: [users.id] }),
  qrCode: one(qrCodes, {
    fields: [brandAmbassadors.id],
    references: [qrCodes.ambassadorId],
  }),
  linkClicks: many(ambassadorLinkClicks),
}));

export const ambassadorLinkClicks = pgTable("ambassador_link_clicks", {
  id: uuid("id").primaryKey().defaultRandom(),
  ambassadorId: uuid("ambassador_id")
    .notNull()
    .references(() => brandAmbassadors.id, { onDelete: "cascade" }),
  linkLabel: text("link_label").notNull(),
  linkUrl: text("link_url").notNull(),
  clickedAt: timestamp("clicked_at", { withTimezone: true }).defaultNow().notNull(),
  userAgent: text("user_agent"),
  referrer: text("referrer"),
  deviceType: qrDeviceTypeEnum("device_type").notNull().default("unknown"),
});

export const ambassadorLinkClicksRelations = relations(ambassadorLinkClicks, ({ one }) => ({
  ambassador: one(brandAmbassadors, {
    fields: [ambassadorLinkClicks.ambassadorId],
    references: [brandAmbassadors.id],
  }),
}));

// ─── Site Analytics ──────────────────────────────────────────────────────────

export const pageViews = pgTable("page_views", {
  id: uuid("id").primaryKey().defaultRandom(),
  path: text("path").notNull(),
  viewedAt: timestamp("viewed_at", { withTimezone: true }).defaultNow().notNull(),
  userAgent: text("user_agent"),
  referrer: text("referrer"),
  deviceType: qrDeviceTypeEnum("device_type").notNull().default("unknown"),
  utmSource: text("utm_source"),
  utmMedium: text("utm_medium"),
  utmCampaign: text("utm_campaign"),
  sessionId: text("session_id"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
});

// ─── Type exports ────────────────────────────────────────────────────────────

export type User = typeof users.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Location = typeof locations.$inferSelect;
export type EducationArticle = typeof educationArticles.$inferSelect;
export type LandingPage = typeof landingPages.$inferSelect;
export type Survey = typeof surveys.$inferSelect;
export type SurveyQuestion = typeof surveyQuestions.$inferSelect;
export type Capture = typeof captures.$inferSelect;
export type QrCode = typeof qrCodes.$inferSelect;
export type QrScan = typeof qrScans.$inferSelect;
export type RewardClaim = typeof rewardClaims.$inferSelect;
export type BrandAmbassador = typeof brandAmbassadors.$inferSelect;
export type AmbassadorLinkClick = typeof ambassadorLinkClicks.$inferSelect;
export type PageView = typeof pageViews.$inferSelect;
