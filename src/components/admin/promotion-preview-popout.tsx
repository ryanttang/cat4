"use client";

import { useEffect, useMemo, useState } from "react";
import { Monitor, Smartphone } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LandingPageView } from "@/components/marketing/landing-page-view";
import {
  PROMOTION_PREVIEW_CHANNEL,
  buildPromotionPreviewPage,
  loadPromotionPreviewPopout,
  type PromotionPreviewPopoutState,
} from "@/lib/promotion-preview";
import { cn } from "@/lib/utils";

export function PromotionPreviewPopout() {
  const [state, setState] = useState<PromotionPreviewPopoutState | null>(null);

  useEffect(() => {
    setState(loadPromotionPreviewPopout());

    const channel = new BroadcastChannel(PROMOTION_PREVIEW_CHANNEL);
    channel.onmessage = (event) => {
      if (event.data?.draft) {
        setState(event.data as PromotionPreviewPopoutState);
      }
    };

    return () => channel.close();
  }, []);

  const page = useMemo(
    () => (state ? buildPromotionPreviewPage(state.draft, state.pageId) : null),
    [state]
  );

  if (!state || !page) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        No preview data. Open this window from the promotion editor.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-border bg-background px-4 py-3">
        <div>
          <h1 className="text-sm font-semibold">Promotion Preview</h1>
          <p className="text-xs text-muted-foreground">Updates live while the editor is open.</p>
        </div>
        <Tabs
          value={state.viewport}
          onValueChange={(value) =>
            setState((current) =>
              current ? { ...current, viewport: value as PromotionPreviewPopoutState["viewport"] } : current
            )
          }
        >
          <TabsList>
            <TabsTrigger value="desktop" className="gap-1.5">
              <Monitor className="h-4 w-4" />
              Desktop
            </TabsTrigger>
            <TabsTrigger value="mobile" className="gap-1.5">
              <Smartphone className="h-4 w-4" />
              Mobile
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex justify-center p-4">
        <div
          className={cn(
            "overflow-hidden rounded-xl border border-border bg-cat4-dark shadow-lg",
            state.viewport === "mobile" ? "w-[390px]" : "w-full max-w-6xl"
          )}
        >
          <LandingPageView
            page={page}
            preview
            previewVideoAutoplay={state.previewVideoAutoplay}
          />
        </div>
      </div>
    </div>
  );
}
