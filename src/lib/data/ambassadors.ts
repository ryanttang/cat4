import { randomUUID } from "crypto";
import { desc, eq, sql, and, gte } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { mockStore } from "@/lib/mock/store";
import {
  brandAmbassadors,
  ambassadorLinkClicks,
  qrScans,
  captures,
  type BrandAmbassador,
  type AmbassadorHubLink,
  type AmbassadorHubDefaults,
  type AmbassadorHubOverrides,
  type AmbassadorLinkClick,
  type QrCode,
} from "@/lib/db/schema";
import { buildCsv } from "@/lib/csv";
import {
  AMBASSADOR_HUB_DEFAULTS_KEY,
  DEFAULT_AMBASSADOR_HUB,
  ambassadorDisplayName,
} from "@/lib/ambassadors/constants";
import {
  createQrCode,
  getQrCodeByAmbassadorId,
  updateQrCode,
  logQrScan,
} from "./qr-codes";
import { getSiteSetting, upsertSiteSetting } from "./site-settings";
import { isMockDataMode, now } from "./shared";
import { parseDeviceType } from "@/lib/rewards/constants";
import { slugify } from "@/lib/utils";

export type ResolvedAmbassadorHub = {
  hubTitle: string;
  hubBio?: string;
  hubImageUrl?: string;
  links: AmbassadorHubLink[];
};

export type AmbassadorWithQr = BrandAmbassador & {
  qrCode: QrCode | null;
};

export type AmbassadorLeaderboardEntry = {
  ambassador: BrandAmbassador;
  scanCount: number;
  clickCount: number;
  qrCode: QrCode | null;
};

export type AmbassadorAnalytics = {
  totalScans: number;
  totalClicks: number;
  totalCaptures: number;
  scansByDate: Array<{ date: string; count: number }>;
  scansByDevice: Array<{ deviceType: string; count: number }>;
  clicksByLink: Array<{ linkLabel: string; count: number }>;
  recentScans: Array<{ scannedAt: Date; deviceType: string }>;
  recentClicks: AmbassadorLinkClick[];
};

export type AmbassadorsDashboardStats = {
  totalAmbassadors: number;
  activeAmbassadors: number;
  totalScans: number;
  totalClicks: number;
  scansThisWeek: number;
};

type CreateAmbassadorInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  photoUrl?: string | null;
  bio?: string | null;
  territory?: string | null;
  status?: BrandAmbassador["status"];
  slug?: string;
  linkMode?: BrandAmbassador["linkMode"];
  customLinks?: AmbassadorHubLink[];
  hubOverrides?: AmbassadorHubOverrides;
};

type UpdateAmbassadorInput = Partial<CreateAmbassadorInput>;

async function ensureUniqueSlug(preferred: string): Promise<string> {
  const base = slugify(preferred).slice(0, 48) || "ambassador";
  let slug = base;
  let attempt = 0;

  while (attempt < 10) {
    const existing = await getAmbassadorBySlug(slug);
    if (!existing) return slug;
    slug = `${base.slice(0, 40)}-${attempt + 1}`;
    attempt++;
  }

  return `${base.slice(0, 32)}-${randomUUID().slice(0, 8)}`;
}

async function ensureUniqueSlugForUpdate(id: string, preferred: string): Promise<string> {
  const base = slugify(preferred).slice(0, 48);
  if (!base) return ensureUniqueSlug("ambassador");

  const existing = await getAmbassadorBySlug(base);
  if (!existing || existing.id === id) return base;
  return ensureUniqueSlug(base);
}

function buildHubConfigFromAmbassador(
  ambassador: BrandAmbassador,
  defaults: AmbassadorHubDefaults,
  resolved: ResolvedAmbassadorHub
) {
  return {
    hubTitle: resolved.hubTitle,
    hubBio: resolved.hubBio,
    hubImageUrl: resolved.hubImageUrl,
    links: resolved.links.map((link) => ({ label: link.label, url: link.url })),
  };
}

