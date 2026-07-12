import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAllCategoryCoverImages } from "@/lib/category-images";
import { CATALOG_CATEGORIES, getCatalogCategoryLabel } from "@/lib/product-filters";
import {
  CATEGORY_BREAKDOWNS,
  getProductSuperiority,
  getProductsByCategory,
} from "@/lib/product-education";
import { CategoryIcon } from "@/components/marketing/category-icon";
import { MiniProductCard } from "@/components/marketing/mini-product-card";
import { SectionLabel } from "@/components/marketing/section-label";
import { formatDate } from "@/lib/utils";
import type { EducationArticle, Product } from "@/lib/db/schema";

const HERO_MOSAIC = [
  "/products/strawberry-banana-all-in-one-1g.webp",
  "/products/indica-preroll-single-1g.webp",
  "/products/jet-fuel-14g.webp",
  "/products/wedding-cake-badder-1g.webp",
  "/products/galactic-gelato-pod-1g.webp",
  "/products/hybrid-preroll-single-1g.webp",
];

const ARTICLE_IMAGES: Record<string, string> = {
  "cat4-flower-vs-market": "/products/jet-fuel-14g.webp",
  "cat4-prerolls-vs-market": "/products/indica-preroll-single-1g.webp",
  "cat4-vapes-vs-market": "/products/strawberry-banana-all-in-one-1g.webp",
  "cat4-concentrates-vs-market": "/products/wedding-cake-badder-1g.webp",
  "cat4-quality-standards": "/products/tropical-runtz-pod-1g.webp",
};

type EducationBreakdownProps = {
  products: Product[];
  featuredProducts: Product[];
  articles: EducationArticle[];
};

