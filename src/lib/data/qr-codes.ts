import { randomUUID } from "crypto";
import { eq, desc, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { mockStore } from "@/lib/mock/store";
import {
  qrCodes,
  qrScans,
  rewardClaims,
  type QrCode,
  type QrDestinationConfig,
  type QrScan,
  type RewardClaim,
} from "@/lib/db/schema";
import { buildCsv } from "@/lib/csv";
import {
  generateShortCode,
  generateRewardCode,
  parseBrowserMetadata,
  parseDeviceType,
} from "@/lib/rewards/constants";
import { isMockDataMode, mockQrCodes, now } from "./shared";

type CreateQrCodeInput = {
  title: string;
  code?: string;
  status?: QrCode["status"];
  productId?: string | null;
  ambassadorId?: string | null;
  destinationType: QrCode["destinationType"];
  destinationConfig?: QrDestinationConfig;
};

type UpdateQrCodeInput = Partial<CreateQrCodeInput>;

export type QrScanLogInput = {
  userAgent?: string | null;
  referrer?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
};

export type QrAnalytics = {
  totalScans: number;
  totalClaims: number;
  scansByDate: Array<{ date: string; count: number }>;
  scansByDevice: Array<{ deviceType: string; count: number }>;
  scansByUtmCampaign: Array<{ utmCampaign: string; count: number }>;
  recentScans: QrScan[];
  recentClaims: RewardClaim[];
};

async function ensureUniqueCode(preferred?: string): Promise<string> {
  const base = preferred?.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 32) || generateShortCode();
  let code = base;
  let attempt = 0;

  while (attempt < 10) {
    const existing = await getQrCodeByCode(code);
    if (!existing) return code;
    code = `${base.slice(0, 24)}${generateShortCode(4)}`;
    attempt++;
  }

  return generateShortCode(8);
}

async function ensureUniqueCodeForUpdate(id: string, preferred: string): Promise<string> {
  const base = preferred.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 32);
  if (!base) return ensureUniqueCode();

  const existing = await getQrCodeByCode(base);
  if (!existing || existing.id === id) return base;
  return ensureUniqueCode(base);
}

