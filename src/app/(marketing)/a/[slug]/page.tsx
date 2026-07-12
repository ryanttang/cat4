import { notFound } from "next/navigation";
import {
  getAmbassadorBySlug,
  getAmbassadorHubDefaults,
  resolveAmbassadorHub,
} from "@/lib/data/ambassadors";
import { AmbassadorHubView } from "@/components/marketing/ambassadors/ambassador-hub-view";
import { ambassadorDisplayName } from "@/lib/ambassadors/constants";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const ambassador = await getAmbassadorBySlug(slug);
  if (!ambassador || ambassador.status !== "published") return { title: "Not Found" };

  const name = ambassadorDisplayName(ambassador.firstName, ambassador.lastName);
  return {
    title: `${name} | CAT4`,
    description: ambassador.bio ?? `Connect with ${name} and CAT4`,
  };
}

export default async function AmbassadorVanityPage({ params }: Props) {
  const { slug } = await params;
  const ambassador = await getAmbassadorBySlug(slug);
  if (!ambassador || ambassador.status !== "published") notFound();

  const defaults = await getAmbassadorHubDefaults();
  const hub = resolveAmbassadorHub(ambassador, defaults);

  return (
    <AmbassadorHubView
      ambassadorId={ambassador.id}
      slug={slug}
      hub={hub}
      recordVanityVisit
    />
  );
}
