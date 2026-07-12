import { randomUUID } from "crypto";
import { eq, desc, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { mockStore } from "@/lib/mock/store";
import {
  captures,
  subscribers,
  landingPageEntries,
  surveyResponses,
  type Capture,
} from "@/lib/db/schema";
import { buildCsv } from "@/lib/csv";
import { CAPTURES_LIST_LIMIT, DASHBOARD_RECENT_LIMIT } from "@/lib/constants";
import { isMockDataMode, now } from "./shared";
import { getTotalQrScans, getRecentRewardClaims } from "./qr-codes";

export async function getAllCaptures(limit = CAPTURES_LIST_LIMIT): Promise<Capture[]> {
  if (isMockDataMode()) {
    return [...mockStore.captures]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  return getDb()
    .select()
    .from(captures)
    .orderBy(desc(captures.createdAt))
    .limit(limit);
}

export async function getRecentCaptures(limit = DASHBOARD_RECENT_LIMIT): Promise<Capture[]> {
  return getAllCaptures(limit);
}

export async function createCapture(
  data: Pick<Capture, "email" | "sourceType" | "consentMarketing"> &
    Partial<Omit<Capture, "id" | "createdAt" | "email" | "sourceType" | "consentMarketing">>
): Promise<Capture> {
  if (isMockDataMode()) {
    const capture: Capture = {
      id: randomUUID(),
      sourceId: data.sourceId ?? null,
      firstName: data.firstName ?? null,
      lastName: data.lastName ?? null,
      utmSource: data.utmSource ?? null,
      utmMedium: data.utmMedium ?? null,
      utmCampaign: data.utmCampaign ?? null,
      metadata: data.metadata ?? null,
      sourceType: data.sourceType,
      email: data.email.toLowerCase(),
      consentMarketing: data.consentMarketing,
      createdAt: now(),
    };
    mockStore.captures.push(capture);
    return capture;
  }

  const [capture] = await getDb()
    .insert(captures)
    .values({
      sourceType: data.sourceType,
      sourceId: data.sourceId ?? null,
      email: data.email.toLowerCase(),
      firstName: data.firstName ?? null,
      lastName: data.lastName ?? null,
      consentMarketing: data.consentMarketing,
      utmSource: data.utmSource ?? null,
      utmMedium: data.utmMedium ?? null,
      utmCampaign: data.utmCampaign ?? null,
      metadata: data.metadata ?? null,
    })
    .returning();
  return capture;
}

export async function findSubscriberByEmail(email: string) {
  const normalized = email.toLowerCase();

  if (isMockDataMode()) {
    return mockStore.subscribers.find((s) => s.email === normalized) ?? null;
  }

  const [subscriber] = await getDb()
    .select()
    .from(subscribers)
    .where(eq(subscribers.email, normalized))
    .limit(1);
  return subscriber ?? null;
}

export async function createSubscriber(data: {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  consentMarketing?: boolean;
  source?: string | null;
}) {
  const normalized = data.email.toLowerCase();

  if (isMockDataMode()) {
    const subscriber = {
      id: randomUUID(),
      email: normalized,
      firstName: data.firstName ?? null,
      lastName: data.lastName ?? null,
      consentMarketing: data.consentMarketing ?? true,
      source: data.source ?? null,
      createdAt: now(),
    };
    mockStore.subscribers.push(subscriber);
    return subscriber;
  }

  const [subscriber] = await getDb()
    .insert(subscribers)
    .values({
      email: normalized,
      firstName: data.firstName,
      lastName: data.lastName,
      consentMarketing: data.consentMarketing,
      source: data.source,
    })
    .returning();
  return subscriber;
}

export async function getDashboardStats() {
  if (isMockDataMode()) {
    const recentCaptures = [...mockStore.captures]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, DASHBOARD_RECENT_LIMIT);

    return {
      captures: mockStore.captures.length,
      subscribers: mockStore.subscribers.length,
      landingEntries: mockStore.landingPageEntries.length,
      surveyResponses: mockStore.surveyResponses.length,
      qrScans: mockStore.qrScans.length,
      recentRewardClaims: mockStore.rewardClaims
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, DASHBOARD_RECENT_LIMIT),
      recentCaptures,
    };
  }

  const db = getDb();
  const [captureCount] = await db.select({ count: sql<number>`count(*)::int` }).from(captures);
  const [subscriberCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(subscribers);
  const [entryCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(landingPageEntries);
  const [responseCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(surveyResponses);

  const recentCaptures = await db
    .select()
    .from(captures)
    .orderBy(desc(captures.createdAt))
    .limit(DASHBOARD_RECENT_LIMIT);

  const qrScans = await getTotalQrScans();
  const recentRewardClaims = await getRecentRewardClaims(DASHBOARD_RECENT_LIMIT);

  return {
    captures: captureCount.count,
    subscribers: subscriberCount.count,
    landingEntries: entryCount.count,
    surveyResponses: responseCount.count,
    qrScans,
    recentRewardClaims,
    recentCaptures,
  };
}

export async function exportCapturesCsv(): Promise<string> {
  const rows = isMockDataMode()
    ? [...mockStore.captures].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    : await getDb().select().from(captures).orderBy(desc(captures.createdAt));

  return buildCsv(
    [
      "Email",
      "First Name",
      "Last Name",
      "Source Type",
      "Source ID",
      "Consent",
      "UTM Source",
      "UTM Medium",
      "UTM Campaign",
      "Created At",
    ],
    rows.map((r) => [
      r.email,
      r.firstName ?? "",
      r.lastName ?? "",
      r.sourceType,
      r.sourceId ?? "",
      r.consentMarketing,
      r.utmSource ?? "",
      r.utmMedium ?? "",
      r.utmCampaign ?? "",
      r.createdAt?.toISOString() ?? "",
    ])
  );
}
