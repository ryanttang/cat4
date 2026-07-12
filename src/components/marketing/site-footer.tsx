import { getFooterLinks } from "@/lib/footer-links";
import { Footer } from "./footer";

export async function SiteFooter({ className }: { className?: string }) {
  const { products, company } = await getFooterLinks();
  return <Footer className={className} productLinks={products} companyLinks={company} />;
}
