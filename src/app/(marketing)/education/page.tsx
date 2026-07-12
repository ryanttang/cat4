import {
  getPublishedEducationArticles,
  getPublishedProducts,
  getFeaturedProducts,
} from "@/lib/data";
import { EducationBreakdown } from "@/components/marketing/education-breakdown";

export const metadata = {
  title: "Education",
  description:
    "A breakdown of CAT4 and why each product outperforms typical market alternatives — flower, pre-rolls, vapes, and concentrates.",
};

export default async function EducationPage() {
  const [products, featuredProducts, articles] = await Promise.all([
    getPublishedProducts(),
    getFeaturedProducts(),
    getPublishedEducationArticles(),
  ]);

  return (
    <EducationBreakdown
      products={products}
      featuredProducts={featuredProducts}
      articles={articles}
    />
  );
}
