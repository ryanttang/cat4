import { randomUUID } from "crypto";
import { eq, desc, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { mockStore } from "@/lib/mock/store";
import {
  landingPages,
  landingPageEntries,
  type LandingPage,
  type LandingPageBlock,
} from "@/lib/db/schema";
import { buildCsv } from "@/lib/csv";
import { isMockDataMode, mockLandingPages, now } from "./shared";

function defaultLandingPageBlocks(title: string): LandingPageBlock {
  return {
    hero: { headline: title, subheadline: "" },
    form: {
      fields: [{ name: "email", label: "Email", required: true, type: "email" }],
      consentText: "I agree to the official rules and to receive emails from CAT4.",
    },
    rules: { content: "Official rules go here." },
  };
}

export async function getAllLandingPages(): Promise<LandingPage[]> {
  if (isMockDataMode()) {
    return [...mockLandingPages()].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  return getDb().select().from(landingPages).orderBy(desc(landingPages.updatedAt));
}

export async function getPublishedLandingPages(): Promise<LandingPage[]> {
  if (isMockDataMode()) {
    return mockLandingPages()
      .filter((p) => p.status === "published")
      .sort((a, b) => a.title.localeCompare(b.title));
  }

  return getDb()
    .select()
    .from(landingPages)
    .where(eq(landingPages.status, "published"))
    .orderBy(landingPages.title);
}

export async function getLandingPageById(id: string): Promise<LandingPage | null> {
  if (isMockDataMode()) {
    return mockLandingPages().find((p) => p.id === id) ?? null;
  }

  const [page] = await getDb().select().from(landingPages).where(eq(landingPages.id, id)).limit(1);
  return page ?? null;
}

export async function getLandingPageBySlug(slug: string): Promise<LandingPage | null> {
  if (isMockDataMode()) {
    return mockLandingPages().find((p) => p.slug === slug) ?? null;
  }

  const [page] = await getDb()
    .select()
    .from(landingPages)
    .where(eq(landingPages.slug, slug))
    .limit(1);
  return page ?? null;
}

export async function getLandingPageEntryCounts(): Promise<
  Array<{ landingPageId: string; count: number }>
> {
  if (isMockDataMode()) {
    const counts = new Map<string, number>();
    for (const entry of mockStore.landingPageEntries) {
      counts.set(entry.landingPageId, (counts.get(entry.landingPageId) ?? 0) + 1);
    }
    return Array.from(counts.entries()).map(([landingPageId, count]) => ({
      landingPageId,
      count,
    }));
  }

  return getDb()
    .select({
      landingPageId: landingPageEntries.landingPageId,
      count: sql<number>`count(*)::int`,
    })
    .from(landingPageEntries)
    .groupBy(landingPageEntries.landingPageId);
}

export async function getLandingPageEntries(landingPageId: string) {
  if (isMockDataMode()) {
    return mockStore.landingPageEntries
      .filter((e) => e.landingPageId === landingPageId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  return getDb()
    .select()
    .from(landingPageEntries)
    .where(eq(landingPageEntries.landingPageId, landingPageId))
    .orderBy(desc(landingPageEntries.createdAt));
}

export async function exportLandingPageEntriesCsv(landingPageId: string): Promise<string> {
  const entries = await getLandingPageEntries(landingPageId);
  return buildCsv(
    ["Email", "First Name", "Last Name", "State", "Phone", "Category", "Referral", "Submitted At"],
    entries.map((e) => {
      const extra = (e.formData ?? {}) as Record<string, string>;
      return [
        e.email,
        e.firstName ?? "",
        e.lastName ?? "",
        extra.state ?? "",
        extra.phone ?? "",
        extra.favoriteCategory ?? "",
        extra.referralSource ?? "",
        e.createdAt.toISOString(),
      ];
    })
  );
}

export async function createLandingPage(
  data: {
    title: string;
    slug: string;
    type: LandingPage["type"];
    status?: LandingPage["status"];
    blocks?: LandingPageBlock;
    startsAt?: Date | string | null;
    endsAt?: Date | string | null;
  },
  createdById?: string
): Promise<LandingPage> {
  const status = data.status ?? "draft";
  const blocks = data.blocks ?? defaultLandingPageBlocks(data.title);
  const startsAt = data.startsAt ? new Date(data.startsAt) : null;
  const endsAt = data.endsAt ? new Date(data.endsAt) : null;
  const publishedAt = status === "published" ? now() : null;

  if (isMockDataMode()) {
    const page: LandingPage = {
      id: randomUUID(),
      title: data.title,
      slug: data.slug,
      type: data.type,
      status,
      blocks,
      startsAt,
      endsAt,
      createdById: createdById ?? null,
      publishedAt,
      createdAt: now(),
      updatedAt: now(),
    };
    mockLandingPages().push(page);
    return page;
  }

  const [page] = await getDb()
    .insert(landingPages)
    .values({
      title: data.title,
      slug: data.slug,
      type: data.type,
      status,
      blocks,
      startsAt,
      endsAt,
      createdById,
      publishedAt,
    })
    .returning();
  return page;
}

export async function updateLandingPage(
  id: string,
  data: {
    title?: string;
    slug?: string;
    type?: LandingPage["type"];
    status?: LandingPage["status"];
    blocks?: LandingPageBlock;
    startsAt?: Date | string | null;
    endsAt?: Date | string | null;
  }
): Promise<LandingPage | null> {
  const startsAt =
    data.startsAt === undefined ? undefined : data.startsAt ? new Date(data.startsAt) : null;
  const endsAt =
    data.endsAt === undefined ? undefined : data.endsAt ? new Date(data.endsAt) : null;
  const publishedAt = data.status === "published" ? now() : data.status ? null : undefined;

  if (isMockDataMode()) {
    const index = mockLandingPages().findIndex((p) => p.id === id);
    if (index === -1) return null;
    const current = mockLandingPages()[index];
    mockLandingPages()[index] = {
      ...current,
      ...data,
      startsAt: startsAt === undefined ? current.startsAt : startsAt,
      endsAt: endsAt === undefined ? current.endsAt : endsAt,
      publishedAt: publishedAt === undefined ? current.publishedAt : publishedAt,
      updatedAt: now(),
    };
    return mockLandingPages()[index];
  }

  const [page] = await getDb()
    .update(landingPages)
    .set({
      ...data,
      startsAt,
      endsAt,
      publishedAt,
      updatedAt: now(),
    })
    .where(eq(landingPages.id, id))
    .returning();
  return page ?? null;
}

export async function deleteLandingPage(id: string): Promise<boolean> {
  if (isMockDataMode()) {
    const index = mockLandingPages().findIndex((p) => p.id === id);
    if (index === -1) return false;
    mockLandingPages().splice(index, 1);
    mockStore.landingPageEntries = mockStore.landingPageEntries.filter(
      (e) => e.landingPageId !== id
    );
    return true;
  }

  await getDb().delete(landingPages).where(eq(landingPages.id, id));
  return true;
}

export async function createLandingPageEntry(data: {
  landingPageId: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  formData?: Record<string, string> | null;
}): Promise<(typeof mockStore.landingPageEntries)[number]> {
  if (isMockDataMode()) {
    const entry = {
      id: randomUUID(),
      landingPageId: data.landingPageId,
      email: data.email.toLowerCase(),
      firstName: data.firstName ?? null,
      lastName: data.lastName ?? null,
      formData: data.formData ?? null,
      createdAt: now(),
    };
    mockStore.landingPageEntries.push(entry);
    return entry;
  }

  const [entry] = await getDb()
    .insert(landingPageEntries)
    .values({
      landingPageId: data.landingPageId,
      email: data.email.toLowerCase(),
      firstName: data.firstName,
      lastName: data.lastName,
      formData: data.formData,
    })
    .returning();
  return entry;
}
