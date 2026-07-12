"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HeroVideoBackground, type HeroBlockData } from "@/components/marketing/hero-video-background";

type HeroSectionProps = {
  hero: HeroBlockData | null;
};

export function HeroSection({ hero }: HeroSectionProps) {
  if (!hero) {
    return (
      <section className="relative flex min-h-[70vh] items-center justify-center bg-cat4-dark">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-cat4-light sm:text-6xl">
            Elevate Your Experience
          </h1>
          <p className="mt-4 text-lg text-cat4-light/80">
            Premium cannabis products crafted with precision and passion.
          </p>
          <Button asChild size="lg" className="mt-8">
            <Link href="/products">Explore Products</Link>
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-[70vh] overflow-hidden">
      <HeroVideoBackground
        videoSourceType={hero.videoSourceType}
        videoUrl={hero.videoUrl}
        posterUrl={hero.posterUrl}
      />

      {/* 50% dark overlay for text legibility */}
      <div className="absolute inset-0 bg-black/50" aria-hidden="true" />

      <div className="relative z-10 flex min-h-[70vh] items-center justify-center px-4">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-cat4-light sm:text-6xl">
            {hero.headline}
          </h1>
          {hero.subheadline && (
            <p className="mt-4 text-lg text-cat4-light/90 sm:text-xl">{hero.subheadline}</p>
          )}
          {hero.ctaLabel && hero.ctaHref && (
            <Button asChild size="lg" className="mt-8">
              <Link href={hero.ctaHref}>{hero.ctaLabel}</Link>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}

export type { HeroBlockData };
