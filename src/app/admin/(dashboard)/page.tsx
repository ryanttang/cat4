import { getDashboardStats } from "@/lib/actions/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { formatDateTime } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div>
      <AdminPageHeader
        title="Dashboard"
        description="Overview of your brand site activity."
      />

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Captures", value: stats.captures },
          { label: "Subscribers", value: stats.subscribers },
          { label: "QR Scans", value: stats.qrScans },
          { label: "Landing Entries", value: stats.landingEntries },
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

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Recent Captures</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentCaptures.length === 0 ? (
            <p className="text-sm text-muted-foreground">No captures yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="pb-2 pr-4">Email</th>
                    <th className="pb-2 pr-4">Source</th>
                    <th className="pb-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentCaptures.map((c) => (
                    <tr key={c.id} className="border-b border-border/50">
                      <td className="py-2 pr-4">{c.email}</td>
                      <td className="py-2 pr-4">
                        <Badge variant="outline">{c.sourceType}</Badge>
                      </td>
                      <td className="py-2">{formatDateTime(c.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {stats.recentRewardClaims.length > 0 && (
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
                  {stats.recentRewardClaims.map((claim) => (
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
    </div>
  );
}
