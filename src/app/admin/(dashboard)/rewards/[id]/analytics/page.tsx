import Link from "next/link";
import { notFound } from "next/navigation";
import { getQrCodeById, getQrAnalytics } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExportQrDataButton } from "@/components/admin/export-qr-data-button";
import { adminTableWrapClass } from "@/components/admin/admin-ui";
import { QR_DESTINATION_LABELS } from "@/lib/rewards/constants";
import { formatDateTime } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";

type Props = { params: Promise<{ id: string }> };

export default async function QrAnalyticsPage({ params }: Props) {
  const { id } = await params;
  const qrCode = await getQrCodeById(id);
  if (!qrCode) notFound();

  const analytics = await getQrAnalytics(id);

  return (
    <div>
      <Button asChild variant="ghost" className="-ml-2 mb-4">
        <Link href="/admin/rewards">
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Rewards
        </Link>
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{qrCode.title} — Analytics</h1>
          <p className="mt-1 text-muted-foreground">
            <span className="font-mono">/r/{qrCode.code}</span>
            {" · "}
            <Badge variant="outline">{QR_DESTINATION_LABELS[qrCode.destinationType]}</Badge>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ExportQrDataButton qrCodeId={qrCode.id} code={qrCode.code} type="scans" />
          {qrCode.destinationType === "claim_reward" && (
            <ExportQrDataButton qrCodeId={qrCode.id} code={qrCode.code} type="claims" />
          )}
        </div>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Scans</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-cat4-blue">{analytics.totalScans}</p>
          </CardContent>
        </Card>
        {qrCode.destinationType === "claim_reward" && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Claims</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-cat4-blue">{analytics.totalClaims}</p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Scans by Device</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.scansByDevice.length === 0 ? (
              <p className="text-sm text-muted-foreground">No scans yet.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {analytics.scansByDevice.map((row) => (
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
          <CardHeader>
            <CardTitle>Scans by Date</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.scansByDate.length === 0 ? (
              <p className="text-sm text-muted-foreground">No scans yet.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {analytics.scansByDate.map((row) => (
                  <li key={row.date} className="flex justify-between">
                    <span>{row.date}</span>
                    <span className="font-medium">{row.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Recent Scans</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className={adminTableWrapClass}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-left">
                  <th className="p-4">Time</th>
                  <th className="p-4">Device</th>
                  <th className="p-4">Referrer</th>
                  <th className="p-4">UTM</th>
                </tr>
              </thead>
              <tbody>
                {analytics.recentScans.map((scan) => (
                  <tr key={scan.id} className="border-b border-border/50">
                    <td className="p-4">{formatDateTime(scan.scannedAt)}</td>
                    <td className="p-4 capitalize">{scan.deviceType}</td>
                    <td className="p-4 max-w-xs truncate">{scan.referrer ?? "—"}</td>
                    <td className="p-4 text-xs">
                      {[scan.utmSource, scan.utmMedium, scan.utmCampaign]
                        .filter(Boolean)
                        .join(" / ") || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {analytics.recentScans.length === 0 && (
              <p className="p-8 text-center text-muted-foreground">No scans yet.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {qrCode.destinationType === "claim_reward" && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Recent Claims</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className={adminTableWrapClass}>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50 text-left">
                    <th className="p-4">Email</th>
                    <th className="p-4">Name</th>
                    <th className="p-4">Reward Code</th>
                    <th className="p-4">Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.recentClaims.map((claim) => (
                    <tr key={claim.id} className="border-b border-border/50">
                      <td className="p-4">{claim.email}</td>
                      <td className="p-4">
                        {[claim.firstName, claim.lastName].filter(Boolean).join(" ") || "—"}
                      </td>
                      <td className="p-4 font-mono">{claim.rewardCode ?? "—"}</td>
                      <td className="p-4">{formatDateTime(claim.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {analytics.recentClaims.length === 0 && (
                <p className="p-8 text-center text-muted-foreground">No claims yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