export function EducationBreakdown({
  products,
  featuredProducts,
  articles,
}: EducationBreakdownProps) {
  const categoryImages = getAllCategoryCoverImages(products);
  const productCount = products.filter((p) => p.published).length;
  const productsByCategory = getProductsByCategory(products, 4);
  const mosaicImages =
    featuredProducts.length >= 4
      ? featuredProducts.slice(0, 6).map((p) => (p.images as string[])?.[0]).filter(Boolean)
      : HERO_MOSAIC;

  return (
    <div className="overflow-x-hidden bg-cat4-primary">
      {/* Hero */}
      <section className="relative min-h-[75vh] overflow-hidden bg-cat4-dark">
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-2 gap-1 sm:grid-cols-6 sm:grid-rows-1">
          {mosaicImages.map((src, i) => (
            <div
              key={`${src}-${i}`}
              className="relative min-h-[120px] bg-cat4-surface/60 sm:min-h-0"
            >
              <Image
                src={src as string}
                alt=""
                fill
                className="object-contain p-2 opacity-80"
                sizes="20vw"
              />
            </div>
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-cat4-dark/70 via-cat4-dark/85 to-cat4-dark" />

        <div className="relative z-10 mx-auto flex min-h-[75vh] max-w-5xl flex-col items-center justify-center px-4 py-20 text-center">
          <span className="rounded-full border border-cat4-blue/40 bg-cat4-blue/20 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-cat4-light">
            Education
          </span>
          <h1 className="mt-6 text-4xl font-bold leading-tight text-cat4-light sm:text-6xl lg:text-7xl">
            The CAT4 breakdown.
            <span className="mt-2 block text-cat4-blue">Why we beat the market.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-cat4-light/85 sm:text-xl">
            Format-by-format and product-by-product — how CAT4 outperforms what you typically find on
            dispensary shelves, at a price that actually makes sense.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {CATEGORY_BREAKDOWNS.map((item) => (
              <a
                key={item.slug}
                href={`#${item.slug}`}
                className="rounded-full border border-cat4-light/20 px-4 py-2 text-sm font-medium text-cat4-light/80 transition-colors hover:border-cat4-blue hover:text-cat4-light"
              >
                {item.label}
              </a>
            ))}
            <a
              href="#products"
              className="rounded-full border border-cat4-light/20 px-4 py-2 text-sm font-medium text-cat4-light/80 transition-colors hover:border-cat4-blue hover:text-cat4-light"
            >
              By product
            </a>
          </div>
        </div>
      </section>

      {/* Category breakdowns intro */}
      <section className="border-y border-border bg-cat4-surface px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <SectionLabel>By format</SectionLabel>
          <h2 className="mt-3 text-3xl font-bold text-cat4-light sm:text-4xl">
            How each CAT4 category beats the market
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-cat4-light/70">
            Side-by-side comparisons for every format in the lineup — CAT4 advantages vs. what you
            usually get from generic shelf alternatives.
          </p>
        </div>
      </section>

      {CATEGORY_BREAKDOWNS.map((item, index) => {
        const image = categoryImages[item.slug] ?? item.imageFallback;
        const reverse = index % 2 === 1;
        const categoryProducts = productsByCategory[item.slug] ?? [];

        return (
          <section
            key={item.slug}
            id={item.slug}
            className={`scroll-mt-20 border-b border-border ${index % 2 === 0 ? "bg-cat4-primary" : "bg-cat4-surface/70"}`}
          >
            <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
              <div className={reverse ? "lg:order-2" : undefined}>
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-border/60 bg-cat4-surface shadow-lg">
                  <Image
                    src={image}
                    alt={`CAT4 ${item.label}`}
                    fill
                    className="object-contain p-8"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-lg bg-cat4-dark/90 px-4 py-2 text-sm font-medium text-cat4-light">
                    <CategoryIcon name={item.icon} className="h-4 w-4 text-cat4-blue" />
                    CAT4 {item.label}
                  </div>
                </div>
              </div>

              <div className={reverse ? "lg:order-1" : undefined}>
                <SectionLabel>{item.label}</SectionLabel>
                <h2 className="mt-3 text-3xl font-bold text-cat4-light sm:text-4xl">{item.headline}</h2>
                <p className="mt-4 text-lg text-cat4-light/70">{item.pitch}</p>

                <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="rounded-2xl border border-white/30 bg-gradient-to-br from-cat4-blue via-[#1e4ab8] to-cat4-blue/75 p-3 shadow-lg shadow-cat4-blue/20 sm:p-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white sm:text-sm">
                      CAT4 advantage
                    </h3>
                    <ul className="mt-3 space-y-2 sm:mt-4 sm:space-y-3">
                      {item.cat4Wins.map((win) => (
                        <li key={win} className="flex items-start gap-2 text-xs text-white/90 sm:gap-2.5 sm:text-sm">
                          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white sm:h-4 sm:w-4" />
                          <span>{win}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-2xl border border-border bg-cat4-primary/60 p-3 sm:p-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-cat4-light/50 sm:text-sm">
                      Typical market
                    </h3>
                    <ul className="mt-3 space-y-2 sm:mt-4 sm:space-y-3">
                      {item.marketNorms.map((norm) => (
                        <li key={norm} className="flex items-start gap-2 text-xs text-cat4-light/60 sm:gap-2.5 sm:text-sm">
                          <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cat4-light/35 sm:h-4 sm:w-4" />
                          <span>{norm}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {categoryProducts.length > 0 && (
                  <div className="mt-10">
                    <p className="text-xs font-bold uppercase tracking-wider text-cat4-light/50">
                      Example products
                    </p>
                    <div className="mt-4 grid grid-cols-2 gap-2 sm:gap-3">
                      {categoryProducts.map((product) => (
                        <MiniProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  </div>
                )}

                <Button asChild className="mt-10">
                  <Link href={`/products/${item.slug}`}>
                    Shop CAT4 {item.label.toLowerCase()}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        );
      })}

      {/* Per-product superiority */}
      <section id="products" className="scroll-mt-20 border-t border-border bg-cat4-surface px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <SectionLabel>Product by product</SectionLabel>
            <h2 className="mt-3 text-3xl font-bold text-cat4-light sm:text-4xl">
              Why each CAT4 product beats its market equivalent
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-cat4-light/70">
              Real SKUs from the CAT4 menu — and exactly what makes them a better pick than the
              generic alternative sitting next to them on the shelf.
            </p>
          </div>

          <div className="mt-16 space-y-16">
            {CATEGORY_BREAKDOWNS.map((category) => {
              const categoryProducts = productsByCategory[category.slug];
              if (!categoryProducts.length) return null;

              return (
                <div key={category.slug}>
                  <h3 className="text-xl font-bold text-cat4-light">{category.label}</h3>
                  <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-6">
                    {categoryProducts.map((product) => {
                      const image = (product.images as string[])?.[0];
                      const superiority = getProductSuperiority(product);
                      if (!image) return null;

                      return (
                        <div
                          key={product.id}
                          className="overflow-hidden rounded-2xl border border-border bg-cat4-primary"
                        >
                          <div className="grid sm:grid-cols-[140px_1fr]">
                            <div className="relative aspect-square bg-cat4-surface sm:aspect-auto sm:min-h-[180px]">
                              <Image
                                src={image}
                                alt={product.name}
                                fill
                                className="object-contain p-4"
                                sizes="140px"
                              />
                            </div>
                            <div className="p-5">
                              <SectionLabel>
                                {getCatalogCategoryLabel(product.category)}
                                {product.subtype ? ` · ${product.subtype}` : ""}
                              </SectionLabel>
                              <h4 className="mt-1 text-lg font-bold text-cat4-light">{product.name}</h4>
                              <div className="mt-4 space-y-3">
                                <div className="flex items-start gap-2">
                                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-cat4-blue" />
                                  <p className="text-sm text-cat4-light/85">{superiority.cat4}</p>
                                </div>
                                <div className="flex items-start gap-2">
                                  <X className="mt-0.5 h-4 w-4 shrink-0 text-cat4-light/30" />
                                  <p className="text-sm text-cat4-light/50">{superiority.market}</p>
                                </div>
                              </div>
                              <Link
                                href={`/products/${product.category}/${product.slug}`}
                                className="mt-4 inline-flex items-center text-sm font-medium text-cat4-blue hover:underline"
                              >
                                View product
                                <ArrowRight className="ml-1 h-3 w-3" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Category lineup grid */}
      <section className="border-t border-border bg-cat4-primary px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
        <h2 className="text-center text-2xl font-bold text-cat4-light">Explore the full lineup</h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-cat4-light/60">
          Browse {productCount}+ products across {CATALOG_CATEGORIES.length} categories.
        </p>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
          {CATALOG_CATEGORIES.map((cat) => {
            const image = categoryImages[cat.slug];
            return (
              <Link
                key={cat.slug}
                href={`/products/${cat.slug}`}
                className="group overflow-hidden rounded-xl border border-border bg-cat4-surface transition-all hover:border-cat4-blue hover:shadow-md"
              >
                <div className="relative aspect-square bg-cat4-primary/80">
                  {image && (
                    <Image
                      src={image}
                      alt={cat.label}
                      fill
                      className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                      sizes="20vw"
                    />
                  )}
                </div>
                <div className="p-3 text-center sm:p-4">
                  <h3 className="text-sm font-semibold text-cat4-light group-hover:text-cat4-blue sm:text-base">
                    {cat.label}
                  </h3>
                </div>
              </Link>
            );
          })}
        </div>
        </div>
      </section>

      {/* Article deep dives */}
      {articles.length > 0 && (
        <section className="border-t border-border bg-cat4-surface px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <SectionLabel>Deep dives</SectionLabel>
              <h2 className="mt-2 text-3xl font-bold text-cat4-light">Read the full comparison</h2>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-6">
              {articles.map((article) => {
                const cover =
                  ARTICLE_IMAGES[article.slug] ?? "/products/indica-preroll-single-1g.webp";
                return (
                  <Link
                    key={article.id}
                    href={`/education/${article.slug}`}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-cat4-primary shadow-sm transition-all hover:border-cat4-blue hover:shadow-lg sm:flex-row"
                  >
                    <div className="relative aspect-[4/3] w-full shrink-0 bg-cat4-surface sm:aspect-auto sm:w-44 sm:min-h-[140px]">
                      <Image
                        src={cover}
                        alt=""
                        fill
                        className="object-contain p-2 sm:p-3"
                        sizes="(max-width: 640px) 50vw, 176px"
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-center p-3 sm:p-6">
                      {article.tags && (article.tags as string[]).length > 0 && (
                        <SectionLabel className="text-[10px] sm:text-xs">{(article.tags as string[])[0]}</SectionLabel>
                      )}
                      <h3 className="mt-1 text-sm font-bold leading-snug text-cat4-light group-hover:text-cat4-blue sm:text-lg">
                        {article.title}
                      </h3>
                      {article.excerpt && (
                        <p className="mt-1 line-clamp-2 text-xs text-cat4-light/60 sm:mt-2 sm:text-sm">
                          {article.excerpt}
                        </p>
                      )}
                      <p className="mt-2 text-[10px] text-cat4-light/40 sm:mt-3 sm:text-xs">
                        {formatDate(article.publishedAt)}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="relative isolate overflow-hidden bg-cat4-blue px-4 py-20 sm:px-6">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-black/10 blur-3xl" />
        <div className="relative mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to see the difference?
          </h2>
          <p className="mt-4 text-lg text-white/85">
            Browse {productCount}+ lab-tested products or visit a licensed retailer near you.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="bg-white text-cat4-blue hover:bg-white/90"
            >
              <Link href="/products">Shop all products</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/40 bg-transparent text-white hover:bg-white/10"
            >
              <Link href="/">Back to home</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
