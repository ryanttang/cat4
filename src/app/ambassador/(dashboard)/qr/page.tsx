import Link from "next/link";
import { redirect } from "next/navigation";
import { getMyAmbassadorDashboard } from "@/lib/actions/ambassador";
import { getQrCodeByAmbassadorId } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ambassadorVanityPath } from "@/lib/ambassadors/constants";

export default async function AmbassadorQrPage() {
  const data = await getMyAmbassadorDashboard();
  if (!data) redirect("/ambassador/login");

  const { ambassador } = data;
  const qrCode = await getQrCodeByAmbassadorId(ambassador.id);
  const vanityPath = ambassadorVanityPath(ambassador.slug);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My QR Card</h1>
        <p className="mt-1 text-muted-foreground">Download and save your QR card to your phone.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Phone Card</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/ambassadors/${ambassador.id}/card`}
              alt="Ambassador QR card"
              className="mx-auto w-full max-w-sm rounded-lg border border-border"
            />
            <Button asChild className="w-full">
              <a href={`/api/ambassadors/${ambassador.id}/card`} download={`card-${ambassador.slug}.png`}>
                Download Phone Card
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>QR & Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {qrCode && (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/qr/${qrCode.code}/image`}
                  alt="QR code"
                  className="mx-auto h-48 w-48 rounded-lg border border-border bg-white p-2"
                />
                <Button asChild variant="outline" className="w-full">
                  <a href={`/api/qr/${qrCode.code}/image`} download={`qr-${qrCode.code}.png`}>
                    Download QR Code
                  </a>
                </Button>
              </>
            )}
            <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm">
              <p className="text-muted-foreground">Your link</p>
              <p className="mt-1 font-medium">{vanityPath}</p>
            </div>
            {ambassador.status === "published" && (
              <Button asChild variant="outline" className="w-full">
                <Link href={vanityPath} target="_blank">
                  Preview Hub Page
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
