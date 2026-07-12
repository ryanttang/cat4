import type { HomepageContent } from "@/lib/homepage";
import type { Product } from "@/lib/db/schema";

import { brandStorageKeys } from "@/lib/brand";

export const HOMEPAGE_PREVIEW_POPOUT_KEY = brandStorageKeys.homepagePreviewPopout;
export const HOMEPAGE_PREVIEW_CHANNEL = brandStorageKeys.homepagePreviewChannel;

export type HomepagePreviewDraft = HomepageContent;

export type HomepagePreviewPopoutState = {
  draft: HomepagePreviewDraft;
  viewport: "desktop" | "mobile";
  products: Product[];
  featuredProducts: Product[];
};

export function saveHomepagePreviewPopout(state: HomepagePreviewPopoutState) {
  sessionStorage.setItem(HOMEPAGE_PREVIEW_POPOUT_KEY, JSON.stringify(state));
}

export function loadHomepagePreviewPopout(): HomepagePreviewPopoutState | null {
  const raw = sessionStorage.getItem(HOMEPAGE_PREVIEW_POPOUT_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as HomepagePreviewPopoutState;
  } catch {
    return null;
  }
}

export function broadcastHomepagePreview(state: HomepagePreviewPopoutState) {
  if (typeof BroadcastChannel === "undefined") return;
  const channel = new BroadcastChannel(HOMEPAGE_PREVIEW_CHANNEL);
  channel.postMessage(state);
  channel.close();
}
