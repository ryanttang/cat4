"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ChevronDown,
  ChevronRight,
  BadgeCheck,
  FlaskConical,
  Layers,
  Package,
  ShieldCheck,
  Sparkles,
  Tag,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAllCategoryCoverImages } from "@/lib/category-images";
import { CATALOG_CATEGORIES } from "@/lib/product-filters";
import { CATEGORY_BREAKDOWNS } from "@/lib/product-education";
import { CategoryIcon } from "@/components/marketing/category-icon";
import { SectionLabel } from "@/components/marketing/section-label";
import { formatPriceDisplay, cn } from "@/lib/utils";
import type { HomepageContent } from "@/lib/homepage";
import type { Product } from "@/lib/db/schema";

const HERO_MOSAIC = [
  "/products/strawberry-banana-all-in-one-1g.webp",
  "/products/indica-preroll-single-1g.webp",
  "/products/jet-fuel-14g.webp",
  "/products/wedding-cake-badder-1g.webp",
  "/products/galactic-gelato-pod-1g.webp",
  "/products/hybrid-preroll-single-1g.webp",
];

const ICON_MAP: Record<string, LucideIcon> = {
  tag: Tag,
  "badge-check": BadgeCheck,
  layers: Layers,
  sparkles: Sparkles,
  "shield-check": ShieldCheck,
  "flask-conical": FlaskConical,
};

type BrandLandingProps = {
  products: Product[];
  featuredProducts: Product[];
  content: HomepageContent;
  preview?: boolean;
};

