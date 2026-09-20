import {
  getQrScanCounts,
  getPublishedLandingPages,
  getPublishedLinkPages,
  getSurveysByTypes,
  getStandaloneQrCodes,
  getRewardsDashboardStats,
  getRecentQrScansWithMeta,
  getRecentRewardClaims,
} from "@/lib/data";
import { RewardsAdmin } from "@/components/admin/rewards-admin";

export default async function AdminRewardsPage() {
  const [
    stats,
    standaloneQrCodes,
    scanCountsList,
    recentScans,
    recentClaims,
    promotions,
    linkPages,
    surveys,
    polls,
  ] = await Promise.all([
    getRewardsDashboardStats(),
    getStandaloneQrCodes(),
    getQrScanCounts(),
    getRecentQrScansWithMeta(8),
    getRecentRewardClaims(8),
    getPublishedLandingPages(),
    getPublishedLinkPages(),
    getSurveysByTypes(["survey", "questionnaire"]),
    getSurveysByTypes(["poll"]),
  ]);

  const scanCounts = Object.fromEntries(
    scanCountsList.map((entry) => [entry.qrCodeId, entry.count])
  );

  return (
    <div>
      <RewardsAdmin
        stats={stats}
        standaloneQrCodes={standaloneQrCodes}
        scanCounts={scanCounts}
        recentScans={recentScans}
        recentClaims={recentClaims}
        promotions={promotions}
        linkPages={linkPages}
        surveys={surveys.filter((s) => s.status === "published")}
        polls={polls.filter((p) => p.status === "published")}
      />
    </div>
  );
}
