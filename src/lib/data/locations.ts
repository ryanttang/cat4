import { randomUUID } from "crypto";
import { eq, desc } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { locations, type Location } from "@/lib/db/schema";
import { isMockDataMode, mockLocations, now } from "./shared";

export async function getPublishedLocations(): Promise<Location[]> {
  if (isMockDataMode()) {
    return mockLocations()
      .filter((l) => l.published)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  return getDb()
    .select()
    .from(locations)
    .where(eq(locations.published, true))
    .orderBy(locations.name);
}

export async function getAllLocations(): Promise<Location[]> {
  if (isMockDataMode()) {
    return [...mockLocations()].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  return getDb().select().from(locations).orderBy(desc(locations.updatedAt));
}

export async function getLocationById(id: string): Promise<Location | null> {
  if (isMockDataMode()) {
    return mockLocations().find((l) => l.id === id) ?? null;
  }

  const [location] = await getDb().select().from(locations).where(eq(locations.id, id)).limit(1);
  return location ?? null;
}

export async function createLocation(
  data: Omit<Location, "id" | "createdAt" | "updatedAt">
): Promise<Location> {
  if (isMockDataMode()) {
    const location: Location = {
      id: randomUUID(),
      ...data,
      published: data.published ?? true,
      createdAt: now(),
      updatedAt: now(),
    };
    mockLocations().push(location);
    return location;
  }

  const [location] = await getDb().insert(locations).values(data).returning();
  return location;
}

export async function updateLocation(
  id: string,
  data: Partial<Omit<Location, "id" | "createdAt" | "updatedAt">>
): Promise<Location | null> {
  if (isMockDataMode()) {
    const index = mockLocations().findIndex((l) => l.id === id);
    if (index === -1) return null;
    mockLocations()[index] = {
      ...mockLocations()[index],
      ...data,
      updatedAt: now(),
    };
    return mockLocations()[index];
  }

  const [location] = await getDb()
    .update(locations)
    .set({ ...data, updatedAt: now() })
    .where(eq(locations.id, id))
    .returning();
  return location ?? null;
}

export async function deleteLocation(id: string): Promise<boolean> {
  if (isMockDataMode()) {
    const index = mockLocations().findIndex((l) => l.id === id);
    if (index === -1) return false;
    mockLocations().splice(index, 1);
    return true;
  }

  await getDb().delete(locations).where(eq(locations.id, id));
  return true;
}
