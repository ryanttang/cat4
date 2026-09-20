import Link from "next/link";
import { Download, ExternalLink, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { adminSectionClass } from "@/components/admin/admin-ui";
import type { QrCode } from "@/lib/db/schema";
import { qrScanPath } from "@/lib/rewards/constants";

type LinksPageQrCardProps = {
  qrCode: QrCode | null;
};

export function LinksPageQrCard({ qrCode }: LinksPageQrCardProps) {
  if (!qrCode) {
    return (
      <section className={adminSectionClass}>
        <h2 className="text-lg font-semibold">QR Code</h2>
        <p className="text-sm text-muted-foreground">
          A dedicated QR code is created automatically when you save a new Links page.
        </p>
      </section>
    );
  }

  return (
    <section className={adminSectionClass}>
      <h2 className="text-lg font-semibold">QR Code</h2>
      <p className="text-sm text-muted-foreground">
        This page has its own QR. Scanners open{" "}
        <code className="text-foreground">{qrScanPath(qrCode.code)}</code>.
      </p>
      <div className="flex flex-wrap items-start gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/api/qr/${qrCode.code}/image`}
          alt={`QR code ${qrCode.code}`}
          className="h-36 w-36 rounded-lg border border-border bg-white p-2"
        />
        <div className="flex flex-col gap-2">
          <Button type="button" variant="outline" size="sm" asChild>
            <a href={`/api/qr/${qrCode.code}/image`} download={`qr-${qrCode.code}.png`}>
              <Download className="mr-2 h-4 w-4" />
              Download QR
            </a>
          </Button>
          {qrCode.status === "published" && (
            <Button type="button" variant="outline" size="sm" asChild>
              <Link href={qrScanPath(qrCode.code)} target="_blank">
                <ExternalLink className="mr-2 h-4 w-4" />
                Open scan URL
              </Link>
            </Button>
          )}
          <Button type="button" variant="outline" size="sm" asChild>
            <Link href={`/admin/rewards/${qrCode.id}/analytics`}>
              <BarChart3 className="mr-2 h-4 w-4" />
              Analytics
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
