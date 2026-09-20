import { randomUUID } from "crypto";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { mockStore } from "@/lib/mock/store";
import { linkPages, type LinkPage } from "@/lib/db/schema";
import {
  DEFAULT_LINKS_PAGE_CONTENT,
  LINKS_SETTING_KEY,
  buildLinksPageViewModel,
  mergeLinksPageContent,
  type LinksPageContent,
  type LinksPageViewModel,
} from "@/lib/links";
import { slugify } from "@/lib/utils";
import { getPublishedProducts } from "./products";
import { getSiteSetting } from "./site-settings";
import { isMockDataMode, now } from "./shared";
import { getAllSurveys } from "./surveys";
import { createLinkPageQrCode } from "./qr-codes";

export type LinkPageWithContent = Omit<LinkPage, "content"> & {
  content: LinksPageContent;
};

function hydrateLinkPage(row: LinkPage): LinkPageWithContent {
  return {
    ...row,
    content: mergeLinksPageContent(row.content as Partial<LinksPageContent>),
  };
}

function mockLinkPages(): LinkPage[] {
  return mockStore.linkPages as LinkPage[];
}

async function ensureUniqueSlug(preferred: string, excludeId?: string): Promise<string> {
  const base = slugify(preferred) || "links";
  let slug = base;
  let attempt = 0;

  while (attempt < 20) {
    const existing = await getLinkPageBySlug(slug);
    if (!existing || existing.id === excludeId) return slug;
    attempt += 1;
    slug = `${base}-${attempt + 1}`;
  }

  return `${base}-${Date.now().toString(36)}`;
}

export async function getAllLinkPages(): Promise<LinkPageWithContent[]> {
  await migrateLegacyLinksSetting();

  if (isMockDataMode()) {
    return [...mockLinkPages()]
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .map(hydrateLinkPage);
  }

  const rows = await getDb().select().from(linkPages).orderBy(desc(linkPages.updatedAt));
  return rows.map(hydrateLinkPage);
}

export async function getPublishedLinkPages(): Promise<LinkPageWithContent[]> {
  const all = await getAllLinkPages();
  return all.filter((page) => page.status === "published");
}

export async function getDefaultPublishedLinkPage(): Promise<LinkPageWithContent | null> {
  const published = await getPublishedLinkPages();
  if (published.length === 0) return null;
  return [...published].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())[0] ?? null;
}

export async function getLinkPageById(id: string): Promise<LinkPageWithContent | null> {
  if (isMockDataMode()) {
    const row = mockLinkPages().find((page) => page.id === id);
    return row ? hydrateLinkPage(row) : null;
  }

  const [row] = await getDb().select().from(linkPages).where(eq(linkPages.id, id)).limit(1);
  return row ? hydrateLinkPage(row) : null;
}

export async function getLinkPageBySlug(slug: string): Promise<LinkPageWithContent | null> {
  if (isMockDataMode()) {
    const row = mockLinkPages().find((page) => page.slug === slug);
    return row ? hydrateLinkPage(row) : null;
  }

  const [row] = await getDb().select().from(linkPages).where(eq(linkPages.slug, slug)).limit(1);
  return row ? hydrateLinkPage(row) : null;
}

export async function createLinkPage(data: {
  title: string;
  slug?: string;
  status?: LinkPage["status"];
  content?: Partial<LinksPageContent>;
}): Promise<LinkPageWithContent> {
  const content = mergeLinksPageContent({
    ...data.content,
    appearance: {
      ...DEFAULT_LINKS_PAGE_CONTENT.appearance,
      ...data.content?.appearance,
      title: data.content?.appearance?.title || data.title,
    },
    published: (data.status ?? "draft") === "published",
  });
  const status = data.status ?? (content.published ? "published" : "draft");
  const slug = await ensureUniqueSlug(data.slug || data.title);
  const timestamp = now();

  if (isMockDataMode()) {
    const row: LinkPage = {
      id: randomUUID(),
      title: data.title,
      slug,
      status,
      content,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    mockLinkPages().push(row);
    const created = hydrateLinkPage(row);
    await createLinkPageQrCode(created.id, created.title, created.slug, created.status);
    return created;
  }

  const [row] = await getDb()
    .insert(linkPages)
    .values({
      title: data.title,
      slug,
      status,
      content,
    })
    .returning();

  const created = hydrateLinkPage(row);
  await createLinkPageQrCode(created.id, created.title, created.slug, created.status);
  return created;
}

export async function updateLinkPage(
  id: string,
  data: {
    title?: string;
    slug?: string;
    status?: LinkPage["status"];
    content?: LinksPageContent;
  }
): Promise<LinkPageWithContent | null> {
  const current = await getLinkPageById(id);
  if (!current) return null;

  const status =
    data.status ??
    (data.content ? (data.content.published ? "published" : "draft") : current.status);
  const content = data.content
    ? mergeLinksPageContent({ ...data.content, published: status === "published" })
    : current.content;
  const title = data.title ?? current.title;
  const slug = data.slug ? await ensureUniqueSlug(data.slug, id) : current.slug;

  if (isMockDataMode()) {
    const index = mockLinkPages().findIndex((page) => page.id === id);
    if (index === -1) return null;
    const updated: LinkPage = {
      ...mockLinkPages()[index],
      title,
      slug,
      status,
      content,
      updatedAt: now(),
    };
    mockLinkPages()[index] = updated;
    return hydrateLinkPage(updated);
  }

  const [row] = await getDb()
    .update(linkPages)
    .set({ title, slug, status, content, updatedAt: now() })
    .where(eq(linkPages.id, id))
    .returning();

  return row ? hydrateLinkPage(row) : null;
}

export async function deleteLinkPage(id: string): Promise<boolean> {
  if (isMockDataMode()) {
    const index = mockLinkPages().findIndex((page) => page.id === id);
    if (index === -1) return false;
    mockLinkPages().splice(index, 1);
    mockStore.qrCodes = mockStore.qrCodes.filter((qr) => qr.linkPageId !== id);
    return true;
  }

  const result = await getDb().delete(linkPages).where(eq(linkPages.id, id));
  return (result.rowCount ?? 0) > 0;
}

export async function getLinksPageViewModel(
  page?: LinkPageWithContent | null
): Promise<LinksPageViewModel | null> {
  const resolved = page ?? (await getDefaultPublishedLinkPage());
  if (!resolved) return null;

  const [products, surveys] = await Promise.all([getPublishedProducts(), getAllSurveys()]);
  return buildLinksPageViewModel(resolved.content, products, surveys);
}

async function migrateLegacyLinksSetting(): Promise<void> {
  if (isMockDataMode()) {
    if (mockLinkPages().length > 0) return;
  } else {
    const existing = await getDb().select({ id: linkPages.id }).from(linkPages).limit(1);
    if (existing.length > 0) return;
  }

  const stored = await getSiteSetting<Partial<LinksPageContent>>(LINKS_SETTING_KEY);
  if (!stored || Object.keys(stored).length === 0) return;

  if (isMockDataMode()) {
    if (mockLinkPages().length > 0) return;
  } else {
    const existing = await getDb().select({ id: linkPages.id }).from(linkPages).limit(1);
    if (existing.length > 0) return;
  }

  const content = mergeLinksPageContent(stored);
  try {
    await createLinkPage({
      title: content.appearance.title || "Links",
      slug: "main",
      status: content.published ? "published" : "draft",
      content,
    });
  } catch {
    // Another request may have migrated the legacy setting first.
  }
}

export { DEFAULT_LINKS_PAGE_CONTENT };
