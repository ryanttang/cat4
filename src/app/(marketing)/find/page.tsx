import { getPublishedLocations } from "@/lib/data";
import { WhereToFind } from "@/components/marketing/where-to-find";

export const metadata = { title: "Find Us" };

export default async function FindPage() {
  const storeLocations = await getPublishedLocations();
  return <WhereToFind locations={storeLocations} />;
}
