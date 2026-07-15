import { permanentRedirect } from "next/navigation";
import { promotionPath } from "@/lib/promotion-utils";

type Props = { params: Promise<{ slug: string }> };

export default async function LegacyPromotionRedirect({ params }: Props) {
  const { slug } = await params;
  permanentRedirect(promotionPath(slug));
}
