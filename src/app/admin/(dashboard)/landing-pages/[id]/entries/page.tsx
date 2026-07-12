import Link from "next/link";
import { notFound } from "next/navigation";
import { getLandingPageById, getLandingPageEntries } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExportEntriesButton } from "@/components/admin/export-entries-button";
import { adminTableWrapClass } from "@/components/admin/admin-ui";
import { formatDateTime } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";

type Props = { params: Promise<{ id: string }> };

export default async function LandingPageEntriesPage({ params }: Props) {
  const { id } = await params;
  const page = await getLandingPageById(id);
  if (!page) notFound();

  const entries = await getLandingPageEntries(id);

  return (
    <div>
      <Button asChild variant="ghost" className="-ml-2 mb-4">
        <Link href={`/admin/landing-pages/${id}`}>
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Edit
        </Link>
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{page.title} — Entries</h1>
          <p className="mt-1 text-muted-foreground">
            {entries.length} total entries ·{" "}
            <Badge variant="outline" className="capitalize">{page.type}</Badge>
          </p>
          {page.status === "published" && (
            <p className="mt-2 text-sm">
              Landing page:{" "}
              <Link href={`/l/${page.slug}`} className="text-cat4-blue underline" target="_blank">
                /l/{page.slug}
              </Link>
              {" · "}
              Entry wizard:{" "}
              <Link href={`/l/${page.slug}/enter`} className="text-cat4-blue underline" target="_blank">
                /l/{page.slug}/enter
              </Link>
            </p>
          )}
        </div>
        <ExportEntriesButton landingPageId={page.id} slug={page.slug} />
      </div>

      <div className={adminTableWrapClass}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left">
              <th className="p-4">Email</th>
              <th className="p-4">Name</th>
              <th className="p-4">State</th>
              <th className="p-4">Submitted</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => {
              const extra = entry.formData as Record<string, string> | null;
              return (
              <tr key={entry.id} className="border-b border-border/50 transition-colors hover:bg-muted/30">
                <td className="p-4">{entry.email}</td>
                <td className="p-4">
                  {[entry.firstName, entry.lastName].filter(Boolean).join(" ") || "—"}
                </td>
                <td className="p-4">{extra?.state ?? "—"}</td>
                <td className="p-4">{formatDateTime(entry.createdAt)}</td>
              </tr>
            );})}
          </tbody>
        </table>
        {entries.length === 0 && (
          <p className="p-8 text-center text-muted-foreground">No entries yet.</p>
        )}
      </div>
    </div>
  );
}
