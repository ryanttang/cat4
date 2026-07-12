"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Settings,
  ExternalLink,
  BarChart3,
  QrCode,
  Users,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminPageHeader, adminTableWrapClass } from "@/components/admin/admin-ui";
import { formatDateTime } from "@/lib/utils";
import { ambassadorDisplayName, ambassadorVanityPath } from "@/lib/ambassadors/constants";
import type { BrandAmbassador } from "@/lib/db/schema";
import type {
  AmbassadorLeaderboardEntry,
  AmbassadorsDashboardStats,
  AmbassadorAnalytics,
} from "@/lib/data/ambassadors";

type AmbassadorsAdminProps = {
  stats: AmbassadorsDashboardStats;
  leaderboard: AmbassadorLeaderboardEntry[];
};

export function AmbassadorsAdmin({ stats, leaderboard }: AmbassadorsAdminProps) {
  const router = useRouter();

  return (
    <>
      <AdminPageHeader
        title="Ambassadors"
        description="Coordinate brand ambassadors, QR codes, and link hub pages."
      >
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => router.push("/admin/ambassadors/settings")}>
            <Settings className="mr-2 h-4 w-4" />
            Global Settings
          </Button>
          <Button type="button" onClick={() => router.push("/admin/ambassadors/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Add Ambassador
          </Button>
        </div>
      </AdminPageHeader>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Ambassadors", value: stats.totalAmbassadors, icon: Users },
          { label: "Active", value: stats.activeAmbassadors, icon: Users },
          { label: "Scans This Week", value: stats.scansThisWeek, icon: QrCode },
          { label: "Total Link Clicks", value: stats.totalClicks, icon: BarChart3 },
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

      <div className={adminTableWrapClass}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="px-4 py-3 font-medium">Ambassador</th>
              <th className="px-4 py-3 font-medium">Territory</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Scans</th>
              <th className="px-4 py-3 font-medium">Clicks</th>
              <th className="px-4 py-3 font-medium">Portal</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  No ambassadors yet. Add your first brand ambassador to get started.
                </td>
              </tr>
            ) : (
              leaderboard.map((entry) => (
                <AmbassadorRow key={entry.ambassador.id} entry={entry} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

function AmbassadorRow({ entry }: { entry: AmbassadorLeaderboardEntry }) {
  const { ambassador, scanCount, clickCount, qrCode } = entry;
  const name = ambassadorDisplayName(ambassador.firstName, ambassador.lastName);

  return (
    <tr className="border-b border-border/60">
      <td className="px-4 py-3">
        <div>
          <p className="font-medium">{name}</p>
          <p className="text-xs text-muted-foreground">{ambassador.email}</p>
        </div>
      </td>
      <td className="px-4 py-3 text-muted-foreground">{ambassador.territory ?? "—"}</td>
      <td className="px-4 py-3">
        <Badge variant={ambassador.status === "published" ? "default" : "secondary"}>
          {ambassador.status}
        </Badge>
      </td>
      <td className="px-4 py-3">{scanCount}</td>
      <td className="px-4 py-3">{clickCount}</td>
      <td className="px-4 py-3">
        {ambassador.userId ? (
          <Badge variant="outline">Enabled</Badge>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" asChild>
            <Link href={`/admin/ambassadors/${ambassador.id}`}>Edit</Link>
          </Button>
          <Button type="button" variant="outline" size="sm" asChild>
            <Link href={`/admin/ambassadors/${ambassador.id}/analytics`}>
              <BarChart3 className="mr-1 h-3 w-3" />
              Stats
            </Link>
          </Button>
          {ambassador.status === "published" && (
            <Button type="button" variant="ghost" size="sm" asChild>
              <Link href={ambassadorVanityPath(ambassador.slug)} target="_blank">
                <ExternalLink className="h-3 w-3" />
              </Link>
            </Button>
          )}
          {qrCode && (
            <Button type="button" variant="ghost" size="sm" asChild>
              <a href={`/api/qr/${qrCode.code}/image`} download={`qr-${qrCode.code}.png`}>
                <Download className="h-3 w-3" />
              </a>
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
}

export function AmbassadorAnalyticsPanel({
  ambassador,
  analytics,
}: {
  ambassador: BrandAmbassador;
  analytics: AmbassadorAnalytics;
}) {
  const name = ambassadorDisplayName(ambassador.firstName, ambassador.lastName);

  return (
    <div className="space-y-6">
      <AdminPageHeader title={`${name} Analytics`} description={`Performance for @${ambassador.slug}`}>
        <Button type="button" variant="outline" asChild>
          <Link href={`/admin/ambassadors/${ambassador.id}`}>Back to Edit</Link>
        </Button>
      </AdminPageHeader>

      <div className="grid gap-6 sm:grid-cols-3">
        {[
          { label: "Total Scans", value: analytics.totalScans },
          { label: "Link Clicks", value: analytics.totalClicks },
          { label: "Attributed Captures", value: analytics.totalCaptures },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-cat4-blue">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
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
            <CardTitle>Clicks by Link</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.clicksByLink.length === 0 ? (
              <p className="text-sm text-muted-foreground">No link clicks yet.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {analytics.clicksByLink.map((row) => (
                  <li key={row.linkLabel} className="flex justify-between">
                    <span>{row.linkLabel}</span>
                    <span className="font-medium">{row.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <p className="mb-2 font-medium text-muted-foreground">Recent Scans</p>
            {analytics.recentScans.length === 0 ? (
              <p className="text-muted-foreground">No scans yet.</p>
            ) : (
              <ul className="space-y-1">
                {analytics.recentScans.map((scan, index) => (
                  <li key={`${scan.scannedAt.toISOString()}-${index}`} className="flex justify-between">
                    <span className="capitalize">{scan.deviceType}</span>
                    <span className="text-muted-foreground">{formatDateTime(scan.scannedAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <p className="mb-2 font-medium text-muted-foreground">Recent Clicks</p>
            {analytics.recentClicks.length === 0 ? (
              <p className="text-muted-foreground">No clicks yet.</p>
            ) : (
              <ul className="space-y-1">
                {analytics.recentClicks.map((click) => (
                  <li key={click.id} className="flex justify-between gap-4">
                    <span>{click.linkLabel}</span>
                    <span className="shrink-0 text-muted-foreground">
                      {formatDateTime(click.clickedAt)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
