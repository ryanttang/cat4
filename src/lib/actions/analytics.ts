"use server";

import { headers } from "next/headers";
import { requireAuth } from "@/lib/auth-utils";
import { getSiteAnalytics, logPageView } from "@/lib/data/analytics";

type ActionResult = { success: boolean; error?: string };

function getParam(
  searchParams: Record<string, string | undefined> | undefined,
  key: string
): string | null {
  const value = searchParams?.[key];
  return value?.trim() ? value.trim() : null;
}

export async function recordPageViewAction(input: {
  path: string;
  searchParams?: Record<string, string | undefined>;
  referrer?: string | null;
  sessionId?: string | null;
}): Promise<ActionResult> {
  const path = input.path?.trim();
  if (!path || path.startsWith("/admin") || path.startsWith("/ambassador")) {
    return { success: false, error: "Invalid path" };
  }

  const headerStore = await headers();
  await logPageView({
    path,
    userAgent: headerStore.get("user-agent"),
    referrer: input.referrer ?? headerStore.get("referer"),
    utmSource: getParam(input.searchParams, "utm_source"),
    utmMedium: getParam(input.searchParams, "utm_medium"),
    utmCampaign: getParam(input.searchParams, "utm_campaign"),
    sessionId: input.sessionId ?? null,
  });

  return { success: true };
}

export async function getAnalyticsDashboard() {
  await requireAuth();
  return getSiteAnalytics();
}
