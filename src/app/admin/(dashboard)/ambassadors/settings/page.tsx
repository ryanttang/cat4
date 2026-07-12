import { getAmbassadorHubDefaults } from "@/lib/data/ambassadors";
import { AmbassadorGlobalSettingsForm } from "@/components/admin/ambassador-global-settings-form";

export default async function AdminAmbassadorSettingsPage() {
  const defaults = await getAmbassadorHubDefaults();

  return (
    <div>
      <AmbassadorGlobalSettingsForm defaults={defaults} />
    </div>
  );
}
