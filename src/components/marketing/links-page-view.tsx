"use client";

import { useState } from "react";
import Link from "next/link";
import { brand } from "@/lib/brand";
import { isExternalHref, type LinksPageViewModel } from "@/lib/links";
import { cn } from "@/lib/utils";
import { LinksSubscribeModal } from "@/components/marketing/links-subscribe-modal";

type LinksPageViewProps = {
  view: LinksPageViewModel;
  preview?: boolean;
};

export function LinksPageView({ view, preview = false }: LinksPageViewProps) {
  const { content, buttons, products } = view;
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  const { appearance } = content;
  const hasBackgroundImage =
    appearance.backgroundStyle === "image" && Boolean(appearance.backgroundImageUrl);
  const showProducts = content.products.enabled && products.length > 0;
  const hasSubscribe = buttons.some((button) => button.type === "subscribe");

  return (
    <div
      className={cn(
        "relative min-h-screen overflow-hidden px-4 py-12 sm:py-16",
        preview ? "min-h-full" : "min-h-screen"
      )}
      style={
        hasBackgroundImage
          ? {
              backgroundImage: `linear-gradient(180deg, rgba(26,20,35,0.72), rgba(26,20,35,0.92)), url(${appearance.backgroundImageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : undefined
      }
    >
      {!hasBackgroundImage && (
        <div className="pointer-events-none absolute inset-0 bg-cat4-dark">
          <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-cat4-blue/25 to-transparent" />
        </div>
      )}

      <div className="relative mx-auto w-full max-w-md text-center">
        {appearance.heroStyle === "banner" && appearance.heroImageUrl ? (
          <div className="mb-8 overflow-hidden rounded-3xl border border-cat4-blue/20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={appearance.heroImageUrl}
              alt=""
              className="h-48 w-full object-cover sm:h-56"
            />
          </div>
        ) : appearance.heroImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={appearance.heroImageUrl}
            alt=""
            className="mx-auto mb-6 h-28 w-28 rounded-full object-cover ring-4 ring-cat4-blue/30"
          />
        ) : (
          <div className="mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-full bg-cat4-blue text-4xl font-bold text-cat4-light ring-4 ring-cat4-blue/30">
            {appearance.title.trim().charAt(0) || brand.name.charAt(0)}
          </div>
        )}

        <h1 className="text-3xl font-bold tracking-tight text-cat4-light">{appearance.title}</h1>
        {appearance.bio.trim() && (
          <p className="mt-3 text-sm leading-relaxed text-cat4-light/70 sm:text-base">
            {appearance.bio}
          </p>
        )}

        <div className="mt-10 space-y-3">
          {buttons.map((button) => {
            const className = cn(
              "block w-full rounded-2xl px-6 py-4 text-center text-base font-semibold transition-colors",
              appearance.buttonStyle === "outline"
                ? "border border-cat4-blue/40 bg-transparent text-cat4-light hover:bg-cat4-blue/15"
                : "bg-cat4-blue text-cat4-light hover:bg-cat4-blue/90"
            );

            if (button.type === "subscribe") {
              return (
                <button
                  key={button.id}
                  type="button"
                  className={className}
                  onClick={() => setSubscribeOpen(true)}
                >
                  {button.label}
                </button>
              );
            }

            if (!button.href) return null;

            if (isExternalHref(button.href)) {
              return (
                <a
                  key={button.id}
                  href={button.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={className}
                >
                  {button.label}
                </a>
              );
            }

            return (
              <Link key={button.id} href={button.href} className={className}>
                {button.label}
              </Link>
            );
          })}
        </div>

        {showProducts && (
          <section className="mt-12 text-left">
            <h2 className="mb-4 text-center text-sm font-semibold uppercase tracking-[0.2em] text-cat4-light/50">
              {content.products.heading || "Featured products"}
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={product.href}
                  className="group overflow-hidden rounded-2xl border border-white/10 bg-cat4-surface/80 transition-transform hover:-translate-y-0.5"
                >
                  <div className="relative aspect-square bg-cat4-primary/70">
                    {product.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-full w-full object-contain p-3 transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-2xl font-bold text-cat4-blue/40">
                        {product.name[0]}
                      </div>
                    )}
                  </div>
                  <p className="line-clamp-2 px-3 py-2 text-xs font-medium text-cat4-light">
                    {product.name}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <p className="mt-12 text-xs text-cat4-light/40">
          <Link href="/" className="hover:text-cat4-light">
            {brand.name}
          </Link>
        </p>
      </div>

      {hasSubscribe && (
        <LinksSubscribeModal
          open={subscribeOpen}
          onOpenChange={setSubscribeOpen}
          title={content.subscribe.modalTitle}
          body={content.subscribe.modalBody}
        />
      )}
    </div>
  );
}
