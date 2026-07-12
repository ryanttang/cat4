import { getAllCaptures } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { AdminPageHeader, adminTableWrapClass } from "@/components/admin/admin-ui";
import { formatDateTime } from "@/lib/utils";
import { ExportCapturesButton } from "@/components/admin/export-captures-button";

export default async function AdminCapturesPage() {
  const allCaptures = await getAllCaptures(200);

  return (
    <div>
      <AdminPageHeader
        title="Email Captures"
        description="All email leads from subscribe, landing pages, and surveys."
      >
        <ExportCapturesButton />
      </AdminPageHeader>

      <div className={adminTableWrapClass}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left">
              <th className="p-4">Email</th>
              <th className="p-4">Name</th>
              <th className="p-4">Source</th>
              <th className="p-4">Consent</th>
              <th className="p-4">Date</th>
            </tr>
          </thead>
          <tbody>
            {allCaptures.map((c) => (
              <tr key={c.id} className="border-b border-border/50 transition-colors hover:bg-muted/30">
                <td className="p-4">{c.email}</td>
                <td className="p-4">{[c.firstName, c.lastName].filter(Boolean).join(" ") || "—"}</td>
                <td className="p-4">
                  <Badge variant="outline">{c.sourceType}</Badge>
                </td>
                <td className="p-4">{c.consentMarketing ? "Yes" : "No"}</td>
                <td className="p-4">{formatDateTime(c.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {allCaptures.length === 0 && (
          <p className="p-8 text-center text-muted-foreground">No captures yet.</p>
        )}
      </div>
    </div>
  );
}
