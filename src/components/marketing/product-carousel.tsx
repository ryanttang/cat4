"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { getCategoryLabel } from "@/lib/utils";
import type { Product } from "@/lib/db/schema";

type ProductCarouselProps = {
  products: Product[];
  title?: string;
};

export function ProductCarousel({ products, title = "Featured Products" }: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = direction === "left" ? -320 : 320;
    scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
  };

  if (products.length === 0) return null;

  return (
    <section className="bg-cat4-primary py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight text-cat4-light">{title}</h2>
          <div className="hidden gap-2 sm:flex">
            <Button variant="outline" size="icon" onClick={() => scroll("left")} aria-label="Scroll left">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => scroll("right")} aria-label="Scroll right">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="mt-8 flex gap-6 overflow-x-auto pb-4 scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.category}/${product.slug}`}
              className="group w-72 shrink-0 overflow-hidden rounded-xl border border-border bg-cat4-surface transition-all hover:border-cat4-blue hover:shadow-lg"
            >
              <div className="relative aspect-square">
                {product.images && (product.images as string[])[0] ? (
                  <Image
                    src={(product.images as string[])[0]}
                    alt={product.name}
                    fill
                    className="object-contain p-3 transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-cat4-blue/5 text-cat4-blue/40">
                    <span className="text-4xl font-bold">{product.name[0]}</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <span className="text-xs font-medium uppercase tracking-wider text-cat4-blue">
                  {getCategoryLabel(product.category)}
                </span>
                <h3 className="mt-1 font-semibold text-cat4-light group-hover:text-cat4-blue">
                  {product.name}
                </h3>
                {product.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-cat4-light/60">{product.description}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
