"use client";

import Link from "next/link";
import { Plus, ExternalLink, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdminPageHeader, AdminPanel, adminTableWrapClass } from "@/components/admin/admin-ui";
import { AdminFormDialog, useAdminFormDialog } from "@/components/admin/admin-form-dialog";
import { LinksPageCreateForm } from "@/components/admin/links-page-create-form";
import { formatDate } from "@/lib/utils";
import { linksPagePath } from "@/lib/links";
import { qrScanPath } from "@/lib/rewards/constants";
import type { LinkPageWithContent } from "@/lib/data/links";
import type { QrCode as QrCodeType } from "@/lib/db/schema";

type LinksPagesAdminProps = {
  pages: LinkPageWithContent[];
  qrCodesByPageId: Record<string, QrCodeType>;
};

export function LinksPagesAdmin({ pages, qrCodesByPageId }: LinksPagesAdminProps) {
  const dialog = useAdminFormDialog();

  return (
    <>
      <AdminPageHeader
        title="Links"
        description="Create Linktree-style pages. Each page gets its own QR code automatically."
      >
        <Button type="button" onClick={dialog.openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Create Links Page
        </Button>
      </AdminPageHeader>

      {pages.length === 0 ? (
        <AdminPanel dashed className="mt-8 p-12 text-center">
          <p className="text-muted-foreground">No links pages yet.</p>
          <Button type="button" className="mt-4" onClick={dialog.openCreate}>
            Create your first page
          </Button>
        </AdminPanel>
      ) : (
        <div className={adminTableWrapClass}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left">
                <th className="p-4">Title</th>
                <th className="p-4">Slug</th>
                <th className="p-4">Status</th>
                <th className="p-4">QR</th>
                <th className="p-4">Updated</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {pages.map((page) => {
                const qrCode = qrCodesByPageId[page.id];
                return (
                  <tr key={page.id} className="border-b border-border/50 transition-colors hover:bg-muted/30">
                    <td className="p-4 font-medium">{page.title}</td>
                    <td className="p-4 font-mono text-muted-foreground">{page.slug}</td>
                    <td className="p-4">
                      <Badge variant={page.status === "published" ? "success" : "secondary"}>
                        {page.status}
                      </Badge>
                    </td>
                    <td className="p-4">
                      {qrCode ? (
                        <Link
                          href={`/admin/links/${page.id}`}
                          className="inline-flex items-center gap-1 font-mono text-cat4-blue hover:underline"
                        >
                          <QrCode className="h-3.5 w-3.5" />
                          {qrScanPath(qrCode.code)}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="p-4 text-muted-foreground">{formatDate(page.updatedAt)}</td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-2">
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/admin/links/${page.id}`}>Edit</Link>
                        </Button>
                        {page.status === "published" && (
                          <Button asChild variant="ghost" size="sm">
                            <Link href={linksPagePath(page.slug)} target="_blank">
                              <ExternalLink className="mr-1 h-3 w-3" />
                              View
                            </Link>
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <AdminFormDialog
        open={dialog.open}
        onOpenChange={(open) => !open && dialog.close()}
        title="Create Links Page"
        description="A dedicated QR code is created for every page."
      >
        <LinksPageCreateForm onSuccess={dialog.close} />
      </AdminFormDialog>
    </>
  );
}
