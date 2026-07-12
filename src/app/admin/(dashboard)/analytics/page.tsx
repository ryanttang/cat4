import { getAnalyticsDashboard } from "@/lib/actions/analytics";
import { AdminPageHeader, adminTableWrapClass } from "@/components/admin/admin-ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";

export default async function AdminAnalyticsPage() {
  const analytics = await getAnalyticsDashboard();

  return (
    <div>
      <AdminPageHeader
        title="Analytics"
        description="Traffic and activity across your brand pages. Google Analytics can be connected later — this tracks what we capture on-site today."
      />

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Page Views", value: analytics.totalPageViews },
          { label: "Sessions", value: analytics.uniqueSessions },
          { label: "QR Scans", value: analytics.activity.qrScans },
          { label: "Captures", value: analytics.activity.captures },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-cat4-blue">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: "Subscribers", value: analytics.activity.subscribers },
          { label: "Landing Entries", value: analytics.activity.landingEntries },
          { label: "Survey Responses", value: analytics.activity.surveyResponses },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
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
            <CardTitle>Top Pages</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.viewsByPath.length === 0 ? (
              <p className="text-sm text-muted-foreground">No page views yet.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {analytics.viewsByPath.slice(0, 15).map((row) => (
                  <li key={row.path} className="flex justify-between gap-4">
                    <span className="truncate font-mono text-xs sm:text-sm">{row.path}</span>
                    <span className="shrink-0 font-medium">{row.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Views by Device</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.viewsByDevice.length === 0 ? (
              <p className="text-sm text-muted-foreground">No page views yet.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {analytics.viewsByDevice.map((row) => (
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
            <CardTitle>Views by Date</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.viewsByDate.length === 0 ? (
              <p className="text-sm text-muted-foreground">No page views yet.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {analytics.viewsByDate.map((row) => (
                  <li key={row.date} className="flex justify-between">
                    <span>{row.date}</span>
                    <span className="font-medium">{row.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Referrers</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.viewsByReferrer.length === 0 ? (
              <p className="text-sm text-muted-foreground">No page views yet.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {analytics.viewsByReferrer.slice(0, 15).map((row) => (
                  <li key={row.referrer} className="flex justify-between gap-4">
                    <span className="truncate">{row.referrer}</span>
                    <span className="shrink-0 font-medium">{row.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {analytics.viewsByUtmSource.some((r) => r.utmSource !== "(none)") && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>UTM Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {analytics.viewsByUtmSource.map((row) => (
                <li key={row.utmSource} className="flex justify-between">
                  <span>{row.utmSource}</span>
                  <span className="font-medium">{row.count}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Recent Page Views</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className={adminTableWrapClass}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-left">
                  <th className="p-4">Time</th>
                  <th className="p-4">Path</th>
                  <th className="p-4">Device</th>
                  <th className="p-4">Referrer</th>
                  <th className="p-4">UTM</th>
                </tr>
              </thead>
              <tbody>
                {analytics.recentViews.map((view) => (
                  <tr key={view.id} className="border-b border-border/50">
                    <td className="p-4 whitespace-nowrap">
                      {formatDateTime(view.viewedAt)}
                    </td>
                    <td className="p-4 font-mono text-xs">{view.path}</td>
                    <td className="p-4 capitalize">{view.deviceType}</td>
                    <td className="max-w-xs truncate p-4">{view.referrer ?? "—"}</td>
                    <td className="p-4 text-xs">
                      {[view.utmSource, view.utmMedium, view.utmCampaign]
                        .filter(Boolean)
                        .join(" / ") || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {analytics.recentViews.length === 0 && (
              <p className="p-8 text-center text-muted-foreground">No page views yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
