import type {
  LandingPage,
  LandingPageBlock,
  LandingPageHowItWorksStep,
  LandingPageKeyDetails,
  LandingPagePrizeBlock,
} from "@/lib/db/schema";

export const DEFAULT_HOW_IT_WORKS_TITLE = "How It Works";
export const DEFAULT_KEY_DETAILS_TITLE = "Key Details";
export const DEFAULT_PROMOTION_CTA_LABEL = "Join Now";

export const KEY_DETAILS_FIELD_LABELS = {
  promotionPeriod: "Promotion Period",
  eligibleProducts: "Eligible Products",
  purchaseLimits: "Purchase Limits",
  redemptionWindow: "Redemption Window",
} as const;

export const DEFAULT_HOW_IT_WORKS_STEPS: LandingPageHowItWorksStep[] = [
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
    description: "One lucky winner will be selected when the promotion ends.",
  },
];

export function getLandingPagePrizes(blocks: LandingPageBlock): LandingPagePrizeBlock[] {
  if (blocks.prizes?.length) {
    return blocks.prizes.filter((prize) => prize.title?.trim());
  }

  if (blocks.prize?.title?.trim()) {
    return [
      {
        ...blocks.prize,
        label: blocks.prize.label ?? "Grand Prize",
      },
    ];
  }

  return [];
}

export function getHowItWorksFromBlocks(blocks: LandingPageBlock): {
  title: string;
  steps: LandingPageHowItWorksStep[];
} {
  const steps = blocks.howItWorks?.steps?.filter((step) => step.title?.trim());

  return {
    title: blocks.howItWorks?.title?.trim() || DEFAULT_HOW_IT_WORKS_TITLE,
    steps: steps?.length ? steps : DEFAULT_HOW_IT_WORKS_STEPS,
  };
}

export function normalizeKeyDetails(
  details: LandingPageKeyDetails
): LandingPageKeyDetails | undefined {
  const normalized = {
    title: details.title?.trim() || undefined,
    promotionPeriod: details.promotionPeriod?.trim() || undefined,
    eligibleProducts: details.eligibleProducts?.trim() || undefined,
    purchaseLimits: details.purchaseLimits?.trim() || undefined,
    redemptionWindow: details.redemptionWindow?.trim() || undefined,
  };

  const hasContent = Boolean(
    normalized.promotionPeriod ||
      normalized.eligibleProducts ||
      normalized.purchaseLimits ||
      normalized.redemptionWindow
  );

  return hasContent ? normalized : undefined;
}

export function getKeyDetailsFromBlocks(blocks: LandingPageBlock): {
  title: string;
  items: Array<{ label: string; value: string }>;
} | null {
  const details = normalizeKeyDetails(blocks.keyDetails ?? {});
  if (!details) return null;

  const items = [
    { label: KEY_DETAILS_FIELD_LABELS.promotionPeriod, value: details.promotionPeriod },
    { label: KEY_DETAILS_FIELD_LABELS.eligibleProducts, value: details.eligibleProducts },
    { label: KEY_DETAILS_FIELD_LABELS.purchaseLimits, value: details.purchaseLimits },
    { label: KEY_DETAILS_FIELD_LABELS.redemptionWindow, value: details.redemptionWindow },
  ].filter((item): item is { label: string; value: string } => Boolean(item.value));

  if (items.length === 0) return null;

  return {
    title: details.title || DEFAULT_KEY_DETAILS_TITLE,
    items,
  };
}

export const PROMOTION_TYPE_LABELS: Record<string, string> = {
  sweepstakes: "Sweepstakes",
  raffle: "Raffle",
  giveaway: "Giveaway",
  contest: "Contest",
};

export function isPromotionActive(page: LandingPage): boolean {
  if (page.status !== "published") return false;
  const now = new Date();
  if (page.startsAt && new Date(page.startsAt) > now) return false;
  if (page.endsAt && new Date(page.endsAt) < now) return false;
  return true;
}

export function promotionEntryPath(slug: string): string {
  return `/l/${slug}/enter`;
}

export function getPromotionSettings(blocks: LandingPageBlock) {
  return {
    passwordProtected: blocks.settings?.passwordProtected ?? false,
    accessPassword: blocks.settings?.accessPassword ?? "",
    countdownEnabled: blocks.settings?.countdownEnabled ?? true,
  };
}

export function getPromotionCtaLabel(blocks: LandingPageBlock): string {
  return blocks.hero?.ctaLabel?.trim() || DEFAULT_PROMOTION_CTA_LABEL;
}

export function promotionAccessStorageKey(slug: string): string {
  return `cat4-promo-access-${slug}`;
}
