import { notFound } from "next/navigation";
import { getAmbassadorById, getAmbassadorAnalytics } from "@/lib/data/ambassadors";
import { AmbassadorAnalyticsPanel } from "@/components/admin/ambassadors-admin";
import { ExportAmbassadorDataButton } from "@/components/admin/export-ambassador-data-button";

type Props = { params: Promise<{ id: string }> };

export default async function AdminAmbassadorAnalyticsPage({ params }: Props) {
  const { id } = await params;
  const [ambassador, analytics] = await Promise.all([
    getAmbassadorById(id),
    getAmbassadorAnalytics(id),
  ]);

  if (!ambassador) notFound();

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <ExportAmbassadorDataButton ambassadorId={id} slug={ambassador.slug} />
      </div>
      <AmbassadorAnalyticsPanel ambassador={ambassador} analytics={analytics} />
    </div>
  );
}
