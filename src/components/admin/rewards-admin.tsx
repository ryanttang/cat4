"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, ExternalLink, Download, BarChart3, QrCode as QrCodeIcon, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminPageHeader, AdminPanel, adminTableWrapClass } from "@/components/admin/admin-ui";
import { AdminFormDialog, useAdminFormDialog } from "@/components/admin/admin-form-dialog";
import { RewardsAdminForm } from "@/components/admin/rewards-admin-form";
import { QR_DESTINATION_LABELS } from "@/lib/rewards/constants";
import { formatDateTime } from "@/lib/utils";
import type {
  QrCode,
  LandingPage,
  Survey,
  RewardClaim,
} from "@/lib/db/schema";
import type { QrScanWithMeta, RewardsDashboardStats } from "@/lib/data/qr-codes";

type RewardsAdminProps = {
  stats: RewardsDashboardStats;
  standaloneQrCodes: QrCode[];
  scanCounts: Record<string, number>;
  recentScans: QrScanWithMeta[];
  recentClaims: RewardClaim[];
  promotions: LandingPage[];
  surveys: Survey[];
  polls: Survey[];
};

export function RewardsAdmin({
  stats,
  standaloneQrCodes,
  scanCounts,
  recentScans,
  recentClaims,
  promotions,
  surveys,
  polls,
}: RewardsAdminProps) {
  const router = useRouter();
  const dialog = useAdminFormDialog<QrCode>();

  function handleSuccess() {
    dialog.close();
    router.refresh();
  }

  return (
    <>
      <AdminPageHeader
        title="Rewards"
        description="QR scan analytics, reward claims, and standalone campaign codes."
      >
        <Button type="button" onClick={dialog.openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Create Campaign QR
        </Button>
      </AdminPageHeader>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Scans", value: stats.totalScans, icon: QrCodeIcon },
          { label: "Reward Claims", value: stats.totalClaims, icon: BarChart3 },
          { label: "Product QRs", value: stats.productQrCount, icon: Package },
          { label: "Campaign QRs", value: stats.standaloneQrCount, icon: QrCodeIcon },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <stat.icon className="h-4 w-4" />
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-cat4-blue">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Scans by Device</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.scansByDevice.length === 0 ? (
              <p className="text-sm text-muted-foreground">No scans yet.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {stats.scansByDevice.map((row) => (
                  <li key={row.deviceType} className="flex justify-between">
                    <span className="capitalize">{row.deviceType}</span>
                    <span className="font-medium">{row.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Scans</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/products">Manage product QRs</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentScans.length === 0 ? (
              <p className="text-sm text-muted-foreground">No scans yet.</p>
            ) : (
              <ul className="space-y-3 text-sm">
                {recentScans.map((scan) => (
                  <li key={scan.id} className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium">{scan.qrTitle}</p>
                      <p className="text-xs text-muted-foreground">
                        /r/{scan.qrCode}
                        {scan.isProductQr ? " · Product" : " · Campaign"}
                      </p>
                    </div>
                    <span className="shrink-0 text-muted-foreground">
                      {formatDateTime(scan.scannedAt)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {recentClaims.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Recent Reward Claims</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="pb-2 pr-4">Email</th>
                    <th className="pb-2 pr-4">Reward Code</th>
                    <th className="pb-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentClaims.map((claim) => (
                    <tr key={claim.id} className="border-b border-border/50">
                      <td className="py-2 pr-4">{claim.email}</td>
                      <td className="py-2 pr-4 font-mono">{claim.rewardCode ?? "—"}</td>
                      <td className="py-2">{formatDateTime(claim.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Campaign QR Codes</h2>
            <p className="text-sm text-muted-foreground">
              Standalone codes for link hubs, promotions, and reward campaigns. Product QRs are managed from Products.
            </p>
          </div>
        </div>

        {standaloneQrCodes.length === 0 ? (
          <AdminPanel dashed className="p-12 text-center">
            <p className="text-muted-foreground">No campaign QR codes yet.</p>
            <Button type="button" className="mt-4" onClick={dialog.openCreate}>
              Create campaign QR
            </Button>
          </AdminPanel>
        ) : (
          <div className={adminTableWrapClass}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-left">
                  <th className="p-4">Title</th>
                  <th className="p-4">Code</th>
                  <th className="p-4">Destination</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Scans</th>
                  <th className="p-4" />
                </tr>
              </thead>
              <tbody>
                {standaloneQrCodes.map((qr) => (
                  <tr key={qr.id} className="border-b border-border/50 transition-colors hover:bg-muted/30">
                    <td className="p-4 font-medium">{qr.title}</td>
                    <td className="p-4 font-mono text-xs">/r/{qr.code}</td>
                    <td className="p-4">{QR_DESTINATION_LABELS[qr.destinationType]}</td>
                    <td className="p-4">
                      <Badge variant={qr.status === "published" ? "success" : "secondary"}>
                        {qr.status}
                      </Badge>
                    </td>
                    <td className="p-4">{scanCounts[qr.id] ?? 0}</td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-2">
                        <Button type="button" variant="ghost" size="sm" onClick={() => dialog.openEdit(qr)}>
                          Edit
                        </Button>
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/admin/rewards/${qr.id}/analytics`}>
                            <BarChart3 className="mr-1 h-3 w-3" />
                            Analytics
                          </Link>
                        </Button>
                        <Button asChild variant="ghost" size="sm">
                          <a href={`/api/qr/${qr.code}/image`} download={`qr-${qr.code}.png`}>
                            <Download className="mr-1 h-3 w-3" />
                            QR
                          </a>
                        </Button>
                        {qr.status === "published" && (
                          <Button asChild variant="ghost" size="sm">
                            <Link href={`/r/${qr.code}`} target="_blank">
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
      </div>

      <AdminFormDialog
        open={dialog.open}
        onOpenChange={(open) => !open && dialog.close()}
        title={dialog.editing ? "Edit Campaign QR" : "Create Campaign QR"}
        description="Standalone QR codes for link hubs, promotions, surveys, and reward claims."
        size="wide"
      >
        <RewardsAdminForm
          qrCode={dialog.editing ?? undefined}
          promotions={promotions}
          surveys={surveys}
          polls={polls}
          dialog
          onSuccess={handleSuccess}
        />
      </AdminFormDialog>
    </>
  );
}
