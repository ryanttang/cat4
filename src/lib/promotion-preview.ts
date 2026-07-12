import type { LandingPage, LandingPageBlock } from "@/lib/db/schema";

export const PROMOTION_PREVIEW_POPOUT_KEY = "cat4-promotion-preview-popout";
export const PROMOTION_PREVIEW_CHANNEL = "cat4-promotion-preview";

export type PromotionPreviewDraft = {
  title: string;
  slug: string;
  type: LandingPage["type"];
  status: LandingPage["status"];
  blocks: LandingPageBlock;
  startsAt: string;
  endsAt: string;
};

export type PromotionPreviewPopoutState = {
  draft: PromotionPreviewDraft;
  pageId?: string;
  previewVideoAutoplay: boolean;
  viewport: "desktop" | "mobile";
};

export function savePromotionPreviewPopout(state: PromotionPreviewPopoutState) {
  sessionStorage.setItem(PROMOTION_PREVIEW_POPOUT_KEY, JSON.stringify(state));
}

export function loadPromotionPreviewPopout(): PromotionPreviewPopoutState | null {
  const raw = sessionStorage.getItem(PROMOTION_PREVIEW_POPOUT_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as PromotionPreviewPopoutState;
  } catch {
    return null;
  }
}

export function broadcastPromotionPreview(state: PromotionPreviewPopoutState) {
  if (typeof BroadcastChannel === "undefined") return;
  const channel = new BroadcastChannel(PROMOTION_PREVIEW_CHANNEL);
  channel.postMessage(state);
  channel.close();
}

export function buildPromotionPreviewPage(
  draft: PromotionPreviewDraft,
  existingId?: string
): LandingPage {
  const now = new Date();
  return {
    id: existingId ?? "00000000-0000-4000-8000-000000000000",
    slug: draft.slug || "preview",
    title: draft.title || "Promotion Preview",
    type: draft.type,
    status: "published",
    blocks: draft.blocks,
    startsAt: draft.startsAt ? new Date(draft.startsAt) : null,
    endsAt: draft.endsAt ? new Date(draft.endsAt) : null,
    createdById: null,
    publishedAt: now,
    createdAt: now,
    updatedAt: now,
  };
}
