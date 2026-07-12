import { getHomepageContent, getPublishedProducts, getFeaturedProducts } from "@/lib/data";
import { MOCK_PRODUCTS } from "@/lib/mock/products-seed";
import { HomePageForm } from "@/components/admin/home-page-form";
import { AdminPageHeader } from "@/components/admin/admin-ui";

export default async function AdminHomePage() {
  const [content, products, featuredProducts] = await Promise.all([
    getHomepageContent(),
    getPublishedProducts(),
    getFeaturedProducts(),
  ]);

  const previewProducts =
    products.length > 0 ? products : MOCK_PRODUCTS.filter((product) => product.published);
  const previewFeatured =
    featuredProducts.length > 0
      ? featuredProducts
      : MOCK_PRODUCTS.filter((product) => product.featured);

  return (
    <div>
      <AdminPageHeader
        title="Home Page"
        description="Edit homepage copy, images, CTAs, and SEO. Preview updates live as you edit."
      />
      <div className="mt-8">
        <HomePageForm
          content={content}
          products={previewProducts}
          featuredProducts={previewFeatured}
        />
      </div>
    </div>
  );
}
