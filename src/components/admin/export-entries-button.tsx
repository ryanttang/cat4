"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportLandingPageEntriesCsv } from "@/lib/actions/admin";

export function ExportEntriesButton({
  landingPageId,
  slug,
}: {
  landingPageId: string;
  slug: string;
}) {
  async function handleExport() {
    const csv = await exportLandingPageEntriesCsv(landingPageId);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cat4-${slug}-entries-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Button variant="outline" onClick={handleExport}>
      <Download className="mr-2 h-4 w-4" />
      Export CSV
    </Button>
  );
}
