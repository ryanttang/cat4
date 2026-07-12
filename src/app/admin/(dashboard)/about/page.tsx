import { getAllAboutSections } from "@/lib/data";
import { AboutAdmin } from "@/components/admin/about-admin";

export default async function AdminAboutPage() {
  const sections = await getAllAboutSections();
  return (
    <div>
      <AboutAdmin sections={sections} />
    </div>
  );
}
