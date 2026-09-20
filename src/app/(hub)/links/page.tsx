import { notFound } from "next/navigation";
import { getDefaultPublishedLinkPage, getLinksPageViewModel } from "@/lib/data";
import { LinksPageView } from "@/components/marketing/links-page-view";
import { brandMetadataTitle } from "@/lib/brand";

export async function generateMetadata() {
  const page = await getDefaultPublishedLinkPage();
  if (!page) return { title: "Not Found" };

  return {
    title: page.content.seo.title || brandMetadataTitle("Links"),
    description: page.content.seo.description,
  };
}

export default async function DefaultLinksPage() {
  const page = await getDefaultPublishedLinkPage();
  if (!page) notFound();

  const view = await getLinksPageViewModel(page);
  if (!view) notFound();

  return <LinksPageView view={view} />;
}
