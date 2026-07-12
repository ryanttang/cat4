"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { QrCode, Download, BarChart3, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RewardsAdminForm } from "@/components/admin/rewards-admin-form";
import { QR_DESTINATION_LABELS } from "@/lib/rewards/constants";
import type { Product, QrCode as QrCodeType, LandingPage, Survey } from "@/lib/db/schema";

type ProductQrDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
  qrCode: QrCodeType | null;
  scanCount: number;
  promotions: LandingPage[];
  surveys: Survey[];
  polls: Survey[];
};

export function ProductQrDialog({
  open,
  onOpenChange,
  product,
  qrCode,
  scanCount,
  promotions,
  surveys,
  polls,
}: ProductQrDialogProps) {
  const router = useRouter();

  function handleSuccess() {
    router.refresh();
  }

  if (!qrCode) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Product QR</DialogTitle>
            <DialogDescription>
              No QR code is linked to {product.name} yet. Refresh the page after saving the product.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product.name} — QR Code</DialogTitle>
          <DialogDescription>
            Configure where this product&apos;s dedicated QR code sends scanners.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="font-mono">
            /r/{qrCode.code}
          </Badge>
          <Badge variant="secondary">{QR_DESTINATION_LABELS[qrCode.destinationType]}</Badge>
          <Badge variant="outline">{scanCount} scans</Badge>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <a href={`/api/qr/${qrCode.code}/image`} download={`qr-${qrCode.code}.png`}>
              <Download className="mr-1 h-3 w-3" />
              Download
            </a>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={`/admin/rewards/${qrCode.id}/analytics`}>
              <BarChart3 className="mr-1 h-3 w-3" />
              Analytics
            </Link>
          </Button>
          {qrCode.status === "published" && (
            <Button asChild variant="outline" size="sm">
              <Link href={`/r/${qrCode.code}`} target="_blank">
                <ExternalLink className="mr-1 h-3 w-3" />
                View
              </Link>
            </Button>
          )}
        </div>

        <RewardsAdminForm
          qrCode={qrCode}
          promotions={promotions}
          surveys={surveys}
          polls={polls}
          dialog
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}

type ProductQrCellProps = {
  product: Product;
  qrCode: QrCodeType | null;
  scanCount: number;
  onOpen: (product: Product) => void;
};

export function ProductQrCell({ product, qrCode, scanCount, onOpen }: ProductQrCellProps) {
  if (!qrCode) {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="relative h-9 w-9 p-0"
      onClick={() => onOpen(product)}
      title={`QR: ${scanCount} scans`}
    >
      <QrCode className="h-4 w-4 text-cat4-blue" />
      {scanCount > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-cat4-blue px-1 text-[10px] font-medium text-white">
          {scanCount > 99 ? "99+" : scanCount}
        </span>
      )}
    </Button>
  );
}
