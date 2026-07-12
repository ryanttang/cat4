"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { AdminFormDialog, useAdminFormDialog } from "@/components/admin/admin-form-dialog";
import { ProductForm } from "@/components/admin/product-form";
import { ProductsTable } from "@/components/admin/products-table";
import { ProductQrDialog } from "@/components/admin/product-qr-dialog";
import type { Product, QrCode, LandingPage, Survey } from "@/lib/db/schema";

type ProductsAdminProps = {
  products: Product[];
  qrByProductId: Record<string, QrCode>;
  scanCounts: Record<string, number>;
  promotions: LandingPage[];
  surveys: Survey[];
  polls: Survey[];
};

export function ProductsAdmin({
  products,
  qrByProductId,
  scanCounts,
  promotions,
  surveys,
  polls,
}: ProductsAdminProps) {
  const router = useRouter();
  const dialog = useAdminFormDialog<Product>();
  const [qrProduct, setQrProduct] = useState<Product | null>(null);

  function handleSuccess() {
    dialog.close();
    router.refresh();
  }

  return (
    <>
      <AdminPageHeader title="Products" description="Manage your product catalog and product QR codes.">
        <Button type="button" onClick={dialog.openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </AdminPageHeader>

      <ProductsTable
        products={products}
        qrByProductId={qrByProductId}
        scanCounts={scanCounts}
        onEdit={dialog.openEdit}
        onConfigureQr={setQrProduct}
      />

      <AdminFormDialog
        open={dialog.open}
        onOpenChange={(open) => !open && dialog.close()}
        title={dialog.editing ? "Edit Product" : "Add Product"}
        description={dialog.editing ? "Update product details." : "Create a new product."}
      >
        <ProductForm
          key={dialog.editing?.id ?? "new"}
          product={dialog.editing ?? undefined}
          dialog
          onSuccess={handleSuccess}
        />
      </AdminFormDialog>

      {qrProduct && (
        <ProductQrDialog
          open={Boolean(qrProduct)}
          onOpenChange={(open) => !open && setQrProduct(null)}
          product={qrProduct}
          qrCode={qrByProductId[qrProduct.id] ?? null}
          scanCount={
            qrByProductId[qrProduct.id]
              ? scanCounts[qrByProductId[qrProduct.id].id] ?? 0
              : 0
          }
          promotions={promotions}
          surveys={surveys}
          polls={polls}
        />
      )}
    </>
  );
}
