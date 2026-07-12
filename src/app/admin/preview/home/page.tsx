import { requireAuth } from "@/lib/auth-utils";
import { HomepagePreviewPopout } from "@/components/admin/homepage-preview-popout";

export default async function HomepagePreviewPopoutPage() {
  await requireAuth();
  return <HomepagePreviewPopout />;
}
