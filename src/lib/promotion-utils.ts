import type { LandingPage, LandingPageBlock } from "@/lib/db/schema";

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

export function promotionAccessStorageKey(slug: string): string {
  return `cat4-promo-access-${slug}`;
}
