import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { heroBlocks } from "@/lib/db/schema";
import { HeroBlock, isMockDataMode, mockHeroes, now } from "./shared";

export async function getActiveHero(): Promise<HeroBlock | null> {
  if (isMockDataMode()) {
    const active = mockHeroes()
      .filter((h) => h.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    return active[0] ?? null;
  }

  const [hero] = await getDb()
    .select()
    .from(heroBlocks)
    .where(eq(heroBlocks.isActive, true))
    .orderBy(heroBlocks.sortOrder)
    .limit(1);
  return hero ?? null;
}

export async function getHeroById(id: string): Promise<HeroBlock | null> {
  if (isMockDataMode()) {
    return mockHeroes().find((h) => h.id === id) ?? null;
  }

  const [hero] = await getDb().select().from(heroBlocks).where(eq(heroBlocks.id, id)).limit(1);
  return hero ?? null;
}

export async function listHeroes(): Promise<HeroBlock[]> {
  if (isMockDataMode()) {
    return [...mockHeroes()].sort((a, b) => a.sortOrder - b.sortOrder);
  }

  return getDb().select().from(heroBlocks).orderBy(heroBlocks.sortOrder);
}

export async function updateHero(
  id: string,
  data: Partial<Omit<HeroBlock, "id" | "createdAt" | "updatedAt">>
): Promise<HeroBlock | null> {
  if (isMockDataMode()) {
    const heroes = mockHeroes();
    const index = heroes.findIndex((h) => h.id === id);
    if (index === -1) return null;
    heroes[index] = {
      ...heroes[index],
      ...data,
      updatedAt: now(),
    };
    return heroes[index];
  }

  const [hero] = await getDb()
    .update(heroBlocks)
    .set({ ...data, updatedAt: now() })
    .where(eq(heroBlocks.id, id))
    .returning();
  return hero ?? null;
}
