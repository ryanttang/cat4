import {
  getAllProducts,
  getAllQrCodes,
  getQrScanCounts,
  getPublishedLandingPages,
  getSurveysByTypes,
  backfillProductQrCodes,
} from "@/lib/data";
import { ProductsAdmin } from "@/components/admin/products-admin";

export default async function AdminProductsPage() {
  const allProducts = await getAllProducts();
  await backfillProductQrCodes(
    allProducts.map((p) => ({ id: p.id, name: p.name, slug: p.slug }))
  );

  const [qrCodes, scanCountsList, promotions, surveys, polls] = await Promise.all([
    getAllQrCodes(),
    getQrScanCounts(),
    getPublishedLandingPages(),
    getSurveysByTypes(["survey", "questionnaire"]),
    getSurveysByTypes(["poll"]),
  ]);

  const qrByProductId = Object.fromEntries(
    qrCodes.filter((q) => q.productId).map((q) => [q.productId!, q])
  );
  const scanCounts = Object.fromEntries(
    scanCountsList.map((entry) => [entry.qrCodeId, entry.count])
  );

  return (
    <div>
      <ProductsAdmin
        products={allProducts}
        qrByProductId={qrByProductId}
        scanCounts={scanCounts}
        promotions={promotions}
        surveys={surveys.filter((s) => s.status === "published")}
        polls={polls.filter((p) => p.status === "published")}
      />
    </div>
  );
}
