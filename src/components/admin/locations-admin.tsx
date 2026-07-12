"use client";

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { AdminFormDialog, useAdminFormDialog } from "@/components/admin/admin-form-dialog";
import { LocationForm } from "@/components/admin/location-form";
import { LocationsTable } from "@/components/admin/locations-table";
import type { Location } from "@/lib/db/schema";

export function LocationsAdmin({ locations }: { locations: Location[] }) {
  const router = useRouter();
  const dialog = useAdminFormDialog<Location>();

  function handleSuccess() {
    dialog.close();
    router.refresh();
  }

  return (
    <>
      <AdminPageHeader title="Locations" description="Manage store locator entries.">
        <Button type="button" onClick={dialog.openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Location
        </Button>
      </AdminPageHeader>

      <LocationsTable locations={locations} onEdit={dialog.openEdit} />

      <AdminFormDialog
        open={dialog.open}
        onOpenChange={(open) => !open && dialog.close()}
        title={dialog.editing ? "Edit Location" : "Add Location"}
      >
        <LocationForm
          key={dialog.editing?.id ?? "new"}
          location={dialog.editing ?? undefined}
          dialog
          onSuccess={handleSuccess}
        />
      </AdminFormDialog>
    </>
  );
}
