"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdminPageHeader, AdminPanel, adminTableWrapClass } from "@/components/admin/admin-ui";
import { AdminFormDialog, useAdminFormDialog } from "@/components/admin/admin-form-dialog";
import { LandingPageForm } from "@/components/admin/landing-page-form";
import { formatDate } from "@/lib/utils";
import type { LandingPage } from "@/lib/db/schema";

type LandingPagesAdminProps = {
  pages: LandingPage[];
  entryCounts: Record<string, number>;
};

export function LandingPagesAdmin({ pages, entryCounts }: LandingPagesAdminProps) {
  const router = useRouter();
  const dialog = useAdminFormDialog<LandingPage>();

  function handleSuccess() {
    dialog.close();
    router.refresh();
  }

  return (
    <>
      <AdminPageHeader
        title="Promotions"
        description="Manage sweepstakes, raffles, giveaways, contests, and promotions."
      >
        <Button type="button" onClick={dialog.openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Create Promotion
        </Button>
      </AdminPageHeader>

      {pages.length === 0 ? (
        <AdminPanel dashed className="mt-8 p-12 text-center">
          <p className="text-muted-foreground">No promotions yet.</p>
          <Button type="button" className="mt-4" onClick={dialog.openCreate}>
            Create your first promotion
          </Button>
        </AdminPanel>
      ) : (
        <div className={adminTableWrapClass}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left">
                <th className="p-4">Title</th>
                <th className="p-4">Type</th>
                <th className="p-4">Status</th>
                <th className="p-4">Ends</th>
                <th className="p-4">Entries</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {pages.map((page) => (
                <tr key={page.id} className="border-b border-border/50 transition-colors hover:bg-muted/30">
                  <td className="p-4 font-medium">{page.title}</td>
                  <td className="p-4 capitalize">{page.type}</td>
                  <td className="p-4">
                    <Badge variant={page.status === "published" ? "success" : "secondary"}>
                      {page.status}
                    </Badge>
                  </td>
                  <td className="p-4 text-muted-foreground">{formatDate(page.endsAt)}</td>
                  <td className="p-4">{entryCounts[page.id] ?? 0}</td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" variant="ghost" size="sm" onClick={() => dialog.openEdit(page)}>
                        Edit
                      </Button>
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/landing-pages/${page.id}/entries`}>Entries</Link>
                      </Button>
                      {page.status === "published" && (
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/${page.slug}`} target="_blank">
                            <ExternalLink className="mr-1 h-3 w-3" />
                            View
                          </Link>
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AdminFormDialog
        open={dialog.open}
        onOpenChange={(open) => !open && dialog.close()}
        title={dialog.editing ? "Edit Promotion" : "Create Promotion"}
        description="Build and preview your promotion landing page."
        size="full"
      >
        <LandingPageForm
          key={dialog.editing?.id ?? "new"}
          page={dialog.editing ?? undefined}
          dialog
          onSuccess={handleSuccess}
        />
      </AdminFormDialog>
    </>
  );
}
