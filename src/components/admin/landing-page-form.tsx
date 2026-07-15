"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { FileUpload } from "@/components/admin/file-upload";
import { PromotionPagePreview } from "@/components/admin/promotion-page-preview";
import { createLandingPage, updateLandingPage, deleteLandingPage } from "@/lib/actions/admin";
import { LANDING_PAGE_TYPES, slugify } from "@/lib/utils";
import { sweepstakesTemplateBlocks } from "@/lib/mock/sweepstakes-seed";
import { DEFAULT_HERO_YOUTUBE_URL } from "@/lib/hero-video";
import {
  DEFAULT_HOW_IT_WORKS_STEPS,
  DEFAULT_HOW_IT_WORKS_TITLE,
  DEFAULT_KEY_DETAILS_TITLE,
  DEFAULT_PROMOTION_CTA_LABEL,
  getHowItWorksFromBlocks,
  getLandingPagePrizes,
  normalizeKeyDetails,
} from "@/lib/promotion-utils";
import type {
  LandingPage,
  LandingPageBlock,
  LandingPageFeaturedProduct,
  LandingPageHowItWorksStep,
  LandingPagePrizeBlock,
} from "@/lib/db/schema";
import { ChevronLeft, Plus, Sparkles, Trash2 } from "lucide-react";
import { adminPanelClass } from "@/components/admin/admin-ui";
import type { AdminDialogFormProps } from "@/components/admin/admin-form-dialog";

const emptyFeaturedProduct = (): LandingPageFeaturedProduct => ({
  name: "",
  url: "",
  description: "",
  imageUrl: "",
});

const emptyPrize = (): LandingPagePrizeBlock => ({
  label: "",
  title: "",
  description: "",
  imageUrl: "",
});

const emptyHowItWorksStep = (): LandingPageHowItWorksStep => ({
  title: "",
  description: "",
});

function normalizeFeaturedProducts(
  items: LandingPageFeaturedProduct[]
): LandingPageFeaturedProduct[] | undefined {
  const cleaned = items
    .map((item) => ({
      name: item.name.trim(),
      url: item.url.trim(),
      description: item.description?.trim() || undefined,
      imageUrl: item.imageUrl?.trim() || undefined,
    }))
    .filter((item) => item.name && item.url);

  return cleaned.length > 0 ? cleaned : undefined;
}

function normalizePrizes(items: LandingPagePrizeBlock[]): LandingPagePrizeBlock[] | undefined {
  const cleaned = items
    .map((item) => ({
      label: item.label?.trim() || undefined,
      title: item.title.trim(),
      description: item.description.trim(),
      imageUrl: item.imageUrl?.trim() || undefined,
    }))
    .filter((item) => item.title);

  return cleaned.length > 0 ? cleaned : undefined;
}

function normalizeHowItWorksSteps(
  title: string,
  steps: LandingPageHowItWorksStep[]
): LandingPageBlock["howItWorks"] | undefined {
  const cleanedSteps = steps
    .map((step) => ({
      title: step.title.trim(),
      description: step.description.trim(),
    }))
    .filter((step) => step.title);

  if (cleanedSteps.length === 0) return undefined;

  return {
    title: title.trim() || undefined,
    steps: cleanedSteps,
  };
}

