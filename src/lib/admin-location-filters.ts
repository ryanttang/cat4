import type { Location } from "@/lib/db/schema";

export type AdminLocationSort =
  | "updated-desc"
  | "updated-asc"
  | "name-asc"
  | "name-desc"
  | "city-asc"
  | "city-desc"
  | "status-asc"
  | "status-desc";

export type AdminLocationSortColumn = "name" | "city" | "status";

export type AdminLocationStatusFilter = "all" | "published" | "draft";

export type AdminLocationFilters = {
  search: string;
  state: string;
  status: AdminLocationStatusFilter;
  sort: AdminLocationSort;
};

export const DEFAULT_ADMIN_LOCATION_FILTERS: AdminLocationFilters = {
  search: "",
  state: "all",
  status: "all",
  sort: "updated-desc",
};

export function getLocationStateOptions(locations: Location[]) {
  const states = [...new Set(locations.map((location) => location.state))].sort();
  return [
    { value: "all", label: "All states" },
    ...states.map((state) => ({ value: state, label: state })),
  ];
}

export function filterAdminLocations(
  locations: Location[],
  filters: AdminLocationFilters
): Location[] {
  const query = filters.search.trim().toLowerCase();

  let result = locations.filter((location) => {
    if (query) {
      const haystack = [
        location.name,
        location.address,
        location.city,
        location.state,
        location.zip,
        location.phone,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(query)) return false;
    }

    if (filters.state !== "all" && location.state !== filters.state) return false;

    if (filters.status === "published" && !location.published) return false;
    if (filters.status === "draft" && location.published) return false;

    return true;
  });

  result = sortAdminLocations(result, filters.sort);
  return result;
}

export function sortAdminLocations(locations: Location[], sort: AdminLocationSort): Location[] {
  const copy = [...locations];

  switch (sort) {
    case "name-asc":
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    case "name-desc":
      return copy.sort((a, b) => b.name.localeCompare(a.name));
    case "city-asc":
      return copy.sort((a, b) => {
        const cityCompare = a.city.localeCompare(b.city);
        if (cityCompare !== 0) return cityCompare;
        const stateCompare = a.state.localeCompare(b.state);
        return stateCompare !== 0 ? stateCompare : a.name.localeCompare(b.name);
      });
    case "city-desc":
      return copy.sort((a, b) => {
        const cityCompare = b.city.localeCompare(a.city);
        if (cityCompare !== 0) return cityCompare;
        const stateCompare = b.state.localeCompare(a.state);
        return stateCompare !== 0 ? stateCompare : a.name.localeCompare(b.name);
      });
    case "status-asc":
      return copy.sort((a, b) => {
        if (a.published !== b.published) return a.published ? 1 : -1;
        return a.name.localeCompare(b.name);
      });
    case "status-desc":
      return copy.sort((a, b) => {
        if (a.published !== b.published) return a.published ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
    case "updated-asc":
      return copy.sort((a, b) => a.updatedAt.getTime() - b.updatedAt.getTime());
    case "updated-desc":
    default:
      return copy.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }
}

export function adminLocationFiltersActive(filters: AdminLocationFilters): boolean {
  return (
    filters.search.trim() !== "" ||
    filters.state !== "all" ||
    filters.status !== "all" ||
    filters.sort !== DEFAULT_ADMIN_LOCATION_FILTERS.sort
  );
}

export function getLocationSortDirection(
  sort: AdminLocationSort,
  column: AdminLocationSortColumn
): "asc" | "desc" | null {
  if (sort === `${column}-asc`) return "asc";
  if (sort === `${column}-desc`) return "desc";
  return null;
}

export function getNextLocationSortForColumn(
  current: AdminLocationSort,
  column: AdminLocationSortColumn
): AdminLocationSort {
  if (current === `${column}-asc`) return `${column}-desc` as AdminLocationSort;
  return `${column}-asc` as AdminLocationSort;
}
