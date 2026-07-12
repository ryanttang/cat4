import { getMyAmbassadorDashboard } from "@/lib/actions/ambassador";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ambassadorDisplayName } from "@/lib/ambassadors/constants";
import { formatDateTime } from "@/lib/utils";

export default async function AmbassadorDashboardPage() {
  const data = await getMyAmbassadorDashboard();
  if (!data) redirect("/ambassador/login");

  const { ambassador, analytics, rank } = data;
  const name = ambassadorDisplayName(ambassador.firstName, ambassador.lastName);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome, {name}</h1>
        <p className="mt-1 text-muted-foreground">
          {ambassador.territory ? `${ambassador.territory} · ` : ""}@{ambassador.slug}
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Scans", value: analytics.totalScans },
          { label: "Link Clicks", value: analytics.totalClicks },
          { label: "Attributed Signups", value: analytics.totalCaptures },
          { label: "Leaderboard Rank", value: rank ?? "—" },
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
            <CardTitle>Top Links</CardTitle>
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

        <Card>
          <CardHeader>
            <CardTitle>Recent Scans</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.recentScans.length === 0 ? (
              <p className="text-sm text-muted-foreground">No scans yet. Share your QR card to get started!</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {analytics.recentScans.map((scan, index) => (
                  <li key={`${scan.scannedAt.toISOString()}-${index}`} className="flex justify-between">
                    <span className="capitalize">{scan.deviceType}</span>
                    <span className="text-muted-foreground">{formatDateTime(scan.scannedAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