export function LandingPageForm({
  page,
  dialog,
  onSuccess,
}: AdminDialogFormProps & { page?: LandingPage }) {
  const router = useRouter();
  const blocks = (page?.blocks ?? {}) as LandingPageBlock;

  const [title, setTitle] = useState(page?.title ?? "");
  const [slug, setSlug] = useState(page?.slug ?? "");
  const [type, setType] = useState(page?.type ?? "giveaway");
  const [status, setStatus] = useState(page?.status ?? "draft");
  const [headline, setHeadline] = useState(blocks.hero?.headline ?? "");
  const [subheadline, setSubheadline] = useState(blocks.hero?.subheadline ?? "");
  const [ctaLabel, setCtaLabel] = useState(blocks.hero?.ctaLabel ?? "");
  const [videoUrl, setVideoUrl] = useState(blocks.hero?.videoUrl ?? "");
  const [previewVideoAutoplay, setPreviewVideoAutoplay] = useState(false);
  const [imageUrl, setImageUrl] = useState(blocks.hero?.imageUrl ?? "");
  const [prizes, setPrizes] = useState<LandingPagePrizeBlock[]>(() => {
    const existing = getLandingPagePrizes(blocks);
    return existing.length > 0 ? existing : [];
  });
  const [howItWorksTitle, setHowItWorksTitle] = useState(
    () => getHowItWorksFromBlocks(blocks).title
  );
  const [howItWorksSteps, setHowItWorksSteps] = useState<LandingPageHowItWorksStep[]>(() => {
    const existing = blocks.howItWorks?.steps?.filter((step) => step.title?.trim());
    return existing?.length
      ? existing.map((step) => ({ ...step }))
      : DEFAULT_HOW_IT_WORKS_STEPS.map((step) => ({ ...step }));
  });
  const [keyDetailsTitle, setKeyDetailsTitle] = useState(
    blocks.keyDetails?.title ?? DEFAULT_KEY_DETAILS_TITLE
  );
  const [promotionPeriod, setPromotionPeriod] = useState(blocks.keyDetails?.promotionPeriod ?? "");
  const [eligibleProducts, setEligibleProducts] = useState(blocks.keyDetails?.eligibleProducts ?? "");
  const [purchaseLimits, setPurchaseLimits] = useState(blocks.keyDetails?.purchaseLimits ?? "");
  const [redemptionWindow, setRedemptionWindow] = useState(blocks.keyDetails?.redemptionWindow ?? "");
  const [featuredProducts, setFeaturedProducts] = useState<LandingPageFeaturedProduct[]>(
    blocks.featuredProducts?.length ? blocks.featuredProducts : []
  );
  const [rules, setRules] = useState(blocks.rules?.content ?? "");
  const [consentText, setConsentText] = useState(
    blocks.form?.consentText ?? "I agree to the official rules and to receive emails from CAT4."
  );
  const [startsAt, setStartsAt] = useState(page?.startsAt ? new Date(page.startsAt).toISOString().slice(0, 16) : "");
  const [endsAt, setEndsAt] = useState(page?.endsAt ? new Date(page.endsAt).toISOString().slice(0, 16) : "");
  const [passwordProtected, setPasswordProtected] = useState(blocks.settings?.passwordProtected ?? false);
  const [accessPassword, setAccessPassword] = useState(blocks.settings?.accessPassword ?? "");
  const [countdownEnabled, setCountdownEnabled] = useState(blocks.settings?.countdownEnabled ?? true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function updateFeaturedProduct(
    index: number,
    patch: Partial<LandingPageFeaturedProduct>
  ) {
    setFeaturedProducts((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  }

  function updatePrize(index: number, patch: Partial<LandingPagePrizeBlock>) {
    setPrizes((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  }

  function updateHowItWorksStep(index: number, patch: Partial<LandingPageHowItWorksStep>) {
    setHowItWorksSteps((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  }

  function buildBlocks(): LandingPageBlock {
    return {
      settings: {
        passwordProtected,
        accessPassword: passwordProtected ? accessPassword : undefined,
        countdownEnabled,
      },
      hero: {
        headline: headline || title,
        subheadline,
        ctaLabel: ctaLabel.trim() || undefined,
        videoUrl: videoUrl || undefined,
        imageUrl: imageUrl || undefined,
      },
      form: {
        fields: [
          { name: "email", label: "Email", required: true, type: "email" },
          { name: "firstName", label: "First Name", required: false, type: "text" },
          { name: "lastName", label: "Last Name", required: false, type: "text" },
        ],
        consentText,
      },
      rules: { content: rules },
      prizes: normalizePrizes(prizes),
      howItWorks: normalizeHowItWorksSteps(howItWorksTitle, howItWorksSteps),
      keyDetails: normalizeKeyDetails({
        title: keyDetailsTitle,
        promotionPeriod,
        eligibleProducts,
        purchaseLimits,
        redemptionWindow,
      }),
      featuredProducts: normalizeFeaturedProducts(featuredProducts),
    };
  }

  const previewDraft = useMemo(
    () => ({
      title,
      slug: slug || slugify(title) || "preview",
      type,
      status,
      blocks: buildBlocks(),
      startsAt,
      endsAt,
    }),
    [
      title,
      slug,
      type,
      status,
      headline,
      subheadline,
      ctaLabel,
      videoUrl,
      imageUrl,
      prizes,
      howItWorksTitle,
      howItWorksSteps,
      keyDetailsTitle,
      promotionPeriod,
      eligibleProducts,
      purchaseLimits,
      redemptionWindow,
      featuredProducts,
      rules,
      consentText,
      passwordProtected,
      accessPassword,
      countdownEnabled,
      startsAt,
      endsAt,
    ]
  );

  function loadSweepstakesTemplate() {
    const template = sweepstakesTemplateBlocks(title || "CAT4 Sweepstakes");
    setType("sweepstakes");
    setHeadline(template.hero?.headline ?? "");
    setSubheadline(template.hero?.subheadline ?? "");
    setCtaLabel(template.hero?.ctaLabel ?? "");
    setVideoUrl(template.hero?.videoUrl ?? DEFAULT_HERO_YOUTUBE_URL);
    setPrizes(getLandingPagePrizes(template));
    setHowItWorksTitle(getHowItWorksFromBlocks(template).title);
    setHowItWorksSteps(
      template.howItWorks?.steps?.length
        ? template.howItWorks.steps.map((step) => ({ ...step }))
        : DEFAULT_HOW_IT_WORKS_STEPS.map((step) => ({ ...step }))
    );
    setKeyDetailsTitle(template.keyDetails?.title ?? DEFAULT_KEY_DETAILS_TITLE);
    setPromotionPeriod(template.keyDetails?.promotionPeriod ?? "");
    setEligibleProducts(template.keyDetails?.eligibleProducts ?? "");
    setPurchaseLimits(template.keyDetails?.purchaseLimits ?? "");
    setRedemptionWindow(template.keyDetails?.redemptionWindow ?? "");
    setFeaturedProducts(template.featuredProducts?.length ? template.featuredProducts : []);
    setRules(template.rules?.content ?? "");
    setConsentText(template.form?.consentText ?? consentText);
    if (!startsAt) {
      setStartsAt(new Date().toISOString().slice(0, 16));
    }
    if (!endsAt) {
      const end = new Date();
      end.setMonth(end.getMonth() + 3);
      setEndsAt(end.toISOString().slice(0, 16));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const incomplete = featuredProducts.find(
      (item) => (item.name.trim() && !item.url.trim()) || (!item.name.trim() && item.url.trim())
    );
    if (incomplete) {
      setError("Featured products need both a name and an external URL.");
      setLoading(false);
      return;
    }

    const data = {
      title,
      slug: slug || slugify(title),
      type,
      status,
      blocks: buildBlocks(),
      startsAt: startsAt || null,
      endsAt: endsAt || null,
    };

    const result = page ? await updateLandingPage(page.id, data) : await createLandingPage(data);
    if (result.success) {
      if (onSuccess) onSuccess();
      else {
        router.push("/admin/landing-pages");
        router.refresh();
      }
    } else {
      setError(result.error ?? "Failed");
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!page) return;
    if (!confirm(`Delete "${page.title}"? This cannot be undone.`)) return;
    setLoading(true);
    const result = await deleteLandingPage(page.id);
    if (result.success) {
      if (onSuccess) onSuccess();
      else {
        router.push("/admin/landing-pages");
        router.refresh();
      }
    } else {
      setError(result.error ?? "Failed to delete");
      setLoading(false);
    }
  }

  return (
    <div className={dialog ? "space-y-6 lg:grid lg:grid-cols-2 lg:items-start lg:gap-6" : "xl:grid xl:grid-cols-2 xl:items-start xl:gap-8"}>
      <form onSubmit={handleSubmit} className="min-w-0 space-y-6">
      {!dialog && (
        <Button asChild variant="ghost" className="-ml-2">
          <Link href="/admin/landing-pages">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back
          </Link>
        </Button>
      )}

      {!page && (
        <Button type="button" variant="outline" onClick={loadSweepstakesTemplate}>
          <Sparkles className="mr-2 h-4 w-4" />
          Load sweepstakes template
        </Button>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Title</Label>
          <Input
            required
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!page) setSlug(slugify(e.target.value));
            }}
            className="mt-1"
          />
        </div>
        <div>
          <Label>Slug</Label>
          <Input required value={slug} onChange={(e) => setSlug(e.target.value)} className="mt-1" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Type</Label>
          <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANDING_PAGE_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Status</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className={`space-y-4 p-4 ${adminPanelClass}`}>
        <h3 className="font-semibold">Hero Block</h3>
        <div>
          <Label>Headline</Label>
          <Input value={headline} onChange={(e) => setHeadline(e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label>Subheadline</Label>
          <Input value={subheadline} onChange={(e) => setSubheadline(e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label>CTA Button Label</Label>
          <Input
            value={ctaLabel}
            onChange={(e) => setCtaLabel(e.target.value)}
            placeholder={DEFAULT_PROMOTION_CTA_LABEL}
            className="mt-1"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Text for the primary action button on the promotion page.
          </p>
        </div>
        <div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1">
              <Label>YouTube or Video URL</Label>
              <Input
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder={DEFAULT_HERO_YOUTUBE_URL}
                className="mt-1"
              />
            </div>
            <div className="flex shrink-0 items-center gap-2 sm:pb-0.5">
              <Switch
                checked={previewVideoAutoplay}
                onCheckedChange={setPreviewVideoAutoplay}
                id="preview-video-autoplay"
              />
              <Label htmlFor="preview-video-autoplay" className="text-sm font-normal">
                Play in preview
              </Label>
            </div>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Paste a YouTube link or direct video URL. Upload below if you prefer a hosted file.
          </p>
        </div>
        <FileUpload label="Hero Video (upload)" accept="video/*" value={videoUrl} onChange={setVideoUrl} />
        <FileUpload label="Hero Image" accept="image/*" value={imageUrl} onChange={setImageUrl} />
      </div>

      <div className={`space-y-4 p-4 ${adminPanelClass}`}>
        <div>
          <h3 className="font-semibold">Prize Blocks (optional)</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Add one or more prizes to highlight on the promotion page.
          </p>
        </div>
        {prizes.map((prize, index) => (
          <div key={index} className="space-y-3 rounded-lg border border-border p-3">
            <div className="flex items-start justify-between gap-2">
              <span className="text-sm font-medium text-muted-foreground">Prize {index + 1}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setPrizes((prev) => prev.filter((_, i) => i !== index))}
                aria-label={`Remove prize ${index + 1}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div>
              <Label>Label (optional)</Label>
              <Input
                value={prize.label ?? ""}
                onChange={(e) => updatePrize(index, { label: e.target.value })}
                placeholder={index === 0 ? "Grand Prize" : "Prize"}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Prize Title</Label>
              <Input
                value={prize.title}
                onChange={(e) => updatePrize(index, { title: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Prize Description</Label>
              <Textarea
                value={prize.description}
                onChange={(e) => updatePrize(index, { description: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Image URL (optional)</Label>
              <Input
                type="url"
                value={prize.imageUrl ?? ""}
                onChange={(e) => updatePrize(index, { imageUrl: e.target.value })}
                placeholder="https://"
                className="mt-1"
              />
            </div>
            <FileUpload
              label="Prize Image (upload)"
              accept="image/*"
              value={prize.imageUrl}
              onChange={(url) => updatePrize(index, { imageUrl: url })}
            />
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setPrizes((prev) => [...prev, emptyPrize()])}
        >
          <Plus className="mr-1 h-4 w-4" />
          Add Prize
        </Button>
      </div>

      <div className={`space-y-4 p-4 ${adminPanelClass}`}>
        <div>
          <h3 className="font-semibold">Key Details (optional)</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Highlight promotion terms visitors should know at a glance.
          </p>
        </div>
        <div>
          <Label>Section Title</Label>
          <Input
            value={keyDetailsTitle}
            onChange={(e) => setKeyDetailsTitle(e.target.value)}
            placeholder={DEFAULT_KEY_DETAILS_TITLE}
            className="mt-1"
          />
        </div>
        <div>
          <Label>Promotion Period</Label>
          <Textarea
            value={promotionPeriod}
            onChange={(e) => setPromotionPeriod(e.target.value)}
            placeholder="e.g. January 1 – March 31, 2026"
            className="mt-1"
          />
        </div>
        <div>
          <Label>Eligible Products</Label>
          <Textarea
            value={eligibleProducts}
            onChange={(e) => setEligibleProducts(e.target.value)}
            placeholder="e.g. All CAT4 cartridges and flower products"
            className="mt-1"
          />
        </div>
        <div>
          <Label>Purchase Limits</Label>
          <Textarea
            value={purchaseLimits}
            onChange={(e) => setPurchaseLimits(e.target.value)}
            placeholder="e.g. One entry per household per day"
            className="mt-1"
          />
        </div>
        <div>
          <Label>Redemption Window</Label>
          <Textarea
            value={redemptionWindow}
            onChange={(e) => setRedemptionWindow(e.target.value)}
            placeholder="e.g. Winners must claim prizes within 30 days of notification"
            className="mt-1"
          />
        </div>
      </div>

      <div className={`space-y-4 p-4 ${adminPanelClass}`}>
        <div>
          <h3 className="font-semibold">How It Works</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Customize the steps shown on the promotion landing page.
          </p>
        </div>
        <div>
          <Label>Section Title</Label>
          <Input
            value={howItWorksTitle}
            onChange={(e) => setHowItWorksTitle(e.target.value)}
            placeholder={DEFAULT_HOW_IT_WORKS_TITLE}
            className="mt-1"
          />
        </div>
        {howItWorksSteps.map((step, index) => (
          <div key={index} className="space-y-3 rounded-lg border border-border p-3">
            <div className="flex items-start justify-between gap-2">
              <span className="text-sm font-medium text-muted-foreground">Step {index + 1}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setHowItWorksSteps((prev) => prev.filter((_, i) => i !== index))}
                aria-label={`Remove step ${index + 1}`}
                disabled={howItWorksSteps.length <= 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div>
              <Label>Step Title</Label>
              <Input
                value={step.title}
                onChange={(e) => updateHowItWorksStep(index, { title: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Step Description</Label>
              <Textarea
                value={step.description}
                onChange={(e) => updateHowItWorksStep(index, { description: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setHowItWorksSteps((prev) => [...prev, emptyHowItWorksStep()])}
        >
          <Plus className="mr-1 h-4 w-4" />
          Add Step
        </Button>
      </div>

      <div className={`space-y-4 p-4 ${adminPanelClass}`}>
        <div>
          <h3 className="font-semibold">Featured Products (optional)</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Link out to related products on external retailer or brand pages.
          </p>
        </div>
        {featuredProducts.map((product, index) => (
          <div key={index} className="space-y-3 rounded-lg border border-border p-3">
            <div className="flex items-start justify-between gap-2">
              <span className="text-sm font-medium text-muted-foreground">Product {index + 1}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setFeaturedProducts((prev) => prev.filter((_, i) => i !== index))}
                aria-label={`Remove product ${index + 1}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Name</Label>
                <Input
                  value={product.name}
                  onChange={(e) => updateFeaturedProduct(index, { name: e.target.value })}
                  placeholder="Product name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>External URL</Label>
                <Input
                  type="url"
                  value={product.url}
                  onChange={(e) => updateFeaturedProduct(index, { url: e.target.value })}
                  placeholder="https://"
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label>Description (optional)</Label>
              <Input
                value={product.description ?? ""}
                onChange={(e) => updateFeaturedProduct(index, { description: e.target.value })}
                placeholder="Short blurb"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Image URL (optional)</Label>
              <Input
                type="url"
                value={product.imageUrl ?? ""}
                onChange={(e) => updateFeaturedProduct(index, { imageUrl: e.target.value })}
                placeholder="https://"
                className="mt-1"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Paste an external image link, or upload a file below.
              </p>
            </div>
            <FileUpload
              label="Product Image (upload)"
              accept="image/*"
              value={product.imageUrl}
              onChange={(url) => updateFeaturedProduct(index, { imageUrl: url })}
            />
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setFeaturedProducts((prev) => [...prev, emptyFeaturedProduct()])}
        >
          <Plus className="mr-1 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <div className={`space-y-4 p-4 ${adminPanelClass}`}>
        <h3 className="font-semibold">Form Block</h3>
        <div>
          <Label>Consent Text</Label>
          <Textarea value={consentText} onChange={(e) => setConsentText(e.target.value)} className="mt-1" />
        </div>
      </div>

      <div className={`space-y-4 p-4 ${adminPanelClass}`}>
        <h3 className="font-semibold">Rules Block</h3>
        <div>
          <Label>Official Rules</Label>
          <Textarea rows={8} value={rules} onChange={(e) => setRules(e.target.value)} className="mt-1" />
        </div>
      </div>

      <div className={`space-y-4 p-4 ${adminPanelClass}`}>
        <h3 className="font-semibold">Promotion Settings</h3>
        <div className="flex items-center justify-between gap-4">
          <div>
            <Label>Password Protected</Label>
            <p className="text-xs text-muted-foreground">
              Require a password before visitors can view this promotion.
            </p>
          </div>
          <Switch checked={passwordProtected} onCheckedChange={setPasswordProtected} />
        </div>
        {passwordProtected && (
          <div>
            <Label>Access Password</Label>
            <Input
              type="password"
              value={accessPassword}
              onChange={(event) => setAccessPassword(event.target.value)}
              placeholder="Enter promotion password"
              className="mt-1"
              required={passwordProtected}
            />
          </div>
        )}
        <div className="flex items-center justify-between gap-4">
          <div>
            <Label>Countdown Timer</Label>
            <p className="text-xs text-muted-foreground">
              Show a countdown to the promotion end date on the landing page.
            </p>
          </div>
          <Switch checked={countdownEnabled} onCheckedChange={setCountdownEnabled} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Starts At</Label>
          <Input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label>Ends At</Label>
          <Input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} className="mt-1" />
        </div>
      </div>

      {page && (
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span className="text-muted-foreground">
            Landing:{" "}
            <Link href={`/l/${page.slug}`} className="text-cat4-blue underline" target="_blank">
              /l/{page.slug}
            </Link>
            {" · "}
            Entry:{" "}
            <Link href={`/l/${page.slug}/enter`} className="text-cat4-blue underline" target="_blank">
              /l/{page.slug}/enter
            </Link>
          </span>
          <Button asChild variant="outline" size="sm">
            <Link href={`/admin/landing-pages/${page.id}/entries`}>View entries</Link>
          </Button>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : page ? "Update" : "Create"}
        </Button>
        {page && (
          <Button type="button" variant="destructive" disabled={loading} onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        )}
      </div>
      </form>

      <aside className="min-w-0 xl:sticky xl:top-8">
        <PromotionPagePreview
          draft={previewDraft}
          pageId={page?.id}
          previewVideoAutoplay={previewVideoAutoplay}
        />
      </aside>
    </div>
  );
}
