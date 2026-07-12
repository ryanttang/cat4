import type { Metadata } from "next";
import { getPublishedProducts, getFeaturedProducts, getHomepageContent } from "@/lib/data";
import { BrandLanding } from "@/components/marketing/brand-landing";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getHomepageContent();
  return {
    title: content.seo.title,
    description: content.seo.description,
  };
}

export default async function HomePage() {
  const [products, featuredProducts, content] = await Promise.all([
    getPublishedProducts(),
    getFeaturedProducts(),
    getHomepageContent(),
  ]);

  return <BrandLanding products={products} featuredProducts={featuredProducts} content={content} />;
}