export async function getAmbassadorHubDefaults(): Promise<AmbassadorHubDefaults> {
  const stored = await getSiteSetting<Partial<AmbassadorHubDefaults>>(AMBASSADOR_HUB_DEFAULTS_KEY);
  if (!stored) return DEFAULT_AMBASSADOR_HUB;

  return {
    hubTitle: stored.hubTitle ?? DEFAULT_AMBASSADOR_HUB.hubTitle,
    hubBio: stored.hubBio ?? DEFAULT_AMBASSADOR_HUB.hubBio,
    links: stored.links?.length ? stored.links : DEFAULT_AMBASSADOR_HUB.links,
    hubImageUrl: stored.hubImageUrl,
  };
}

export async function updateAmbassadorHubDefaults(
  defaults: AmbassadorHubDefaults
): Promise<AmbassadorHubDefaults> {
  await upsertSiteSetting(AMBASSADOR_HUB_DEFAULTS_KEY, defaults);

  const ambassadors = await getAllAmbassadors();
  for (const ambassador of ambassadors) {
    await syncAmbassadorQrCode(ambassador.id);
  }

  return defaults;
}

export function resolveAmbassadorLinks(
  ambassador: BrandAmbassador,
  defaults: AmbassadorHubDefaults
): AmbassadorHubLink[] {
  const globalLinks = (defaults.links ?? []).filter((link) => link.enabled !== false);
  const customLinks = (ambassador.customLinks ?? []).filter((link) => link.enabled !== false);

  switch (ambassador.linkMode) {
    case "custom":
      return customLinks;
    case "merge":
      return [...globalLinks, ...customLinks];
    case "global":
    default:
      return globalLinks;
  }
}

export function resolveAmbassadorHub(
  ambassador: BrandAmbassador,
  defaults: AmbassadorHubDefaults
): ResolvedAmbassadorHub {
  const overrides = ambassador.hubOverrides ?? {};
  const name = ambassadorDisplayName(ambassador.firstName, ambassador.lastName);

  return {
    hubTitle: overrides.hubTitle ?? defaults.hubTitle ?? name,
    hubBio: overrides.hubBio ?? ambassador.bio ?? defaults.hubBio,
    hubImageUrl: overrides.hubImageUrl ?? ambassador.photoUrl ?? defaults.hubImageUrl,
    links: resolveAmbassadorLinks(ambassador, defaults),
  };
}

export async function getAllAmbassadors(): Promise<BrandAmbassador[]> {
  if (isMockDataMode()) {
    return [...mockStore.brandAmbassadors].sort(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
    );
  }

  return getDb().select().from(brandAmbassadors).orderBy(desc(brandAmbassadors.updatedAt));
}

export async function getAmbassadorById(id: string): Promise<BrandAmbassador | null> {
  if (isMockDataMode()) {
    return mockStore.brandAmbassadors.find((a) => a.id === id) ?? null;
  }

  const [row] = await getDb()
    .select()
    .from(brandAmbassadors)
    .where(eq(brandAmbassadors.id, id))
    .limit(1);
  return row ?? null;
}

export async function getAmbassadorBySlug(slug: string): Promise<BrandAmbassador | null> {
  if (isMockDataMode()) {
    return mockStore.brandAmbassadors.find((a) => a.slug === slug) ?? null;
  }

  const [row] = await getDb()
    .select()
    .from(brandAmbassadors)
    .where(eq(brandAmbassadors.slug, slug))
    .limit(1);
  return row ?? null;
}

export async function getAmbassadorByUserId(userId: string): Promise<BrandAmbassador | null> {
  if (isMockDataMode()) {
    return mockStore.brandAmbassadors.find((a) => a.userId === userId) ?? null;
  }

  const [row] = await getDb()
    .select()
    .from(brandAmbassadors)
    .where(eq(brandAmbassadors.userId, userId))
    .limit(1);
  return row ?? null;
}

export async function getAmbassadorWithQr(id: string): Promise<AmbassadorWithQr | null> {
  const ambassador = await getAmbassadorById(id);
  if (!ambassador) return null;

  const qrCode = await getQrCodeByAmbassadorId(id);
  return { ...ambassador, qrCode };
}

