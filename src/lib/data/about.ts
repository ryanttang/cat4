import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { aboutSections } from "@/lib/db/schema";
import { AboutSection, isMockDataMode, mockAboutSections, now } from "./shared";

export async function getPublishedAboutSections(): Promise<AboutSection[]> {
  if (isMockDataMode()) {
    return mockAboutSections()
      .filter((s) => s.published)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  return getDb()
    .select()
    .from(aboutSections)
    .where(eq(aboutSections.published, true))
    .orderBy(aboutSections.sortOrder);
}

export async function getAllAboutSections(): Promise<AboutSection[]> {
  if (isMockDataMode()) {
    return [...mockAboutSections()].sort((a, b) => a.sortOrder - b.sortOrder);
  }

  return getDb().select().from(aboutSections).orderBy(aboutSections.sortOrder);
}

export async function getAboutSectionById(id: string): Promise<AboutSection | null> {
  if (isMockDataMode()) {
    return mockAboutSections().find((s) => s.id === id) ?? null;
  }

  const [section] = await getDb()
    .select()
    .from(aboutSections)
    .where(eq(aboutSections.id, id))
    .limit(1);
  return section ?? null;
}

export async function createAboutSection(
  data: Omit<AboutSection, "id" | "createdAt" | "updatedAt">
): Promise<AboutSection> {
  if (isMockDataMode()) {
    const section: AboutSection = {
      id: randomUUID(),
      ...data,
      sortOrder: data.sortOrder ?? 0,
      published: data.published ?? true,
      createdAt: now(),
      updatedAt: now(),
    };
    mockAboutSections().push(section);
    return section;
  }

  const [section] = await getDb().insert(aboutSections).values(data).returning();
  return section;
}

export async function updateAboutSection(
  id: string,
  data: Partial<Omit<AboutSection, "id" | "createdAt" | "updatedAt">>
): Promise<AboutSection | null> {
  if (isMockDataMode()) {
    const index = mockAboutSections().findIndex((s) => s.id === id);
    if (index === -1) return null;
    mockAboutSections()[index] = {
      ...mockAboutSections()[index],
      ...data,
      updatedAt: now(),
    };
    return mockAboutSections()[index];
  }

  const [section] = await getDb()
    .update(aboutSections)
    .set({ ...data, updatedAt: now() })
    .where(eq(aboutSections.id, id))
    .returning();
  return section ?? null;
}

export async function deleteAboutSection(id: string): Promise<boolean> {
  if (isMockDataMode()) {
    const index = mockAboutSections().findIndex((s) => s.id === id);
    if (index === -1) return false;
    mockAboutSections().splice(index, 1);
    return true;
  }

  await getDb().delete(aboutSections).where(eq(aboutSections.id, id));
  return true;
}
