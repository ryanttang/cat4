import { notFound } from "next/navigation";
import { getLandingPageBySlug } from "@/lib/data";
import { LandingPageView } from "@/components/marketing/landing-page-view";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const page = await getLandingPageBySlug(slug);
  return { title: page?.title ?? "Promotion" };
}

export default async function LandingPageRoute({ params }: Props) {
  const { slug } = await params;
  const page = await getLandingPageBySlug(slug);

  if (!page || page.status === "archived") notFound();

  return <LandingPageView page={page} />;
}
