import { notFound } from "next/navigation";
import { getLinkPageBySlug, getLinksPageViewModel } from "@/lib/data";
import { LinksPageView } from "@/components/marketing/links-page-view";
import { brandMetadataTitle } from "@/lib/brand";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const page = await getLinkPageBySlug(slug);
  if (!page || page.status !== "published") return { title: "Not Found" };

  return {
    title: page.content.seo.title || brandMetadataTitle(page.title),
    description: page.content.seo.description,
  };
}

export default async function LinksSlugPage({ params }: Props) {
  const { slug } = await params;
  const page = await getLinkPageBySlug(slug);
  if (!page || page.status !== "published") notFound();

  const view = await getLinksPageViewModel(page);
  if (!view) notFound();

  return <LinksPageView view={view} />;
}
