import { notFound } from "next/navigation";
import { getAmbassadorWithQr } from "@/lib/data/ambassadors";
import { AmbassadorForm } from "@/components/admin/ambassador-form";

type Props = { params: Promise<{ id: string }> };

export default async function AdminEditAmbassadorPage({ params }: Props) {
  const { id } = await params;
  const ambassador = await getAmbassadorWithQr(id);
  if (!ambassador) notFound();

  return (
    <div>
      <AmbassadorForm ambassador={ambassador} qrCode={ambassador.qrCode} />
    </div>
  );
}