export async function syncAmbassadorQrCode(ambassadorId: string): Promise<QrCode | null> {
  const ambassador = await getAmbassadorById(ambassadorId);
  if (!ambassador) return null;

  const defaults = await getAmbassadorHubDefaults();
  const resolved = resolveAmbassadorHub(ambassador, defaults);
  const destinationConfig = buildHubConfigFromAmbassador(ambassador, defaults, resolved);

  const existing = await getQrCodeByAmbassadorId(ambassadorId);
  if (existing) {
    return updateQrCode(existing.id, {
      title: `${ambassadorDisplayName(ambassador.firstName, ambassador.lastName)} QR`,
      status: ambassador.status === "published" ? "published" : existing.status,
      destinationType: "link_hub",
      destinationConfig,
    });
  }

  return null;
}

export async function createAmbassadorQrCode(ambassador: BrandAmbassador): Promise<QrCode> {
  const existing = await getQrCodeByAmbassadorId(ambassador.id);
  if (existing) return existing;

  const defaults = await getAmbassadorHubDefaults();
  const resolved = resolveAmbassadorHub(ambassador, defaults);
  const destinationConfig = buildHubConfigFromAmbassador(ambassador, defaults, resolved);

  return createQrCode({
    title: `${ambassadorDisplayName(ambassador.firstName, ambassador.lastName)} QR`,
    code: ambassador.slug.slice(0, 24),
    status: ambassador.status === "published" ? "published" : "draft",
    ambassadorId: ambassador.id,
    destinationType: "link_hub",
    destinationConfig,
  });
}

