"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportAmbassadorAnalyticsAction } from "@/lib/actions/ambassador-admin";

type ExportAmbassadorDataButtonProps = {
  ambassadorId: string;
  slug: string;
};

export function ExportAmbassadorDataButton({ ambassadorId, slug }: ExportAmbassadorDataButtonProps) {
  async function handleExport() {
    const csv = await exportAmbassadorAnalyticsAction(ambassadorId);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `ambassador-${slug}-analytics.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Button type="button" variant="outline" onClick={handleExport}>
      <Download className="mr-2 h-4 w-4" />
      Export CSV
    </Button>
  );
}
