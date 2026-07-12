"use client";

import { useEffect, useMemo, useState } from "react";
import { Monitor, Smartphone } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BrandLanding } from "@/components/marketing/brand-landing";
import {
  HOMEPAGE_PREVIEW_CHANNEL,
  loadHomepagePreviewPopout,
  type HomepagePreviewPopoutState,
} from "@/lib/homepage-preview";
import type { Product } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

const fallbackProducts: Product[] = [];
const fallbackFeatured: Product[] = [];

export function HomepagePreviewPopout() {
  const [state, setState] = useState<HomepagePreviewPopoutState | null>(null);

  useEffect(() => {
    setState(loadHomepagePreviewPopout());

    const channel = new BroadcastChannel(HOMEPAGE_PREVIEW_CHANNEL);
    channel.onmessage = (event) => {
      if (event.data?.draft) {
        setState(event.data as HomepagePreviewPopoutState);
      }
    };

    return () => channel.close();
  }, []);

  const draft = useMemo(() => state?.draft ?? null, [state]);
  const products = state?.products?.length ? state.products : fallbackProducts;
  const featuredProducts = state?.featuredProducts?.length ? state.featuredProducts : fallbackFeatured;

  if (!state || !draft) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        No preview data. Open this window from the home page editor.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-border bg-background px-4 py-3">
        <div>
          <h1 className="text-sm font-semibold">Home Page Preview</h1>
          <p className="text-xs text-muted-foreground">Updates live while the editor is open.</p>
        </div>
        <Tabs
          value={state.viewport}
          onValueChange={(value) =>
            setState((current) =>
              current ? { ...current, viewport: value as HomepagePreviewPopoutState["viewport"] } : current
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
            "isolate overflow-hidden rounded-xl border border-border bg-cat4-dark shadow-lg",
            state.viewport === "mobile" ? "w-[390px]" : "w-full max-w-6xl"
          )}
        >
          <BrandLanding
            products={products}
            featuredProducts={featuredProducts}
            content={draft}
            preview
          />
        </div>
      </div>
    </div>
  );
}
