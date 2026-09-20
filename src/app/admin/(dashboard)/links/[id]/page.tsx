import { notFound } from "next/navigation";
import {
  getLinkPageById,
  getPublishedProducts,
  getQrCodeByLinkPageId,
  getSurveysByTypes,
} from "@/lib/data";
import { LinksPageForm } from "@/components/admin/links-page-form";
import { AdminPageHeader } from "@/components/admin/admin-ui";

type Props = { params: Promise<{ id: string }> };

export default async function AdminEditLinksPage({ params }: Props) {
  const { id } = await params;
  const [page, products, surveys, polls, qrCode] = await Promise.all([
    getLinkPageById(id),
    getPublishedProducts(),
    getSurveysByTypes(["survey", "questionnaire"]),
    getSurveysByTypes(["poll"]),
    getQrCodeByLinkPageId(id),
  ]);

  if (!page) notFound();

  return (
    <div>
      <AdminPageHeader
        title={page.title}
        description="Edit appearance, buttons, products, and this page’s dedicated QR code."
      />
      <div className="mt-8">
        <LinksPageForm
          page={page}
          qrCode={qrCode}
          products={products}
          surveys={surveys}
          polls={polls}
        />
      </div>
    </div>
  );
}
