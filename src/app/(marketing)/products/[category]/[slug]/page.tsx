import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getProductBySlugAndCategory } from "@/lib/data";
import { getCategoryLabel, PRODUCT_CATEGORIES, type ProductCategory, formatPriceDisplay } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SectionLabel } from "@/components/marketing/section-label";
import { ChevronLeft } from "lucide-react";

type Props = { params: Promise<{ category: string; slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { category, slug } = await params;
  const product = await getProductBySlugAndCategory(slug, category as ProductCategory);
  return { title: product?.name ?? "Product" };
}

export default async function ProductDetailPage({ params }: Props) {
  const { category, slug } = await params;
  const valid = PRODUCT_CATEGORIES.some((c) => c.slug === category);
  if (!valid) notFound();

  const product = await getProductBySlugAndCategory(slug, category as ProductCategory);
  if (!product) notFound();

  const images = (product.images as string[]) ?? [];
  const price = formatPriceDisplay(product.price);
  const compareAt = formatPriceDisplay(product.compareAtPrice);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <Button asChild variant="ghost" className="mb-6 -ml-2">
        <Link href={`/products/${category}`}>
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to {getCategoryLabel(category)}
        </Link>
      </Button>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-xl">
            {images[0] ? (
              <Image src={images[0]} alt={product.name} fill className="object-contain p-6" priority />
            ) : (
              <div className="flex h-full items-center justify-center bg-cat4-blue/5">
                <span className="text-8xl font-bold text-cat4-blue/20">{product.name[0]}</span>
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {images.slice(1).map((img, i) => (
                <div key={i} className="relative aspect-square overflow-hidden rounded-lg bg-muted">
                  <Image src={img} alt={`${product.name} ${i + 2}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <SectionLabel>{getCategoryLabel(product.category)}</SectionLabel>
          <h1 className="mt-2 text-4xl font-bold text-cat4-light">{product.name}</h1>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            {price && (
              <span className="text-3xl font-bold text-cat4-light">{price}</span>
            )}
            {compareAt && compareAt !== price && (
              <span className="text-xl text-cat4-light/50 line-through">{compareAt}</span>
            )}
            {product.classification && (
              <span className="rounded bg-cat4-blue px-3 py-1 text-sm font-semibold text-white">
                {product.classification}
              </span>
            )}
            {product.size && (
              <span className="text-sm font-medium text-cat4-light/70">{product.size}</span>
            )}
            {product.thcPercent && (
              <span className="text-sm font-medium text-cat4-light/70">{product.thcPercent}% THC</span>
            )}
          </div>

          <p className="mt-2 text-xs text-cat4-light/50">
            Bellflower pricing reference · taxes included at retail
          </p>

          {product.description && (
            <p className="mt-4 text-lg text-cat4-light/80">{product.description}</p>
          )}
          {product.longDescription && (
            <div className="prose prose-neutral mt-6 max-w-none">
              {product.longDescription.split("\n").map((para, i) => (
                <p key={i} className="mb-3 text-cat4-light/70">
                  {para}
                </p>
              ))}
            </div>
          )}
          <Button asChild className="mt-8" size="lg">
            <Link href="/find">Find Near You</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