export function BrandLanding({ products, featuredProducts, content, preview = false }: BrandLandingProps) {
  const categoryImages = getAllCategoryCoverImages(products);
  const productCount = products.filter((p) => p.published).length;
  const mosaicImages =
    featuredProducts.length >= 4
      ? featuredProducts.slice(0, 6).map((p) => (p.images as string[])?.[0]).filter(Boolean)
      : HERO_MOSAIC;
  const fanFavoriteIds = new Set(featuredProducts.slice(0, 8).map((p) => p.id));
  const fanFavoriteProducts = [
    ...featuredProducts.slice(0, 8),
    ...products
      .filter((p) => p.published && p.category === "extract" && !fanFavoriteIds.has(p.id))
      .slice(0, 2),
  ];

  const stats = content.stats.map((stat) => {
    const labelLower = stat.label.toLowerCase();
    const Icon =
      stat.useProductCount || labelLower.includes("product")
        ? Package
        : labelLower.includes("lab")
          ? FlaskConical
          : BadgeCheck;
    return {
      value: stat.useProductCount ? `${productCount}+` : stat.value,
      label: stat.label,
      Icon,
    };
  });

  return (
    <div className={cn("bg-cat4-primary", preview && "pointer-events-none")}>
      <div
        className={cn(
          "flex flex-col",
          preview
            ? "relative min-h-[24rem]"
            : "fixed inset-x-0 top-16 z-0 h-[62vh] sm:h-[72vh] lg:h-[calc(100vh-4rem)]"
        )}
      >
        <section
          className={cn(
            "relative overflow-hidden bg-cat4-dark",
            preview ? "min-h-[18rem] py-8" : "flex min-h-0 flex-1"
          )}
        >
          <div className="absolute inset-0 grid grid-cols-3 grid-rows-2 gap-1 opacity-30 sm:grid-cols-6 sm:grid-rows-1">
            {mosaicImages.map((src, i) => (
              <div key={`${src}-${i}`} className="relative min-h-[120px] sm:min-h-0">
                <Image src={src as string} alt="" fill className="object-contain p-2" sizes="20vw" />
              </div>
            ))}
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-cat4-dark/80 via-cat4-dark/90 to-cat4-dark" />

          <div className="relative z-10 mx-auto flex flex-1 max-w-5xl flex-col items-center justify-center px-4 py-6 text-center sm:py-12 lg:py-16">
            <span className="rounded-full border border-cat4-blue/40 bg-cat4-blue/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-cat4-light sm:px-4 sm:text-xs">
              {content.hero.badge}
            </span>
            <h1
              className={cn(
                "mt-3 font-bold leading-tight text-cat4-light sm:mt-6",
                preview ? "text-2xl sm:text-3xl" : "text-3xl sm:text-6xl lg:text-7xl"
              )}
            >
              {content.hero.headline}
              <span className="mt-1 block text-cat4-blue sm:mt-2">{content.hero.headlineAccent}</span>
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-snug text-cat4-light/85 sm:mt-5 sm:text-base lg:text-lg">{content.hero.body}</p>
            <div className="mt-5 flex flex-wrap justify-center gap-3 sm:mt-10 sm:gap-4">
              <Button asChild size="lg" className="px-6 sm:px-8">
                <Link href={content.hero.primaryCta.href}>
                  {content.hero.primaryCta.label}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-cat4-light/30 bg-transparent text-cat4-light hover:bg-cat4-light/10"
              >
                <Link href={content.hero.secondaryCta.href}>{content.hero.secondaryCta.label}</Link>
              </Button>
            </div>
            {stats.length > 0 && (
              <ul className="mt-5 flex flex-wrap justify-center gap-2.5 sm:mt-7 sm:gap-3">
                {stats.map((stat) => (
                  <li
                    key={stat.label}
                    className="inline-flex items-center gap-2 rounded-md border border-cat4-blue/35 bg-cat4-blue/15 px-3 py-1.5 shadow-[inset_0_1px_0_0_rgba(253,253,253,0.06)] backdrop-blur-sm sm:gap-2.5 sm:px-3.5 sm:py-2"
                  >
                    <stat.Icon
                      className="h-3.5 w-3.5 shrink-0 text-cat4-blue sm:h-4 sm:w-4"
                      aria-hidden
                    />
                    <span className="flex items-baseline gap-1.5 text-left leading-none">
                      {stat.value ? (
                        <span className="text-sm font-bold tracking-tight text-cat4-blue sm:text-base">
                          {stat.value}
                        </span>
                      ) : null}
                      <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-cat4-light/75 sm:text-xs">
                        {stat.label}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {!preview && (
            <button
              type="button"
              onClick={() =>
                document.getElementById("home-content")?.scrollIntoView({ behavior: "smooth" })
              }
              className="absolute bottom-3 left-6 z-20 hidden items-center gap-2 text-cat4-light/50 transition-colors hover:text-cat4-light lg:flex"
              aria-label="Scroll down"
            >
              <ChevronDown className="h-5 w-5 animate-bounce" />
            </button>
          )}
        </section>

        <section
          className={cn(
            "shrink-0 border-t border-border/60 bg-cat4-surface",
            preview ? "px-3 py-3" : "px-3 py-3 sm:px-6 sm:py-4 lg:px-8 lg:py-5"
          )}
        >
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <SectionLabel>{content.lineup.sectionLabel}</SectionLabel>
            </div>

            <div className="mt-2.5 grid grid-cols-5 gap-1 sm:mt-3 sm:gap-2.5 md:gap-3 lg:gap-4">
              {CATALOG_CATEGORIES.map((cat) => {
                const image = categoryImages[cat.slug];
                return (
                  <Link
                    key={cat.slug}
                    href={`/products/${cat.slug}`}
                    className="group overflow-hidden rounded-md border border-border/40 bg-cat4-dark/40 transition-all hover:border-cat4-blue/50 hover:bg-cat4-dark/60 md:rounded-xl"
                  >
                    <div className="relative aspect-square">
                      {image && (
                        <Image
                          src={image}
                          alt={cat.label}
                          fill
                          className="object-contain p-1 transition-transform duration-300 group-hover:scale-105 sm:p-2 md:p-3 lg:p-4"
                          sizes="(max-width: 640px) 20vw, 20vw"
                        />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center p-1 md:p-3">
                        <span className="rounded-full border border-white/15 bg-cat4-dark/85 px-1.5 py-0.5 text-center text-[9px] font-semibold text-cat4-light shadow-sm backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:border-cat4-blue/60 group-hover:bg-cat4-blue group-hover:text-white sm:px-2 sm:text-[10px] md:px-3.5 md:py-1 md:text-sm lg:px-4 lg:py-1.5 lg:text-base">
                          {cat.label}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      {!preview && <div aria-hidden className="h-[62vh] sm:h-[72vh] lg:h-[calc(100vh-4rem)]" />}

      <div id="home-content" className={cn("bg-cat4-primary", !preview && "relative z-10")}>
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-cat4-light">{content.fanFavorites.title}</h2>
            <Button asChild>
              <Link href={content.fanFavorites.ctaHref}>
                {content.fanFavorites.ctaLabel}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="sm:contents">
            <div
              className="-mx-4 mt-5 flex gap-2.5 overflow-x-auto px-4 pb-2 scrollbar-hide snap-x snap-mandatory sm:mx-0 sm:mt-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-5"
              aria-label="Fan favorites products, scroll horizontally"
            >
              {fanFavoriteProducts.map((product) => {
                const image = (product.images as string[])?.[0];
                const price = formatPriceDisplay(product.price);
                if (!image) return null;
                return (
                  <Link
                    key={product.id}
                    href={`/products/${product.category}/${product.slug}`}
                    className="group w-[calc((100vw-2rem)/4)] shrink-0 snap-start overflow-hidden rounded-lg border border-border bg-cat4-surface transition-all hover:border-cat4-blue hover:shadow-md sm:w-auto sm:rounded-xl"
                  >
                    <div className="relative aspect-square bg-cat4-primary/80">
                      <Image
                        src={image}
                        alt={product.name}
                        fill
                        className="object-contain p-1.5 transition-transform group-hover:scale-105 sm:p-3"
                        sizes="(max-width: 640px) 25vw, 20vw"
                      />
                    </div>
                    <div className="p-2 sm:p-3">
                      <h3 className="line-clamp-2 text-[10px] font-semibold leading-tight text-cat4-light group-hover:text-cat4-blue sm:text-sm">
                        {product.name}
                      </h3>
                      {price && (
                        <p className="mt-0.5 text-[10px] font-semibold text-cat4-blue sm:mt-1 sm:text-sm">
                          {price}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
            <p className="mt-1.5 flex items-center justify-center gap-1 text-cat4-light/45 sm:hidden">
              <span className="text-[10px] font-medium uppercase tracking-wider">Swipe</span>
              <ChevronRight className="h-3.5 w-3.5 animate-pulse" aria-hidden="true" />
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
          <div className="grid grid-cols-2 items-start gap-3 sm:items-center sm:gap-8 lg:gap-12">
            <div className="relative aspect-[3/4] overflow-hidden rounded-xl shadow-xl sm:aspect-square sm:rounded-2xl lg:aspect-[4/5]">
              <Image
                src={content.whatIsCat4.imageUrl}
                alt={content.whatIsCat4.imageCaption}
                fill
                className="object-contain p-2 sm:p-8"
                sizes="(max-width: 1024px) 50vw, 50vw"
                priority
              />
              <div className="absolute bottom-2 left-2 rounded-md bg-cat4-dark/90 px-2 py-1 text-[10px] font-medium text-cat4-light sm:bottom-4 sm:left-4 sm:rounded-lg sm:px-4 sm:py-2 sm:text-sm">
                {content.whatIsCat4.imageCaption}
              </div>
            </div>
            <div className="min-w-0">
              <SectionLabel className="text-[10px] sm:text-xs">{content.whatIsCat4.sectionLabel}</SectionLabel>
              <h2 className="mt-2 text-lg font-bold leading-tight text-cat4-light sm:mt-3 sm:text-3xl lg:text-4xl">
                {content.whatIsCat4.title}
              </h2>
              <p className="mt-2 text-xs leading-snug text-cat4-light/70 sm:mt-4 sm:text-lg">{content.whatIsCat4.body}</p>
              <ul className="mt-3 space-y-2 sm:mt-8 sm:space-y-4">
                {content.whatIsCat4.bullets.map(({ icon, text }) => {
                  const Icon = ICON_MAP[icon] ?? Sparkles;
                  return (
                    <li key={text} className="flex items-start gap-2 sm:gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cat4-blue/10 text-cat4-blue sm:h-9 sm:w-9">
                        <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </span>
                      <span className="pt-0.5 text-[11px] leading-snug text-cat4-light/80 sm:pt-1.5 sm:text-base">{text}</span>
                    </li>
                  );
                })}
              </ul>
              <Button asChild size="sm" className="mt-4 sm:mt-8 sm:h-10 sm:px-4 sm:text-sm">
                <Link href={content.whatIsCat4.ctaHref}>
                  {content.whatIsCat4.ctaLabel}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
          <div className="text-center">
            <SectionLabel className="text-[10px] sm:text-xs">{content.benefits.sectionLabel}</SectionLabel>
            <h2 className="mt-2 text-xl font-bold leading-tight text-cat4-light sm:mt-3 sm:text-3xl lg:text-4xl">
              {content.benefits.title}
            </h2>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-2 sm:mt-8 sm:gap-4 lg:gap-6">
            {content.benefits.cards.map(({ title, icon }) => {
              const Icon = ICON_MAP[icon] ?? Tag;
              return (
                <div
                  key={title}
                  className="overflow-hidden rounded-xl border border-border bg-cat4-primary shadow-sm transition-shadow hover:shadow-lg sm:rounded-2xl"
                >
                  <div className="p-2 sm:p-6 lg:p-8">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-cat4-blue/10 text-cat4-blue sm:h-11 sm:w-11">
                      <Icon className="h-3 w-3 sm:h-5 sm:w-5" />
                    </span>
                    <h3 className="mt-1.5 text-[10px] font-bold leading-snug text-cat4-light sm:mt-4 sm:text-xl lg:text-2xl">
                      {title}
                    </h3>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="bg-muted/40 px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <SectionLabel className="text-[10px] sm:text-xs">{content.educationPreview.sectionLabel}</SectionLabel>
                <h2 className="mt-2 text-xl font-bold leading-tight text-cat4-light sm:text-3xl">
                  {content.educationPreview.title}
                </h2>
              </div>
              <Button asChild variant="outline">
                <Link href={content.educationPreview.ctaHref}>
                  {content.educationPreview.ctaLabel}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-4 lg:grid-cols-4 lg:gap-6">
              {CATEGORY_BREAKDOWNS.filter((c) => c.slug !== "merch").map((item) => {
                const image = categoryImages[item.slug] ?? item.imageFallback;
                return (
                  <Link
                    key={item.slug}
                    href={`/education#${item.slug}`}
                    className="group overflow-hidden rounded-xl border border-border bg-cat4-primary shadow-sm transition-all hover:border-cat4-blue hover:shadow-lg sm:rounded-2xl"
                  >
                    <div className="relative aspect-[4/3] bg-gradient-to-br from-cat4-blue/5 to-cat4-surface sm:aspect-[16/10]">
                      <Image src={image} alt={item.label} fill className="object-contain p-3 sm:p-6" sizes="(max-width: 1024px) 50vw, 25vw" />
                    </div>
                    <div className="p-3 sm:p-6">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cat4-blue/10 text-cat4-blue sm:h-9 sm:w-9">
                        <CategoryIcon name={item.icon} className="h-4 w-4 sm:h-4 sm:w-4" />
                      </span>
                      <h3 className="mt-2 text-xs font-bold leading-snug text-cat4-light group-hover:text-cat4-blue sm:mt-3 sm:text-lg">
                        CAT4 {item.label} vs. the market
                      </h3>
                      <p className="mt-1 line-clamp-2 text-[10px] leading-snug text-cat4-light/60 sm:text-sm">{item.headline}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-cat4-blue px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-black/10 blur-3xl" />
          <div className="relative mx-auto max-w-7xl">
            <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-10">
              <div className="relative min-h-[300px] lg:min-h-[480px]">
                <Image
                  src={content.finalCta.imageUrl}
                  alt={content.finalCta.title}
                  fill
                  className="object-contain p-6 sm:p-10"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
              <div>
                <SectionLabel className="border-white/30 bg-white/10 text-[10px] text-white sm:text-xs">
                  {content.finalCta.sectionLabel}
                </SectionLabel>
                <h2 className="mt-3 text-xl font-bold leading-tight text-white sm:mt-4 sm:text-3xl lg:text-4xl">
                  {content.finalCta.title}
                </h2>
                <p className="mt-2 text-sm font-medium text-white/90 sm:mt-4 sm:text-lg">{content.finalCta.subtitle}</p>
                {content.finalCta.bodyParagraphs.map((paragraph) => (
                  <p key={paragraph} className="mt-2 text-sm leading-snug text-white/85 sm:mt-4 sm:text-base">
                    {paragraph.replace("{productCount}", String(productCount))}
                  </p>
                ))}
                <div className="mt-5 flex flex-wrap gap-3 sm:mt-8 sm:gap-4">
                  <Button asChild size="lg" variant="secondary" className="bg-white text-cat4-blue hover:bg-white/90">
                    <Link href={content.finalCta.primaryCta.href}>{content.finalCta.primaryCta.label}</Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="border-white/40 bg-transparent text-white hover:bg-white/10"
                  >
                    <Link href={content.finalCta.secondaryCta.href}>
                      {content.finalCta.secondaryCta.label}
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
