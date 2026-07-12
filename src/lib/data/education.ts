import { randomUUID } from "crypto";
import { eq, desc, and } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { educationArticles, type EducationArticle } from "@/lib/db/schema";
import { isMockDataMode, mockEducationArticles, now } from "./shared";

export async function getPublishedEducationArticles(): Promise<EducationArticle[]> {
  if (isMockDataMode()) {
    return mockEducationArticles()
      .filter((a) => a.published)
      .sort((a, b) => (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0));
  }

  return getDb()
    .select()
    .from(educationArticles)
    .where(eq(educationArticles.published, true))
    .orderBy(desc(educationArticles.publishedAt));
}

export async function getAllEducationArticles(): Promise<EducationArticle[]> {
  if (isMockDataMode()) {
    return [...mockEducationArticles()].sort(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
    );
  }

  return getDb().select().from(educationArticles).orderBy(desc(educationArticles.updatedAt));
}

export async function getEducationArticleById(id: string): Promise<EducationArticle | null> {
  if (isMockDataMode()) {
    return mockEducationArticles().find((a) => a.id === id) ?? null;
  }

  const [article] = await getDb()
    .select()
    .from(educationArticles)
    .where(eq(educationArticles.id, id))
    .limit(1);
  return article ?? null;
}

export async function getEducationArticleBySlug(
  slug: string,
  publishedOnly = false
): Promise<EducationArticle | null> {
  if (isMockDataMode()) {
    return (
      mockEducationArticles().find(
        (a) => a.slug === slug && (!publishedOnly || a.published)
      ) ?? null
    );
  }

  const conditions = [eq(educationArticles.slug, slug)];
  if (publishedOnly) conditions.push(eq(educationArticles.published, true));

  const [article] = await getDb()
    .select()
    .from(educationArticles)
    .where(and(...conditions))
    .limit(1);
  return article ?? null;
}

export async function createEducationArticle(
  data: Omit<EducationArticle, "id" | "createdAt" | "updatedAt">
): Promise<EducationArticle> {
  if (isMockDataMode()) {
    const article: EducationArticle = {
      id: randomUUID(),
      ...data,
      tags: data.tags ?? [],
      published: data.published ?? false,
      publishedAt: data.published ? (data.publishedAt ?? now()) : (data.publishedAt ?? null),
      createdAt: now(),
      updatedAt: now(),
    };
    mockEducationArticles().push(article);
    return article;
  }

  const [article] = await getDb().insert(educationArticles).values(data).returning();
  return article;
}

export async function updateEducationArticle(
  id: string,
  data: Partial<Omit<EducationArticle, "id" | "createdAt" | "updatedAt">>
): Promise<EducationArticle | null> {
  if (isMockDataMode()) {
    const index = mockEducationArticles().findIndex((a) => a.id === id);
    if (index === -1) return null;
    const publishedAt =
      data.published === true
        ? (data.publishedAt ?? mockEducationArticles()[index].publishedAt ?? now())
        : data.published === false
          ? null
          : (data.publishedAt ?? mockEducationArticles()[index].publishedAt);
    mockEducationArticles()[index] = {
      ...mockEducationArticles()[index],
      ...data,
      publishedAt,
      updatedAt: now(),
    };
    return mockEducationArticles()[index];
  }

  const [article] = await getDb()
    .update(educationArticles)
    .set({ ...data, updatedAt: now() })
    .where(eq(educationArticles.id, id))
    .returning();
  return article ?? null;
}

export async function deleteEducationArticle(id: string): Promise<boolean> {
  if (isMockDataMode()) {
    const index = mockEducationArticles().findIndex((a) => a.id === id);
    if (index === -1) return false;
    mockEducationArticles().splice(index, 1);
    return true;
  }

  await getDb().delete(educationArticles).where(eq(educationArticles.id, id));
  return true;
}
