import { getAmbassadorsDashboardStats, getAmbassadorLeaderboard } from "@/lib/data/ambassadors";
import { AmbassadorsAdmin } from "@/components/admin/ambassadors-admin";

export default async function AdminAmbassadorsPage() {
  const [stats, leaderboard] = await Promise.all([
    getAmbassadorsDashboardStats(),
    getAmbassadorLeaderboard(),
  ]);

  return (
    <div>
      <AmbassadorsAdmin stats={stats} leaderboard={leaderboard} />
    </div>
  );
}
