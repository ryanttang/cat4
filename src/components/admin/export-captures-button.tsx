"use client";

import { Button } from "@/components/ui/button";
import { exportCapturesCsv } from "@/lib/actions/admin";
import { Download } from "lucide-react";

export function ExportCapturesButton() {
  async function handleExport() {
    const csv = await exportCapturesCsv();
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cat4-captures-${new Date().toISOString().slice(0, 10)}.csv`;
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
