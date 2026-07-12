import Link from "next/link";
import { notFound } from "next/navigation";
import { getLandingPageBySlug } from "@/lib/data";
import { PromotionEntryWizard } from "@/components/marketing/promotion-entry-wizard";
import { isPromotionActive } from "@/lib/promotion-utils";
import { Button } from "@/components/ui/button";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const page = await getLandingPageBySlug(slug);
  return { title: page ? `Enter — ${page.title}` : "Enter Promotion" };
}

export default async function PromotionEntryPage({ params }: Props) {
  const { slug } = await params;
  const page = await getLandingPageBySlug(slug);

  if (!page || page.status === "archived") notFound();

  if (!isPromotionActive(page)) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center bg-cat4-dark px-4 text-center">
        <h1 className="text-2xl font-bold text-cat4-light">Promotion closed</h1>
        <p className="mt-2 text-cat4-light/70">This promotion is not currently accepting entries.</p>
        <Button asChild variant="outline" className="mt-6 border-cat4-light/30 text-cat4-light">
          <Link href={`/l/${slug}`}>View promotion</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cat4-dark">
      <PromotionEntryWizard page={page} />
    </div>
  );
}
