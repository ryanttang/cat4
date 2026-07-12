"use client";

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdminPageHeader, AdminTableThumbnail, adminTableWrapClass } from "@/components/admin/admin-ui";
import { AdminFormDialog, useAdminFormDialog } from "@/components/admin/admin-form-dialog";
import { EducationForm } from "@/components/admin/education-form";
import type { EducationArticle } from "@/lib/db/schema";

export function EducationAdmin({ articles }: { articles: EducationArticle[] }) {
  const router = useRouter();
  const dialog = useAdminFormDialog<EducationArticle>();

  function handleSuccess() {
    dialog.close();
    router.refresh();
  }

  return (
    <>
      <AdminPageHeader title="Education">
        <Button type="button" onClick={dialog.openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Article
        </Button>
      </AdminPageHeader>

      <div className={adminTableWrapClass}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left">
              <th className="p-4">Title</th>
              <th className="p-4">Status</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {articles.map((article) => (
              <tr key={article.id} className="border-b border-border/50 transition-colors hover:bg-muted/30">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <AdminTableThumbnail src={article.coverImage} alt={article.title} />
                    <span className="font-medium">{article.title}</span>
                  </div>
                </td>
                <td className="p-4">
                  <Badge variant={article.published ? "success" : "secondary"}>
                    {article.published ? "Published" : "Draft"}
                  </Badge>
                </td>
                <td className="p-4">
                  <Button type="button" variant="ghost" size="sm" onClick={() => dialog.openEdit(article)}>
                    Edit
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AdminFormDialog
        open={dialog.open}
        onOpenChange={(open) => !open && dialog.close()}
        title={dialog.editing ? "Edit Article" : "Add Article"}
        size="wide"
      >
        <EducationForm
          key={dialog.editing?.id ?? "new"}
          article={dialog.editing ?? undefined}
          dialog
          onSuccess={handleSuccess}
        />
      </AdminFormDialog>
    </>
  );
}
