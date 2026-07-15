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
  getPromotionSettings,
  isPromotionActive,
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
  const prizes = getLandingPagePrizes(blocks);
  const howItWorks = getHowItWorksFromBlocks(blocks);
  const keyDetails = getKeyDetailsFromBlocks(blocks);
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

        <div className="relative z-10 flex min-h-[65vh] flex-col items-center justify-center px-4 py-16 text-center">
          <Link
            href="/"
            className="mb-6 text-sm font-semibold tracking-widest text-cat4-light/80 hover:text-cat4-light"
          >
            CAT4
          </Link>
          <span className="rounded-full bg-cat4-blue/30 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-cat4-light">
            {PROMOTION_TYPE_LABELS[page.type] ?? page.type}
          </span>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold text-cat4-light sm:text-5xl lg:text-6xl">
            {blocks.hero?.headline ?? page.title}
          </h1>
          {blocks.hero?.subheadline && (
            <p className="mt-4 max-w-xl text-lg text-cat4-light/90">{blocks.hero.subheadline}</p>
          )}
          {settings.countdownEnabled && <PromotionCountdown endsAt={page.endsAt} />}

          {active ? (
            <Button asChild size="lg" className="mt-8 px-10 text-base">
              <Link href={entryPath}>Join Now</Link>
            </Button>
          ) : (
            <p className="mt-8 rounded-full bg-white/10 px-6 py-2 text-sm text-cat4-light/80">
              This promotion is not currently active
            </p>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-16">
        {prizes.length > 0 && (
          <div className="mb-12 space-y-6">
            {prizes.map((prize, index) => (
              <div
                key={`${prize.title}-${index}`}
                className="rounded-xl border border-cat4-blue/40 bg-cat4-blue/15 p-8 text-center"
              >
                <SectionLabel>{prize.label ?? (index === 0 ? "Grand Prize" : "Prize")}</SectionLabel>
                {prize.imageUrl && (
                  <div className="mx-auto mt-4 max-w-xs overflow-hidden rounded-lg">
                    <img
                      src={prize.imageUrl}
                      alt={prize.title}
                      className="h-auto w-full object-cover"
                    />
                  </div>
                )}
                <h2 className="mt-2 text-2xl font-bold text-cat4-light sm:text-3xl">{prize.title}</h2>
                <p className="mx-auto mt-3 max-w-xl text-cat4-light/80">{prize.description}</p>
                {active && index === prizes.length - 1 && (
                  <Button asChild size="lg" className="mt-6">
                    <Link href={entryPath}>Join Now</Link>
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        {keyDetails && (
          <div className="mb-12 rounded-xl border border-white/10 bg-white/5 p-6 sm:p-8">
            <h2 className="text-center text-2xl font-bold text-cat4-light">{keyDetails.title}</h2>
            <dl className="mt-8 grid gap-4 sm:grid-cols-2 sm:gap-6">
              {keyDetails.items.map(({ label, value }) => (
                <div
                  key={label}
                  className="rounded-lg border border-white/10 bg-cat4-dark/40 p-4"
                >
                  <dt className="text-xs font-semibold uppercase tracking-wider text-cat4-blue">
                    {label}
                  </dt>
                  <dd className="mt-2 whitespace-pre-wrap text-sm text-cat4-light/80">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        <div className="mb-12">
          <h2 className="text-center text-2xl font-bold text-cat4-light">{howItWorks.title}</h2>
          <div
            className={`mt-8 grid gap-2 sm:gap-6 ${
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
                  <h3 className="mt-2 text-xs font-semibold text-cat4-light sm:mt-4 sm:text-base">{title}</h3>
                  <p className="mt-1 hidden text-sm text-cat4-light/70 sm:mt-2 sm:block">{description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {featuredProducts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-center text-2xl font-bold text-cat4-light">Featured Products</h2>
            <p className="mx-auto mt-2 max-w-xl text-center text-cat4-light/70">
              Explore products related to this promotion.
            </p>
            <div
              className={`mt-8 grid gap-4 ${
                featuredProducts.length === 1
                  ? "mx-auto max-w-sm"
                  : featuredProducts.length === 2
                    ? "sm:grid-cols-2"
                    : "sm:grid-cols-2 lg:grid-cols-3"
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
                        className="absolute inset-0 h-full w-full object-contain p-4 transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-cat4-blue/40">
                        <span className="text-4xl font-bold">{product.name[0]}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="font-semibold text-cat4-light group-hover:text-cat4-blue">
                      {product.name}
                    </h3>
                    {product.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-cat4-light/60">{product.description}</p>
                    )}
                    <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-cat4-blue">
                      View product
                      <ExternalLink className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {active && (
          <div className="rounded-xl border border-cat4-blue/30 bg-gradient-to-br from-cat4-blue/20 to-transparent p-8 text-center">
            <h2 className="text-2xl font-bold text-cat4-light">Ready to enter?</h2>
            <p className="mt-2 text-cat4-light/80">
              Complete the entry wizard for your chance to win.
            </p>
            <Button asChild size="lg" className="mt-6 px-10">
              <Link href={entryPath}>Join Now</Link>
            </Button>
          </div>
        )}

        {blocks.rules?.content && (
          <div className="mt-12 rounded-xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-bold text-cat4-light">Official Rules</h2>
            <div className="mt-4 whitespace-pre-wrap text-sm text-cat4-light/70">
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
