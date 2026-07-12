"use client";

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminPageHeader, AdminPanel } from "@/components/admin/admin-ui";
import { AdminFormDialog, useAdminFormDialog } from "@/components/admin/admin-form-dialog";
import { AboutForm } from "@/components/admin/about-form";
import type { aboutSections } from "@/lib/db/schema";

type AboutSection = typeof aboutSections.$inferSelect;

export function AboutAdmin({ sections }: { sections: AboutSection[] }) {
  const router = useRouter();
  const dialog = useAdminFormDialog<AboutSection>();

  function handleSuccess() {
    dialog.close();
    router.refresh();
  }

  return (
    <>
      <AdminPageHeader title="About Page">
        <Button type="button" onClick={dialog.openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Section
        </Button>
      </AdminPageHeader>

      <div className="mt-8 space-y-4">
        {sections.map((section) => (
          <AdminPanel
            key={section.id}
            className="flex items-center justify-between p-4 transition-colors hover:bg-muted/30"
          >
            <div>
              <h3 className="font-semibold">{section.title}</h3>
              <p className="line-clamp-1 text-sm text-muted-foreground">{section.body}</p>
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={() => dialog.openEdit(section)}>
              Edit
            </Button>
          </AdminPanel>
        ))}
      </div>

      <AdminFormDialog
        open={dialog.open}
        onOpenChange={(open) => !open && dialog.close()}
        title={dialog.editing ? "Edit Section" : "Add Section"}
      >
        <AboutForm
          key={dialog.editing?.id ?? "new"}
          section={dialog.editing ?? undefined}
          dialog
          onSuccess={handleSuccess}
        />
      </AdminFormDialog>
    </>
  );
}
