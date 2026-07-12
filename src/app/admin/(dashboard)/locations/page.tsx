import { getAllLocations } from "@/lib/data";
import { LocationsAdmin } from "@/components/admin/locations-admin";

export default async function AdminLocationsPage() {
  const allLocations = await getAllLocations();
  return (
    <div>
      <LocationsAdmin locations={allLocations} />
    </div>
  );
}
