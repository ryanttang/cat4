import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getQrCodeByCode } from "@/lib/data";
import { buildQrUrl } from "@/lib/rewards/constants";
import { generateQrPngBuffer } from "@/lib/rewards/qr-image";

type Props = { params: Promise<{ code: string }> };

export async function GET(request: Request, { params }: Props) {
  const { code } = await params;
  const qrCode = await getQrCodeByCode(code);

  if (!qrCode) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (qrCode.status === "draft" || qrCode.status === "archived") {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const origin = new URL(request.url).origin;
  const targetUrl = buildQrUrl(origin, qrCode.code);
  const buffer = await generateQrPngBuffer(targetUrl);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `inline; filename="qr-${qrCode.code}.png"`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
