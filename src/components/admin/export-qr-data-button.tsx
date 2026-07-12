"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { exportQrScansCsv, exportRewardClaimsCsv } from "@/lib/actions/admin";

type ExportQrDataButtonProps = {
  qrCodeId: string;
  code: string;
  type: "scans" | "claims";
};

export function ExportQrDataButton({ qrCodeId, code, type }: ExportQrDataButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    try {
      const csv =
        type === "scans"
          ? await exportQrScansCsv(qrCodeId)
          : await exportRewardClaimsCsv(qrCodeId);
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `qr-${code}-${type}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={handleExport} disabled={loading}>
      {loading ? "Exporting..." : `Export ${type === "scans" ? "Scans" : "Claims"} CSV`}
    </Button>
  );
}
