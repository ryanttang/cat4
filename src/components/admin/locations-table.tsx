"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, ArrowDown, ArrowUp, ArrowUpDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdminTableThumbnail, adminTableWrapClass } from "@/components/admin/admin-ui";
import {
  DEFAULT_ADMIN_LOCATION_FILTERS,
  adminLocationFiltersActive,
  filterAdminLocations,
  getLocationSortDirection,
  getLocationStateOptions,
  getNextLocationSortForColumn,
  type AdminLocationFilters,
  type AdminLocationSortColumn,
  type AdminLocationStatusFilter,
} from "@/lib/admin-location-filters";
import { cn } from "@/lib/utils";
import type { Location } from "@/lib/db/schema";

type LocationsTableProps = {
  locations: Location[];
  onEdit?: (location: Location) => void;
};

function SortableHeader({
  label,
  column,
  sort,
  onSort,
  className,
}: {
  label: string;
  column: AdminLocationSortColumn;
  sort: AdminLocationFilters["sort"];
  onSort: (column: AdminLocationSortColumn) => void;
  className?: string;
}) {
  const direction = getLocationSortDirection(sort, column);
  const Icon = direction === "asc" ? ArrowUp : direction === "desc" ? ArrowDown : ArrowUpDown;

  return (
    <th className={cn("p-0", className)}>
      <button
        type="button"
        onClick={() => onSort(column)}
        className={cn(
          "flex w-full items-center gap-1.5 p-4 text-left text-sm font-medium transition-colors hover:text-foreground",
          direction ? "text-foreground" : "text-muted-foreground"
        )}
      >
        <span>{label}</span>
        <Icon className={cn("h-3.5 w-3.5 shrink-0", !direction && "opacity-50")} />
      </button>
    </th>
  );
}

export function LocationsTable({ locations, onEdit }: LocationsTableProps) {
  const [filters, setFilters] = useState<AdminLocationFilters>(DEFAULT_ADMIN_LOCATION_FILTERS);

  const stateOptions = useMemo(() => getLocationStateOptions(locations), [locations]);

  const filteredLocations = useMemo(
    () => filterAdminLocations(locations, filters),
    [locations, filters]
  );

  function updateFilters(update: Partial<AdminLocationFilters>) {
    setFilters((current) => ({ ...current, ...update }));
  }

  function clearFilters() {
    setFilters(DEFAULT_ADMIN_LOCATION_FILTERS);
  }

  function handleColumnSort(column: AdminLocationSortColumn) {
    setFilters((current) => ({
      ...current,
      sort: getNextLocationSortForColumn(current.sort, column),
    }));
  }

  const hasActiveFilters = adminLocationFiltersActive(filters);

  return (
    <div className="mt-8 space-y-4">
      <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={filters.search}
              onChange={(event) => updateFilters({ search: event.target.value })}
              placeholder="Search by name, address, city, state, zip, or phone..."
              className="pl-9"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Select
              value={filters.state}
              onValueChange={(value) => updateFilters({ state: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="State" />
              </SelectTrigger>
              <SelectContent>
                {stateOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.status}
              onValueChange={(value) =>
                updateFilters({ status: value as AdminLocationStatusFilter })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
          <p>
            Showing {filteredLocations.length} of {locations.length} locations
          </p>
          {hasActiveFilters && (
            <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
              <X className="mr-2 h-4 w-4" />
              Clear filters
            </Button>
          )}
        </div>
      </div>

      <div className={cn(adminTableWrapClass, "mt-0")}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left">
              <SortableHeader label="Name" column="name" sort={filters.sort} onSort={handleColumnSort} />
              <SortableHeader label="City" column="city" sort={filters.sort} onSort={handleColumnSort} />
              <SortableHeader label="Status" column="status" sort={filters.sort} onSort={handleColumnSort} />
              <th className="p-4" />
            </tr>
          </thead>
          <tbody>
            {filteredLocations.map((location) => (
              <tr
                key={location.id}
                className="border-b border-border/50 transition-colors hover:bg-muted/30"
              >
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <AdminTableThumbnail src={location.imageUrl} alt={location.name} />
                    <span className="font-medium">{location.name}</span>
                  </div>
                </td>
                <td className="p-4">
                  {location.city}, {location.state}
                </td>
                <td className="p-4">
                  <Badge variant={location.published ? "success" : "secondary"}>
                    {location.published ? "Published" : "Draft"}
                  </Badge>
                </td>
                <td className="p-4">
                  {onEdit ? (
                    <Button type="button" variant="ghost" size="sm" onClick={() => onEdit(location)}>
                      Edit
                    </Button>
                  ) : (
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/admin/locations/${location.id}`}>Edit</Link>
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {locations.length === 0 && (
          <p className="p-8 text-center text-muted-foreground">No locations yet.</p>
        )}
        {locations.length > 0 && filteredLocations.length === 0 && (
          <p className="p-8 text-center text-muted-foreground">
            No locations match your search or filters.
          </p>
        )}
      </div>
    </div>
  );
}
