import { getAllEducationArticles } from "@/lib/data";
import { EducationAdmin } from "@/components/admin/education-admin";

export default async function AdminEducationPage() {
  const articles = await getAllEducationArticles();
  return (
    <div>
      <EducationAdmin articles={articles} />
    </div>
  );
}