export async function getAllQrCodes(): Promise<QrCode[]> {
  if (isMockDataMode()) {
    return [...mockQrCodes()].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  return getDb().select().from(qrCodes).orderBy(desc(qrCodes.updatedAt));
}

export async function getQrCodeById(id: string): Promise<QrCode | null> {
  if (isMockDataMode()) {
    return mockQrCodes().find((q) => q.id === id) ?? null;
  }

  const [row] = await getDb().select().from(qrCodes).where(eq(qrCodes.id, id)).limit(1);
  return row ?? null;
}

export async function getQrCodeByCode(code: string): Promise<QrCode | null> {
  if (isMockDataMode()) {
    return mockQrCodes().find((q) => q.code === code) ?? null;
  }

  const [row] = await getDb().select().from(qrCodes).where(eq(qrCodes.code, code)).limit(1);
  return row ?? null;
}

export async function getQrCodeByProductId(productId: string): Promise<QrCode | null> {
  if (isMockDataMode()) {
    return mockQrCodes().find((q) => q.productId === productId) ?? null;
  }

  const [row] = await getDb().select().from(qrCodes).where(eq(qrCodes.productId, productId)).limit(1);
  return row ?? null;
}

export async function getQrCodeByAmbassadorId(ambassadorId: string): Promise<QrCode | null> {
  if (isMockDataMode()) {
    return mockQrCodes().find((q) => q.ambassadorId === ambassadorId) ?? null;
  }

  const [row] = await getDb()
    .select()
    .from(qrCodes)
    .where(eq(qrCodes.ambassadorId, ambassadorId))
    .limit(1);
  return row ?? null;
}

export async function getQrScanCounts(): Promise<Array<{ qrCodeId: string; count: number }>> {
  if (isMockDataMode()) {
    const counts = new Map<string, number>();
    for (const scan of mockStore.qrScans) {
      counts.set(scan.qrCodeId, (counts.get(scan.qrCodeId) ?? 0) + 1);
    }
    return Array.from(counts.entries()).map(([qrCodeId, count]) => ({ qrCodeId, count }));
  }

  return getDb()
    .select({
      qrCodeId: qrScans.qrCodeId,
      count: sql<number>`count(*)::int`,
    })
    .from(qrScans)
    .groupBy(qrScans.qrCodeId);
}

export async function createQrCode(data: CreateQrCodeInput): Promise<QrCode> {
  const code = await ensureUniqueCode(data.code);
  const timestamp = now();

  if (isMockDataMode()) {
    const row: QrCode = {
      id: randomUUID(),
      code,
      title: data.title,
      status: data.status ?? "draft",
      productId: data.productId ?? null,
      ambassadorId: data.ambassadorId ?? null,
      destinationType: data.destinationType,
      destinationConfig: data.destinationConfig ?? {},
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    mockStore.qrCodes.push(row);
    return row;
  }

  const [row] = await getDb()
    .insert(qrCodes)
    .values({
      code,
      title: data.title,
      status: data.status ?? "draft",
      productId: data.productId ?? null,
      ambassadorId: data.ambassadorId ?? null,
      destinationType: data.destinationType,
      destinationConfig: data.destinationConfig ?? {},
    })
    .returning();

  return row;
}

export async function createProductQrCode(
  productId: string,
  productName: string,
  productSlug?: string
): Promise<QrCode> {
  const existing = await getQrCodeByProductId(productId);
  if (existing) return existing;

  return createQrCode({
    title: `${productName} QR`,
    code: productSlug ? productSlug.slice(0, 24) : undefined,
    status: "published",
    productId,
    destinationType: "product_page",
    destinationConfig: {},
  });
}

export async function updateQrCode(id: string, data: UpdateQrCodeInput): Promise<QrCode | null> {
  if (isMockDataMode()) {
    const index = mockStore.qrCodes.findIndex((q) => q.id === id);
    if (index === -1) return null;

    const current = mockStore.qrCodes[index];
    const updated: QrCode = {
      ...current,
      ...data,
      code: data.code ? await ensureUniqueCodeForUpdate(id, data.code) : current.code,
      destinationConfig: data.destinationConfig ?? current.destinationConfig,
      productId: data.productId !== undefined ? data.productId : current.productId,
      ambassadorId: data.ambassadorId !== undefined ? data.ambassadorId : current.ambassadorId,
      updatedAt: now(),
    };
    mockStore.qrCodes[index] = updated;
    return updated;
  }

  const updates: Record<string, unknown> = { updatedAt: now() };
  if (data.title !== undefined) updates.title = data.title;
  if (data.status !== undefined) updates.status = data.status;
  if (data.productId !== undefined) updates.productId = data.productId;
  if (data.ambassadorId !== undefined) updates.ambassadorId = data.ambassadorId;
  if (data.destinationType !== undefined) updates.destinationType = data.destinationType;
  if (data.destinationConfig !== undefined) updates.destinationConfig = data.destinationConfig;
  if (data.code !== undefined) updates.code = await ensureUniqueCodeForUpdate(id, data.code);

  const [row] = await getDb().update(qrCodes).set(updates).where(eq(qrCodes.id, id)).returning();
  return row ?? null;
}

export async function deleteQrCode(id: string): Promise<boolean> {
  if (isMockDataMode()) {
    const index = mockStore.qrCodes.findIndex((q) => q.id === id);
    if (index === -1) return false;
    mockStore.qrCodes.splice(index, 1);
    mockStore.qrScans = mockStore.qrScans.filter((s) => s.qrCodeId !== id);
    mockStore.rewardClaims = mockStore.rewardClaims.filter((c) => c.qrCodeId !== id);
    return true;
  }

  const result = await getDb().delete(qrCodes).where(eq(qrCodes.id, id));
  return (result.rowCount ?? 0) > 0;
}

export async function logQrScan(qrCodeId: string, input: QrScanLogInput): Promise<QrScan> {
  const deviceType = parseDeviceType(input.userAgent);
  const metadata = parseBrowserMetadata(input.userAgent);
  const scannedAt = now();

  if (isMockDataMode()) {
    const row: QrScan = {
      id: randomUUID(),
      qrCodeId,
      scannedAt,
      userAgent: input.userAgent ?? null,
      referrer: input.referrer ?? null,
      deviceType,
      utmSource: input.utmSource ?? null,
      utmMedium: input.utmMedium ?? null,
      utmCampaign: input.utmCampaign ?? null,
      metadata: Object.keys(metadata).length ? metadata : null,
    };
    mockStore.qrScans.push(row);
    return row;
  }

  const [row] = await getDb()
    .insert(qrScans)
    .values({
      qrCodeId,
      userAgent: input.userAgent ?? null,
      referrer: input.referrer ?? null,
      deviceType,
      utmSource: input.utmSource ?? null,
      utmMedium: input.utmMedium ?? null,
      utmCampaign: input.utmCampaign ?? null,
      metadata: Object.keys(metadata).length ? metadata : null,
    })
    .returning();

  return row;
}

export async function getQrScans(qrCodeId: string): Promise<QrScan[]> {
  if (isMockDataMode()) {
    return mockStore.qrScans
      .filter((s) => s.qrCodeId === qrCodeId)
      .sort((a, b) => b.scannedAt.getTime() - a.scannedAt.getTime());
  }

  return getDb()
    .select()
    .from(qrScans)
    .where(eq(qrScans.qrCodeId, qrCodeId))
    .orderBy(desc(qrScans.scannedAt));
}

export async function getRewardClaims(qrCodeId: string): Promise<RewardClaim[]> {
  if (isMockDataMode()) {
    return mockStore.rewardClaims
      .filter((c) => c.qrCodeId === qrCodeId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  return getDb()
    .select()
    .from(rewardClaims)
    .where(eq(rewardClaims.qrCodeId, qrCodeId))
    .orderBy(desc(rewardClaims.createdAt));
}

export async function createRewardClaim(data: {
  qrCodeId: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  formData?: Record<string, string> | null;
  rewardCode?: string | null;
}): Promise<RewardClaim> {
  if (isMockDataMode()) {
    const row: RewardClaim = {
      id: randomUUID(),
      qrCodeId: data.qrCodeId,
      email: data.email,
      firstName: data.firstName ?? null,
      lastName: data.lastName ?? null,
      formData: data.formData ?? null,
      rewardCode: data.rewardCode ?? null,
      createdAt: now(),
    };
    mockStore.rewardClaims.push(row);
    return row;
  }

  const [row] = await getDb()
    .insert(rewardClaims)
    .values({
      qrCodeId: data.qrCodeId,
      email: data.email,
      firstName: data.firstName ?? null,
      lastName: data.lastName ?? null,
      formData: data.formData ?? null,
      rewardCode: data.rewardCode ?? null,
    })
    .returning();

  return row;
}

export async function getQrAnalytics(qrCodeId: string): Promise<QrAnalytics> {
  const scans = await getQrScans(qrCodeId);
  const claims = await getRewardClaims(qrCodeId);

  const dateCounts = new Map<string, number>();
  const deviceCounts = new Map<string, number>();
  const campaignCounts = new Map<string, number>();

  for (const scan of scans) {
    const dateKey = scan.scannedAt.toISOString().slice(0, 10);
    dateCounts.set(dateKey, (dateCounts.get(dateKey) ?? 0) + 1);
    deviceCounts.set(scan.deviceType, (deviceCounts.get(scan.deviceType) ?? 0) + 1);
    const campaign = scan.utmCampaign ?? "(none)";
    campaignCounts.set(campaign, (campaignCounts.get(campaign) ?? 0) + 1);
  }

  return {
    totalScans: scans.length,
    totalClaims: claims.length,
    scansByDate: Array.from(dateCounts.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date)),
    scansByDevice: Array.from(deviceCounts.entries()).map(([deviceType, count]) => ({
      deviceType,
      count,
    })),
    scansByUtmCampaign: Array.from(campaignCounts.entries()).map(([utmCampaign, count]) => ({
      utmCampaign,
      count,
    })),
    recentScans: scans.slice(0, 50),
    recentClaims: claims.slice(0, 50),
  };
}

export async function exportQrScansCsv(qrCodeId: string): Promise<string> {
  const scans = await getQrScans(qrCodeId);
  return buildCsv(
    ["Scanned At", "Device", "Referrer", "UTM Source", "UTM Medium", "UTM Campaign", "User Agent"],
    scans.map((s) => [
      s.scannedAt.toISOString(),
      s.deviceType,
      s.referrer ?? "",
      s.utmSource ?? "",
      s.utmMedium ?? "",
      s.utmCampaign ?? "",
      s.userAgent ?? "",
    ])
  );
}

export async function exportRewardClaimsCsv(qrCodeId: string): Promise<string> {
  const claims = await getRewardClaims(qrCodeId);
  return buildCsv(
    ["Email", "First Name", "Last Name", "Reward Code", "Submitted At"],
    claims.map((c) => [
      c.email,
      c.firstName ?? "",
      c.lastName ?? "",
      c.rewardCode ?? "",
      c.createdAt.toISOString(),
    ])
  );
}

export async function backfillProductQrCodes(
  products: Array<{ id: string; name: string; slug: string }>
): Promise<number> {
  let created = 0;
  for (const product of products) {
    const existing = await getQrCodeByProductId(product.id);
    if (!existing) {
      await createProductQrCode(product.id, product.name, product.slug);
      created++;
    }
  }
  return created;
}

export async function getTotalQrScans(): Promise<number> {
  if (isMockDataMode()) return mockStore.qrScans.length;

  const [row] = await getDb().select({ count: sql<number>`count(*)::int` }).from(qrScans);
  return row.count;
}

export async function getRecentRewardClaims(limit = 5): Promise<RewardClaim[]> {
  if (isMockDataMode()) {
    return [...mockStore.rewardClaims]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  return getDb().select().from(rewardClaims).orderBy(desc(rewardClaims.createdAt)).limit(limit);
}

export async function getStandaloneQrCodes(): Promise<QrCode[]> {
  const all = await getAllQrCodes();
  return all.filter((q) => !q.productId && !q.ambassadorId);
}

export type QrScanWithMeta = QrScan & {
  qrTitle: string;
  qrCode: string;
  isProductQr: boolean;
};

export async function getRecentQrScansWithMeta(limit = 10): Promise<QrScanWithMeta[]> {
  if (isMockDataMode()) {
    const codeById = new Map(mockQrCodes().map((q) => [q.id, q]));
    return [...mockStore.qrScans]
      .sort((a, b) => b.scannedAt.getTime() - a.scannedAt.getTime())
      .slice(0, limit)
      .map((scan) => {
        const qr = codeById.get(scan.qrCodeId);
        return {
          ...scan,
          qrTitle: qr?.title ?? "Unknown",
          qrCode: qr?.code ?? "",
          isProductQr: Boolean(qr?.productId),
        };
      });
  }

  const rows = await getDb()
    .select({
      scan: qrScans,
      qrTitle: qrCodes.title,
      qrCode: qrCodes.code,
      productId: qrCodes.productId,
    })
    .from(qrScans)
    .innerJoin(qrCodes, eq(qrScans.qrCodeId, qrCodes.id))
    .orderBy(desc(qrScans.scannedAt))
    .limit(limit);

  return rows.map((row) => ({
    ...row.scan,
    qrTitle: row.qrTitle,
    qrCode: row.qrCode,
    isProductQr: Boolean(row.productId),
  }));
}

export type RewardsDashboardStats = {
  totalScans: number;
  totalClaims: number;
  productQrCount: number;
  standaloneQrCount: number;
  scansByDevice: Array<{ deviceType: string; count: number }>;
};

export async function getTotalRewardClaims(): Promise<number> {
  if (isMockDataMode()) return mockStore.rewardClaims.length;

  const [row] = await getDb().select({ count: sql<number>`count(*)::int` }).from(rewardClaims);
  return row.count;
}

export async function getRewardsDashboardStats(): Promise<RewardsDashboardStats> {
  const [allQr, totalScans, totalClaims] = await Promise.all([
    getAllQrCodes(),
    getTotalQrScans(),
    getTotalRewardClaims(),
  ]);

  const deviceCounts = new Map<string, number>();
  if (isMockDataMode()) {
    for (const scan of mockStore.qrScans) {
      deviceCounts.set(scan.deviceType, (deviceCounts.get(scan.deviceType) ?? 0) + 1);
    }
  } else {
    const deviceRows = await getDb()
      .select({
        deviceType: qrScans.deviceType,
        count: sql<number>`count(*)::int`,
      })
      .from(qrScans)
      .groupBy(qrScans.deviceType);
    for (const row of deviceRows) {
      deviceCounts.set(row.deviceType, row.count);
    }
  }

  return {
    totalScans,
    totalClaims,
    productQrCount: allQr.filter((q) => q.productId).length,
    standaloneQrCount: allQr.filter((q) => !q.productId && !q.ambassadorId).length,
    scansByDevice: Array.from(deviceCounts.entries()).map(([deviceType, count]) => ({
      deviceType,
      count,
    })),
  };
}

export { generateRewardCode };
