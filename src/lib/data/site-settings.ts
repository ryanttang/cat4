import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { siteSettings } from "@/lib/db/schema";
import { mockStore } from "@/lib/mock/store";
import {
  DEFAULT_HOMEPAGE_CONTENT,
  HOMEPAGE_SETTING_KEY,
  mergeHomepageContent,
  type HomepageContent,
} from "@/lib/homepage";
import { isMockDataMode, now } from "./shared";

export async function getSiteSetting<T>(key: string): Promise<T | null> {
  if (isMockDataMode()) {
    const row = mockStore.siteSettings.find((setting) => setting.key === key);
    return (row?.value as T) ?? null;
  }

  const [row] = await getDb()
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.key, key))
    .limit(1);

  return (row?.value as T) ?? null;
}

export async function upsertSiteSetting<T extends Record<string, unknown>>(
  key: string,
  value: T
): Promise<void> {
  if (isMockDataMode()) {
    const index = mockStore.siteSettings.findIndex((setting) => setting.key === key);
    if (index === -1) {
      mockStore.siteSettings.push({
        id: randomUUID(),
        key,
        value,
        updatedAt: now(),
      });
    } else {
      mockStore.siteSettings[index] = {
        ...mockStore.siteSettings[index],
        value,
        updatedAt: now(),
      };
    }
    return;
  }

  const [existing] = await getDb()
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.key, key))
    .limit(1);

  if (existing) {
    await getDb()
      .update(siteSettings)
      .set({ value, updatedAt: now() })
      .where(eq(siteSettings.key, key));
    return;
  }

  await getDb().insert(siteSettings).values({ key, value });
}

export async function getHomepageContent(): Promise<HomepageContent> {
  const stored = await getSiteSetting<Partial<HomepageContent>>(HOMEPAGE_SETTING_KEY);
  return mergeHomepageContent(stored);
}

export async function updateHomepageContent(
  content: HomepageContent
): Promise<HomepageContent> {
  await upsertSiteSetting(HOMEPAGE_SETTING_KEY, content);
  return content;
}

export { DEFAULT_HOMEPAGE_CONTENT };
