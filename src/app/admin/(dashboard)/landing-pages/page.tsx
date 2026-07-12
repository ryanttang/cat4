import { getAllLandingPages, getLandingPageEntryCounts } from "@/lib/data";
import { LandingPagesAdmin } from "@/components/admin/landing-pages-admin";

export default async function AdminLandingPagesPage() {
  const [pages, entryCountsList] = await Promise.all([
    getAllLandingPages(),
    getLandingPageEntryCounts(),
  ]);

  const entryCounts = Object.fromEntries(
    entryCountsList.map((entry) => [entry.landingPageId, entry.count])
  );

  return (
    <div>
      <LandingPagesAdmin pages={pages} entryCounts={entryCounts} />
    </div>
  );
}
