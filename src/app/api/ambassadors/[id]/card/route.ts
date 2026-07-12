import { NextResponse } from "next/server";
import { canAccessAmbassadorCard } from "@/lib/actions/ambassador";
import { getAmbassadorById } from "@/lib/data/ambassadors";
import { getQrCodeByAmbassadorId } from "@/lib/data";
import { buildQrUrl } from "@/lib/rewards/constants";
import { generateAmbassadorCardPng } from "@/lib/ambassadors/card-image";
import { ambassadorDisplayName, ambassadorVanityPath } from "@/lib/ambassadors/constants";

type Props = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Props) {
  const { id } = await params;
  const allowed = await canAccessAmbassadorCard(id);
  if (!allowed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ambassador = await getAmbassadorById(id);
  if (!ambassador) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const qrCode = await getQrCodeByAmbassadorId(id);
  if (!qrCode) {
    return NextResponse.json({ error: "QR code not found" }, { status: 404 });
  }

  const origin = new URL(request.url).origin;
  const qrUrl = buildQrUrl(origin, qrCode.code);
  const vanityUrl = `${origin}${ambassadorVanityPath(ambassador.slug)}`;
  const name = ambassadorDisplayName(ambassador.firstName, ambassador.lastName);

  const buffer = await generateAmbassadorCardPng({
    name,
    territory: ambassador.territory,
    qrUrl,
    vanityUrl,
    photoUrl: ambassador.photoUrl,
  });

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `inline; filename="card-${ambassador.slug}.png"`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
