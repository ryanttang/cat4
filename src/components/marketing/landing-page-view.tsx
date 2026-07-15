"use client";

import Link from "next/link";
import { ExternalLink, Gift, Sparkles, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LandingPageHero } from "@/components/marketing/landing-page-hero";
import { SectionLabel } from "@/components/marketing/section-label";
import { PromotionCountdown } from "@/components/marketing/promotion-countdown";
import { PromotionPasswordGate } from "@/components/marketing/promotion-password-gate";
import {
  getHowItWorksFromBlocks,
  getKeyDetailsFromBlocks,
  getLandingPagePrizes,
  getPromotionCtaLabel,
  getPromotionSections,
  getPromotionSettings,
  isPromotionActive,
  isPromotionCtaVisible,
  PROMOTION_TYPE_LABELS,
  promotionEntryPath,
} from "@/lib/promotion-utils";
import type { LandingPage, LandingPageBlock } from "@/lib/db/schema";

type LandingPageViewProps = {
  page: LandingPage;
  preview?: boolean;
  previewVideoAutoplay?: boolean;
};

const HOW_IT_WORKS_ICONS = [Sparkles, Gift, Trophy] as const;

export function LandingPageView({
  page,
  preview = false,
  previewVideoAutoplay = false,
}: LandingPageViewProps) {
  const blocks = page.blocks as LandingPageBlock;
  const settings = getPromotionSettings(blocks);
  const sections = getPromotionSections(blocks);
  const prizes = getLandingPagePrizes(blocks);
  const howItWorks = getHowItWorksFromBlocks(blocks);
  const keyDetails = getKeyDetailsFromBlocks(blocks);
  const ctaLabel = getPromotionCtaLabel(blocks);
  const showCta = isPromotionCtaVisible(blocks);
  const active = preview || isPromotionActive(page);
  const entryPath = promotionEntryPath(page.slug);
  const heroAutoplay = preview ? previewVideoAutoplay : true;
  const featuredProducts = (blocks.featuredProducts ?? []).filter(
    (product) => product.name?.trim() && product.url?.trim()
  );

  const content = (
    <div className={preview ? "pointer-events-none" : undefined}>
      <div className="min-h-screen bg-cat4-dark">
      <section className="relative min-h-[65vh] overflow-hidden">
        <LandingPageHero
          key={preview ? `${blocks.hero?.videoUrl ?? ""}-${previewVideoAutoplay}` : undefined}
          videoUrl={blocks.hero?.videoUrl}
          imageUrl={blocks.hero?.imageUrl}
          autoplay={heroAutoplay}
        />
        <div className="absolute inset-0 bg-black/50" aria-hidden="true" />

        <div className="relative z-10 flex min-h-[65vh] flex-col items-center justify-center px-4 py-12 text-center sm:py-16">
          <Link
            href="/"
            className="mb-4 text-sm font-semibold tracking-widest text-cat4-light/80 hover:text-cat4-light sm:mb-6"
          >
            CAT4
          </Link>
          <span className="rounded-full bg-cat4-blue/30 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-cat4-light">
            {PROMOTION_TYPE_LABELS[page.type] ?? page.type}
          </span>
          <div className="mt-4 w-full max-w-3xl rounded-2xl border border-white/15 bg-black/50 px-5 py-5 shadow-lg backdrop-blur-md sm:mt-5 sm:px-8 sm:py-7">
            <h1 className="text-3xl font-bold leading-tight text-cat4-light sm:text-5xl lg:text-6xl">
              {blocks.hero?.headline ?? page.title}
            </h1>
            {blocks.hero?.subheadline && (
              <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-cat4-light/90 sm:mt-4 sm:text-lg">
                {blocks.hero.subheadline}
              </p>
            )}
          </div>
          {settings.countdownEnabled && <PromotionCountdown endsAt={page.endsAt} />}

          {showCta &&
            (active ? (
              <Button asChild size="lg" className="mt-6 px-8 text-base sm:mt-8 sm:px-10">
                <Link href={entryPath}>{ctaLabel}</Link>
              </Button>
            ) : (
              <p className="mt-6 rounded-full bg-white/10 px-6 py-2 text-sm text-cat4-light/80 sm:mt-8">
                This promotion is not currently active
              </p>
            ))}
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-10 sm:py-16">
        {sections.prizes && prizes.length > 0 && (
          <div className="mb-10 sm:mb-12">
            <div
              className={`grid gap-3 sm:gap-4 ${
                prizes.length === 1
                  ? "mx-auto max-w-sm"
                  : prizes.length === 2
                    ? "grid-cols-2"
                    : "grid-cols-3"
              }`}
            >
              {prizes.map((prize, index) => (
                <div
                  key={`${prize.title}-${index}`}
                  className="flex flex-col overflow-hidden rounded-xl border border-cat4-blue/40 bg-cat4-blue/15 text-center"
                >
                  {prize.imageUrl ? (
                    <div className="relative aspect-[4/3] bg-cat4-dark/30">
                      <img
                        src={prize.imageUrl}
                        alt={prize.title}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    </div>
                  ) : null}
                  <div className="flex flex-1 flex-col p-2.5 sm:p-5 lg:p-6">
                    <SectionLabel className="self-center px-2 py-0.5 text-[10px] tracking-wide sm:px-3 sm:py-1 sm:text-xs sm:tracking-wider">
                      {prize.label ?? (index === 0 ? "Grand Prize" : "Prize")}
                    </SectionLabel>
                    <h2 className="mt-1.5 text-sm font-bold leading-snug text-cat4-light sm:mt-2 sm:text-xl lg:text-2xl">
                      {prize.title}
                    </h2>
                    <p className="mt-1 flex-1 text-[10px] leading-snug text-cat4-light/80 sm:mt-2 sm:text-xs sm:leading-relaxed md:text-sm">
                      {prize.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {showCta && active && (
              <div className="mt-6 flex justify-center sm:mt-8">
                <Button asChild size="lg">
                  <Link href={entryPath}>{ctaLabel}</Link>
                </Button>
              </div>
            )}
          </div>
        )}

        {sections.keyDetails && keyDetails && (
          <div className="mb-10 rounded-xl border border-white/10 bg-white/5 p-4 sm:mb-12 sm:p-8">
            <h2 className="text-center text-xl font-bold text-cat4-light sm:text-2xl">
              {keyDetails.title}
            </h2>
            <dl
              className={`mt-5 grid gap-3 sm:mt-8 sm:gap-6 ${
                keyDetails.items.length === 1 ? "grid-cols-1" : "grid-cols-2"
              }`}
            >
              {keyDetails.items.map(({ label, value }) => (
                <div
                  key={label}
                  className="rounded-lg border border-white/10 bg-cat4-dark/40 p-2.5 sm:p-4"
                >
                  <dt className="text-[9px] font-semibold uppercase tracking-wide text-cat4-blue sm:text-xs sm:tracking-wider">
                    {label}
                  </dt>
                  <dd className="mt-1 whitespace-pre-wrap text-[10px] leading-snug text-cat4-light/80 sm:mt-2 sm:text-xs sm:leading-relaxed md:text-sm">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {sections.howItWorks && (
          <div className="mb-10 sm:mb-12">
            <h2 className="text-center text-xl font-bold text-cat4-light sm:text-2xl">
              {howItWorks.title}
            </h2>
            <div
              className={`mt-5 grid gap-2 sm:mt-8 sm:gap-6 ${
                howItWorks.steps.length === 1
                  ? "grid-cols-1"
                  : howItWorks.steps.length === 2
                    ? "grid-cols-2"
                    : "grid-cols-3"
              }`}
            >
              {howItWorks.steps.map(({ title, description }, index) => {
                const Icon = HOW_IT_WORKS_ICONS[index % HOW_IT_WORKS_ICONS.length];
                return (
                  <div
                    key={`${title}-${index}`}
                    className="rounded-xl border border-white/10 bg-white/5 p-3 text-center sm:p-6"
                  >
                    <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-cat4-blue/20 text-cat4-blue sm:h-12 sm:w-12">
                      <Icon className="h-4 w-4 sm:h-6 sm:w-6" />
                    </div>
                    <h3 className="mt-2 text-xs font-semibold leading-snug text-cat4-light sm:mt-4 sm:text-base">
                      {title}
                    </h3>
                    <p className="mt-1 text-[10px] leading-snug text-cat4-light/70 sm:mt-2 sm:text-xs sm:leading-relaxed md:text-sm">
                      {description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {sections.featuredProducts && featuredProducts.length > 0 && (
          <div className="mb-10 sm:mb-12">
            <h2 className="text-center text-xl font-bold text-cat4-light sm:text-2xl">
              Featured Products
            </h2>
            <p className="mx-auto mt-1.5 max-w-xl text-center text-sm text-cat4-light/70 sm:mt-2 sm:text-base">
              Explore products related to this promotion.
            </p>
            <div
              className={`mt-5 grid gap-3 sm:mt-8 sm:gap-4 ${
                featuredProducts.length === 1
                  ? "mx-auto max-w-sm"
                  : featuredProducts.length === 2
                    ? "grid-cols-2"
                    : "grid-cols-3"
              }`}
            >
              {featuredProducts.map((product) => (
                <a
                  key={`${product.name}-${product.url}`}
                  href={product.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col overflow-hidden rounded-xl border border-white/10 bg-white/5 transition-colors hover:border-cat4-blue/50"
                >
                  <div className="relative aspect-square bg-cat4-surface/50">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="absolute inset-0 h-full w-full object-contain p-2 transition-transform group-hover:scale-105 sm:p-4"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-cat4-blue/40">
                        <span className="text-2xl font-bold sm:text-4xl">{product.name[0]}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-2.5 sm:p-4">
                    <h3 className="text-sm font-semibold leading-snug text-cat4-light group-hover:text-cat4-blue sm:text-base">
                      {product.name}
                    </h3>
                    {product.description && (
                      <p className="mt-1 line-clamp-2 text-[10px] leading-snug text-cat4-light/60 sm:text-xs sm:leading-relaxed md:text-sm">
                        {product.description}
                      </p>
                    )}
                    <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-medium text-cat4-blue sm:mt-3 sm:text-sm">
                      View product
                      <ExternalLink className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {showCta && active && (
          <div className="rounded-xl border border-cat4-blue/30 bg-gradient-to-br from-cat4-blue/20 to-transparent p-6 text-center sm:p-8">
            <h2 className="text-xl font-bold text-cat4-light sm:text-2xl">Ready to enter?</h2>
            <p className="mt-2 text-sm text-cat4-light/80 sm:text-base">
              Complete the entry wizard for your chance to win.
            </p>
            <Button asChild size="lg" className="mt-5 px-8 sm:mt-6 sm:px-10">
              <Link href={entryPath}>{ctaLabel}</Link>
            </Button>
          </div>
        )}

        {sections.rules && blocks.rules?.content && (
          <div className="mt-10 rounded-xl border border-white/10 bg-white/5 p-4 sm:mt-12 sm:p-6">
            <h2 className="text-base font-bold text-cat4-light sm:text-lg">Official Rules</h2>
            <div className="mt-3 whitespace-pre-wrap text-xs leading-relaxed text-cat4-light/70 sm:mt-4 sm:text-sm">
              {blocks.rules.content}
            </div>
          </div>
        )}
      </div>
    </div>
    </div>
  );

  if (preview) {
    return content;
  }

  return (
    <PromotionPasswordGate
      slug={page.slug}
      passwordProtected={settings.passwordProtected}
      accessPassword={settings.accessPassword}
    >
      {content}
    </PromotionPasswordGate>
  );
}
