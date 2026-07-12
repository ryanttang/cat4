import { requireAuth } from "@/lib/auth-utils";
import { PromotionPreviewPopout } from "@/components/admin/promotion-preview-popout";

export default async function PromotionPreviewPopoutPage() {
  await requireAuth();
  return <PromotionPreviewPopout />;
}
