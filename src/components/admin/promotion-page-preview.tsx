"use client";

import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Monitor, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LandingPageView } from "@/components/marketing/landing-page-view";
import { adminPanelClass } from "@/components/admin/admin-ui";
import {
  broadcastPromotionPreview,
  buildPromotionPreviewPage,
  savePromotionPreviewPopout,
  type PromotionPreviewDraft,
} from "@/lib/promotion-preview";
import { cn } from "@/lib/utils";

const POPOUT_URL = "/admin/preview/promotion";

type PromotionPagePreviewProps = {
  draft: PromotionPreviewDraft;
  pageId?: string;
  previewVideoAutoplay?: boolean;
};

export function PromotionPagePreview({
  draft,
  pageId,
  previewVideoAutoplay = false,
}: PromotionPagePreviewProps) {
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop");
  const page = useMemo(() => buildPromotionPreviewPage(draft, pageId), [draft, pageId]);

  const popoutState = useMemo(
    () => ({
      draft,
      pageId,
      previewVideoAutoplay,
      viewport,
    }),
    [draft, pageId, previewVideoAutoplay, viewport]
  );

  useEffect(() => {
    broadcastPromotionPreview(popoutState);
  }, [popoutState]);

  function handlePopOut() {
    savePromotionPreviewPopout(popoutState);
    window.open(POPOUT_URL, "_blank", "noopener,noreferrer,width=1280,height=900");
  }

  return (
    <div className={cn("overflow-hidden", adminPanelClass)}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div>
          <h3 className="font-semibold">Preview</h3>
          <p className="text-xs text-muted-foreground">Updates live as you edit.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Tabs value={viewport} onValueChange={(value) => setViewport(value as "desktop" | "mobile")}>
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
          <Button type="button" variant="outline" size="sm" onClick={handlePopOut}>
            <ExternalLink className="mr-2 h-4 w-4" />
            Pop out
          </Button>
        </div>
      </div>

      <div className="flex justify-center bg-muted/20 p-4">
        <div
          className={cn(
            "overflow-hidden rounded-xl border border-border bg-cat4-dark shadow-lg transition-all",
            viewport === "mobile" ? "w-[390px]" : "w-full"
          )}
        >
          <div
            className={cn(
              "overflow-y-auto",
              viewport === "mobile" ? "h-[780px]" : "h-[min(80vh,900px)]"
            )}
          >
            <LandingPageView page={page} preview previewVideoAutoplay={previewVideoAutoplay} />
          </div>
        </div>
      </div>
    </div>
  );
}