export async function createAmbassador(data: CreateAmbassadorInput): Promise<BrandAmbassador> {
  const slug = await ensureUniqueSlug(
    data.slug ?? `${data.firstName}-${data.lastName}`
  );
  const timestamp = now();

  if (isMockDataMode()) {
    const row: BrandAmbassador = {
      id: randomUUID(),
      slug,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email.toLowerCase(),
      phone: data.phone ?? null,
      photoUrl: data.photoUrl ?? null,
      bio: data.bio ?? null,
      territory: data.territory ?? null,
      status: data.status ?? "draft",
      userId: null,
      linkMode: data.linkMode ?? "global",
      customLinks: data.customLinks ?? [],
      hubOverrides: data.hubOverrides ?? {},
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    mockStore.brandAmbassadors.push(row);
    await createAmbassadorQrCode(row);
    return row;
  }

  const [row] = await getDb()
    .insert(brandAmbassadors)
    .values({
      slug,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email.toLowerCase(),
      phone: data.phone ?? null,
      photoUrl: data.photoUrl ?? null,
      bio: data.bio ?? null,
      territory: data.territory ?? null,
      status: data.status ?? "draft",
      linkMode: data.linkMode ?? "global",
      customLinks: data.customLinks ?? [],
      hubOverrides: data.hubOverrides ?? {},
    })
    .returning();

  await createAmbassadorQrCode(row);
  return row;
}

export async function updateAmbassador(
  id: string,
  data: UpdateAmbassadorInput
): Promise<BrandAmbassador | null> {
  if (isMockDataMode()) {
    const index = mockStore.brandAmbassadors.findIndex((a) => a.id === id);
    if (index === -1) return null;

    const current = mockStore.brandAmbassadors[index];
    const updated: BrandAmbassador = {
      ...current,
      ...data,
      email: data.email ? data.email.toLowerCase() : current.email,
      slug: data.slug ? await ensureUniqueSlugForUpdate(id, data.slug) : current.slug,
      customLinks: data.customLinks ?? current.customLinks,
      hubOverrides: data.hubOverrides ?? current.hubOverrides,
      updatedAt: now(),
    };
    mockStore.brandAmbassadors[index] = updated;
    await syncAmbassadorQrCode(id);
    return updated;
  }

  const updates: Record<string, unknown> = { updatedAt: now() };
  if (data.firstName !== undefined) updates.firstName = data.firstName;
  if (data.lastName !== undefined) updates.lastName = data.lastName;
  if (data.email !== undefined) updates.email = data.email.toLowerCase();
  if (data.phone !== undefined) updates.phone = data.phone;
  if (data.photoUrl !== undefined) updates.photoUrl = data.photoUrl;
  if (data.bio !== undefined) updates.bio = data.bio;
  if (data.territory !== undefined) updates.territory = data.territory;
  if (data.status !== undefined) updates.status = data.status;
  if (data.linkMode !== undefined) updates.linkMode = data.linkMode;
  if (data.customLinks !== undefined) updates.customLinks = data.customLinks;
  if (data.hubOverrides !== undefined) updates.hubOverrides = data.hubOverrides;
  if (data.slug !== undefined) {
    updates.slug = await ensureUniqueSlugForUpdate(id, data.slug);
  }

  const [row] = await getDb()
    .update(brandAmbassadors)
    .set(updates)
    .where(eq(brandAmbassadors.id, id))
    .returning();

  if (row) await syncAmbassadorQrCode(id);
  return row ?? null;
}

export async function setAmbassadorUserId(
  ambassadorId: string,
  userId: string | null
): Promise<BrandAmbassador | null> {
  if (isMockDataMode()) {
    const index = mockStore.brandAmbassadors.findIndex((a) => a.id === ambassadorId);
    if (index === -1) return null;
    mockStore.brandAmbassadors[index] = {
      ...mockStore.brandAmbassadors[index],
      userId,
      updatedAt: now(),
    };
    return mockStore.brandAmbassadors[index];
  }

  const [row] = await getDb()
    .update(brandAmbassadors)
    .set({ userId, updatedAt: now() })
    .where(eq(brandAmbassadors.id, ambassadorId))
    .returning();

  return row ?? null;
}

export async function deleteAmbassador(id: string): Promise<boolean> {
  if (isMockDataMode()) {
    const index = mockStore.brandAmbassadors.findIndex((a) => a.id === id);
    if (index === -1) return false;
    mockStore.brandAmbassadors.splice(index, 1);
    mockStore.ambassadorLinkClicks = mockStore.ambassadorLinkClicks.filter(
      (click) => click.ambassadorId !== id
    );
    mockStore.qrCodes = mockStore.qrCodes.filter((qr) => qr.ambassadorId !== id);
    return true;
  }

  await getDb().delete(brandAmbassadors).where(eq(brandAmbassadors.id, id));
  return true;
}

export async function logAmbassadorLinkClick(input: {
  ambassadorId: string;
  linkLabel: string;
  linkUrl: string;
  userAgent?: string | null;
  referrer?: string | null;
}): Promise<void> {
  const deviceType = parseDeviceType(input.userAgent);

  if (isMockDataMode()) {
    mockStore.ambassadorLinkClicks.push({
      id: randomUUID(),
      ambassadorId: input.ambassadorId,
      linkLabel: input.linkLabel,
      linkUrl: input.linkUrl,
      clickedAt: now(),
      userAgent: input.userAgent ?? null,
      referrer: input.referrer ?? null,
      deviceType,
    });
    return;
  }

  await getDb().insert(ambassadorLinkClicks).values({
    ambassadorId: input.ambassadorId,
    linkLabel: input.linkLabel,
    linkUrl: input.linkUrl,
    userAgent: input.userAgent ?? null,
    referrer: input.referrer ?? null,
    deviceType,
  });
}

export async function logAmbassadorVisit(
  ambassador: BrandAmbassador,
  input: {
    userAgent?: string | null;
    referrer?: string | null;
    utmSource?: string | null;
    utmMedium?: string | null;
    utmCampaign?: string | null;
  }
): Promise<void> {
  const qrCode = await getQrCodeByAmbassadorId(ambassador.id);
  if (!qrCode) return;

  await logQrScan(qrCode.id, {
    userAgent: input.userAgent,
    referrer: input.referrer,
    utmSource: input.utmSource ?? "ambassador",
    utmMedium: input.utmMedium ?? ambassador.slug,
    utmCampaign: input.utmCampaign ?? "hub",
  });
}

function getWeekAgo(): Date {
  const date = new Date();
  date.setDate(date.getDate() - 7);
  return date;
}

export async function getAmbassadorScanCount(ambassadorId: string): Promise<number> {
  const qrCode = await getQrCodeByAmbassadorId(ambassadorId);
  if (!qrCode) return 0;

  if (isMockDataMode()) {
    return mockStore.qrScans.filter((scan) => scan.qrCodeId === qrCode.id).length;
  }

  const [row] = await getDb()
    .select({ count: sql<number>`count(*)::int` })
    .from(qrScans)
    .where(eq(qrScans.qrCodeId, qrCode.id));
  return row?.count ?? 0;
}

export async function getAmbassadorClickCount(ambassadorId: string): Promise<number> {
  if (isMockDataMode()) {
    return mockStore.ambassadorLinkClicks.filter((click) => click.ambassadorId === ambassadorId)
      .length;
  }

  const [row] = await getDb()
    .select({ count: sql<number>`count(*)::int` })
    .from(ambassadorLinkClicks)
    .where(eq(ambassadorLinkClicks.ambassadorId, ambassadorId));
  return row?.count ?? 0;
}

export async function getAmbassadorLeaderboard(): Promise<AmbassadorLeaderboardEntry[]> {
  const ambassadors = await getAllAmbassadors();
  const entries = await Promise.all(
    ambassadors.map(async (ambassador) => ({
      ambassador,
      scanCount: await getAmbassadorScanCount(ambassador.id),
      clickCount: await getAmbassadorClickCount(ambassador.id),
      qrCode: await getQrCodeByAmbassadorId(ambassador.id),
    }))
  );

  return entries.sort((a, b) => b.scanCount + b.clickCount - (a.scanCount + a.clickCount));
}

export async function getAmbassadorsDashboardStats(): Promise<AmbassadorsDashboardStats> {
  const ambassadors = await getAllAmbassadors();
  const activeAmbassadors = ambassadors.filter((a) => a.status === "published").length;
  const weekAgo = getWeekAgo();

  let totalScans = 0;
  let totalClicks = 0;
  let scansThisWeek = 0;

  for (const ambassador of ambassadors) {
    const qrCode = await getQrCodeByAmbassadorId(ambassador.id);
    if (!qrCode) continue;

    if (isMockDataMode()) {
      const scans = mockStore.qrScans.filter((scan) => scan.qrCodeId === qrCode.id);
      totalScans += scans.length;
      scansThisWeek += scans.filter((scan) => scan.scannedAt >= weekAgo).length;
    } else {
      const [scanRow] = await getDb()
        .select({ count: sql<number>`count(*)::int` })
        .from(qrScans)
        .where(eq(qrScans.qrCodeId, qrCode.id));
      totalScans += scanRow?.count ?? 0;

      const [weekRow] = await getDb()
        .select({ count: sql<number>`count(*)::int` })
        .from(qrScans)
        .where(and(eq(qrScans.qrCodeId, qrCode.id), gte(qrScans.scannedAt, weekAgo)));
      scansThisWeek += weekRow?.count ?? 0;
    }

    totalClicks += await getAmbassadorClickCount(ambassador.id);
  }

  return {
    totalAmbassadors: ambassadors.length,
    activeAmbassadors,
    totalScans,
    totalClicks,
    scansThisWeek,
  };
}

export async function getAmbassadorAnalytics(ambassadorId: string): Promise<AmbassadorAnalytics> {
  const qrCode = await getQrCodeByAmbassadorId(ambassadorId);
  const ambassador = await getAmbassadorById(ambassadorId);

  if (!qrCode || !ambassador) {
    return {
      totalScans: 0,
      totalClicks: 0,
      totalCaptures: 0,
      scansByDate: [],
      scansByDevice: [],
      clicksByLink: [],
      recentScans: [],
      recentClicks: [],
    };
  }

  if (isMockDataMode()) {
    const scans = mockStore.qrScans
      .filter((scan) => scan.qrCodeId === qrCode.id)
      .sort((a, b) => b.scannedAt.getTime() - a.scannedAt.getTime());
    const clicks = mockStore.ambassadorLinkClicks
      .filter((click) => click.ambassadorId === ambassadorId)
      .sort((a, b) => b.clickedAt.getTime() - a.clickedAt.getTime());
    const captureCount = mockStore.captures.filter(
      (capture) => capture.utmMedium === ambassador.slug && capture.utmSource === "ambassador"
    ).length;

    const dateCounts = new Map<string, number>();
    const deviceCounts = new Map<string, number>();
    const linkCounts = new Map<string, number>();

    for (const scan of scans) {
      const date = scan.scannedAt.toISOString().slice(0, 10);
      dateCounts.set(date, (dateCounts.get(date) ?? 0) + 1);
      deviceCounts.set(scan.deviceType, (deviceCounts.get(scan.deviceType) ?? 0) + 1);
    }

    for (const click of clicks) {
      linkCounts.set(click.linkLabel, (linkCounts.get(click.linkLabel) ?? 0) + 1);
    }

    return {
      totalScans: scans.length,
      totalClicks: clicks.length,
      totalCaptures: captureCount,
      scansByDate: Array.from(dateCounts.entries()).map(([date, count]) => ({ date, count })),
      scansByDevice: Array.from(deviceCounts.entries()).map(([deviceType, count]) => ({
        deviceType,
        count,
      })),
      clicksByLink: Array.from(linkCounts.entries()).map(([linkLabel, count]) => ({
        linkLabel,
        count,
      })),
      recentScans: scans.slice(0, 10).map((scan) => ({
        scannedAt: scan.scannedAt,
        deviceType: scan.deviceType,
      })),
      recentClicks: clicks.slice(0, 10),
    };
  }

  const scans = await getDb()
    .select()
    .from(qrScans)
    .where(eq(qrScans.qrCodeId, qrCode.id))
    .orderBy(desc(qrScans.scannedAt));

  const clicks = await getDb()
    .select()
    .from(ambassadorLinkClicks)
    .where(eq(ambassadorLinkClicks.ambassadorId, ambassadorId))
    .orderBy(desc(ambassadorLinkClicks.clickedAt));

  const [captureRow] = await getDb()
    .select({ count: sql<number>`count(*)::int` })
    .from(captures)
    .where(
      and(eq(captures.utmSource, "ambassador"), eq(captures.utmMedium, ambassador.slug))
    );

  const dateCounts = new Map<string, number>();
  const deviceCounts = new Map<string, number>();
  const linkCounts = new Map<string, number>();

  for (const scan of scans) {
    const date = scan.scannedAt.toISOString().slice(0, 10);
    dateCounts.set(date, (dateCounts.get(date) ?? 0) + 1);
    deviceCounts.set(scan.deviceType, (deviceCounts.get(scan.deviceType) ?? 0) + 1);
  }

  for (const click of clicks) {
    linkCounts.set(click.linkLabel, (linkCounts.get(click.linkLabel) ?? 0) + 1);
  }

  return {
    totalScans: scans.length,
    totalClicks: clicks.length,
    totalCaptures: captureRow?.count ?? 0,
    scansByDate: Array.from(dateCounts.entries()).map(([date, count]) => ({ date, count })),
    scansByDevice: Array.from(deviceCounts.entries()).map(([deviceType, count]) => ({
      deviceType,
      count,
    })),
    clicksByLink: Array.from(linkCounts.entries()).map(([linkLabel, count]) => ({
      linkLabel,
      count,
    })),
    recentScans: scans.slice(0, 10).map((scan) => ({
      scannedAt: scan.scannedAt,
      deviceType: scan.deviceType,
    })),
    recentClicks: clicks.slice(0, 10),
  };
}

export async function exportAmbassadorAnalyticsCsv(ambassadorId: string): Promise<string> {
  const ambassador = await getAmbassadorById(ambassadorId);
  const analytics = await getAmbassadorAnalytics(ambassadorId);
  if (!ambassador) return "";

  const headers = ["Metric", "Value"];
  const rows: Array<Array<string>> = [
    ["Ambassador", ambassadorDisplayName(ambassador.firstName, ambassador.lastName)],
    ["Slug", ambassador.slug],
    ["Total Scans", String(analytics.totalScans)],
    ["Total Clicks", String(analytics.totalClicks)],
    ["Attributed Captures", String(analytics.totalCaptures)],
    [],
    ["Link", "Clicks"],
    ...analytics.clicksByLink.map((row) => [row.linkLabel, String(row.count)]),
  ];

  return buildCsv(headers, rows);
}
