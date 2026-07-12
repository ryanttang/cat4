import { listHeroes } from "@/lib/data";
import { HeroSettingsForm } from "@/components/admin/hero-settings-form";
import { AdminPageHeader } from "@/components/admin/admin-ui";

export default async function AdminSettingsPage() {
  const heroes = await listHeroes();
  const hero = heroes[0];

  if (!hero) {
    return (
      <div>
        <AdminPageHeader title="Settings" />
        <p className="mt-4 text-muted-foreground">No hero block found. Run the seed script first.</p>
      </div>
    );
  }

  return (
    <div>
      <AdminPageHeader
        title="Settings"
        description="Manage homepage hero video, copy, and site preferences."
      />
      <div className="mt-8">
        <HeroSettingsForm hero={hero} />
      </div>
    </div>
  );
}
