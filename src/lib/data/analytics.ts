import { randomUUID } from "crypto";
import { desc } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { mockStore } from "@/lib/mock/store";
import { pageViews, type PageView } from "@/lib/db/schema";
import {
  parseBrowserMetadata,
  parseDeviceType,
} from "@/lib/rewards/constants";
import { getDashboardStats } from "./captures";
import { isMockDataMode, now } from "./shared";

export type LogPageViewInput = {
  path: string;
  userAgent?: string | null;
  referrer?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  sessionId?: string | null;
};

export type SiteAnalytics = {
  totalPageViews: number;
  uniqueSessions: number;
  viewsByPath: Array<{ path: string; count: number }>;
  viewsByDevice: Array<{ deviceType: string; count: number }>;
  viewsByDate: Array<{ date: string; count: number }>;
  viewsByReferrer: Array<{ referrer: string; count: number }>;
  viewsByUtmSource: Array<{ utmSource: string; count: number }>;
  recentViews: PageView[];
  activity: {
    qrScans: number;
    captures: number;
    subscribers: number;
    landingEntries: number;
    surveyResponses: number;
  };
};

function normalizePath(path: string): string {
  const trimmed = path.trim();
  if (!trimmed) return "/";
  try {
    // Allow absolute URLs from clients; store pathname only.
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return new URL(trimmed).pathname || "/";
    }
  } catch {
    // fall through
  }
  const withoutQuery = trimmed.split("?")[0]?.split("#")[0] || "/";
  return withoutQuery.startsWith("/") ? withoutQuery : `/${withoutQuery}`;
}

export async function logPageView(input: LogPageViewInput): Promise<PageView> {
  const path = normalizePath(input.path);
  const deviceType = parseDeviceType(input.userAgent);
  const metadata = parseBrowserMetadata(input.userAgent);

  if (isMockDataMode()) {
    const row: PageView = {
      id: randomUUID(),
      path,
      viewedAt: now(),
      userAgent: input.userAgent ?? null,
      referrer: input.referrer ?? null,
      deviceType,
      utmSource: input.utmSource ?? null,
      utmMedium: input.utmMedium ?? null,
      utmCampaign: input.utmCampaign ?? null,
      sessionId: input.sessionId ?? null,
      metadata: Object.keys(metadata).length > 0 ? metadata : null,
    };
    mockStore.pageViews.push(row);
    return row;
  }

  const [row] = await getDb()
    .insert(pageViews)
    .values({
      path,
      userAgent: input.userAgent ?? null,
      referrer: input.referrer ?? null,
      deviceType,
      utmSource: input.utmSource ?? null,
      utmMedium: input.utmMedium ?? null,
      utmCampaign: input.utmCampaign ?? null,
      sessionId: input.sessionId ?? null,
      metadata: Object.keys(metadata).length > 0 ? metadata : null,
    })
    .returning();

  return row;
}

export async function getRecentPageViews(limit = 50): Promise<PageView[]> {
  if (isMockDataMode()) {
    return [...mockStore.pageViews]
      .sort((a, b) => b.viewedAt.getTime() - a.viewedAt.getTime())
      .slice(0, limit);
  }

  return getDb()
    .select()
    .from(pageViews)
    .orderBy(desc(pageViews.viewedAt))
    .limit(limit);
}

export async function getAllPageViews(): Promise<PageView[]> {
  if (isMockDataMode()) {
    return [...mockStore.pageViews].sort(
      (a, b) => b.viewedAt.getTime() - a.viewedAt.getTime()
    );
  }

  return getDb().select().from(pageViews).orderBy(desc(pageViews.viewedAt));
}

function countBy<T>(
  items: T[],
  keyFn: (item: T) => string,
  emptyLabel = "(none)"
): Array<{ key: string; count: number }> {
  const counts = new Map<string, number>();
  for (const item of items) {
    const key = keyFn(item) || emptyLabel;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
}

export async function getSiteAnalytics(): Promise<SiteAnalytics> {
  const [views, dashboard] = await Promise.all([
    getAllPageViews(),
    getDashboardStats(),
  ]);

  const sessions = new Set(
    views.map((v) => v.sessionId).filter((id): id is string => Boolean(id))
  );

  const pathCounts = countBy(views, (v) => v.path);
  const deviceCounts = countBy(views, (v) => v.deviceType);
  const dateCounts = countBy(views, (v) => v.viewedAt.toISOString().slice(0, 10));
  const referrerCounts = countBy(
    views,
    (v) => {
      if (!v.referrer) return "(direct)";
      try {
        return new URL(v.referrer).hostname || v.referrer;
      } catch {
        return v.referrer;
      }
    },
    "(direct)"
  );
  const utmCounts = countBy(views, (v) => v.utmSource ?? "(none)");

  return {
    totalPageViews: views.length,
    uniqueSessions: sessions.size,
    viewsByPath: pathCounts.map(({ key, count }) => ({ path: key, count })),
    viewsByDevice: deviceCounts.map(({ key, count }) => ({
      deviceType: key,
      count,
    })),
    viewsByDate: dateCounts
      .map(({ key, count }) => ({ date: key, count }))
      .sort((a, b) => a.date.localeCompare(b.date)),
    viewsByReferrer: referrerCounts
      .map(({ key, count }) => ({ referrer: key, count }))
      .slice(0, 20),
    viewsByUtmSource: utmCounts.map(({ key, count }) => ({
      utmSource: key,
      count,
    })),
    recentViews: views.slice(0, 50),
    activity: {
      qrScans: dashboard.qrScans,
      captures: dashboard.captures,
      subscribers: dashboard.subscribers,
      landingEntries: dashboard.landingEntries,
      surveyResponses: dashboard.surveyResponses,
    },
  };
}
