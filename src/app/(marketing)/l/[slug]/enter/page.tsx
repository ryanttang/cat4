import { permanentRedirect } from "next/navigation";
import { promotionEntryPath } from "@/lib/promotion-utils";

type Props = { params: Promise<{ slug: string }> };

export default async function LegacyPromotionEntryRedirect({ params }: Props) {
  const { slug } = await params;
  permanentRedirect(promotionEntryPath(slug));
}
