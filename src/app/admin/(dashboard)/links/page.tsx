import { createLinkPageQrCode, getAllLinkPages, getQrCodeByLinkPageId } from "@/lib/data";
import { LinksPagesAdmin } from "@/components/admin/links-pages-admin";
import type { QrCode } from "@/lib/db/schema";

export default async function AdminLinksIndexPage() {
  const pages = await getAllLinkPages();
  const qrCodes = await Promise.all(
    pages.map(async (page) => {
      const existing = await getQrCodeByLinkPageId(page.id);
      return existing ?? createLinkPageQrCode(page.id, page.title, page.slug, page.status);
    })
  );
  const qrCodesByPageId = Object.fromEntries(
    pages.flatMap((page, index) => {
      const qrCode = qrCodes[index];
      return qrCode ? [[page.id, qrCode] satisfies [string, QrCode]] : [];
    })
  );

  return <LinksPagesAdmin pages={pages} qrCodesByPageId={qrCodesByPageId} />;
}
