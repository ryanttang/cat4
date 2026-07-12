"use server";

import { cookies, headers } from "next/headers";
import { auth } from "@/lib/auth";
import { requireAmbassadorAuth } from "@/lib/auth-utils";
import { AMBASSADOR_VISIT_COOKIE_PREFIX } from "@/lib/ambassadors/constants";
import {
  getAmbassadorBySlug,
  getAmbassadorByUserId,
  getAmbassadorAnalytics,
  getAmbassadorLeaderboard,
  logAmbassadorLinkClick,
  logAmbassadorVisit,
} from "@/lib/data/ambassadors";

type ActionResult = { success: boolean; error?: string };

export async function getMyAmbassadorDashboard() {
  const session = await requireAmbassadorAuth();
  const ambassador = await getAmbassadorByUserId(session.user.id);
  if (!ambassador) return null;

  const [analytics, leaderboard] = await Promise.all([
    getAmbassadorAnalytics(ambassador.id),
    getAmbassadorLeaderboard(),
  ]);

  const rank =
    leaderboard.findIndex((entry) => entry.ambassador.id === ambassador.id) + 1;

  return { ambassador, analytics, rank: rank > 0 ? rank : null };
}

export async function recordAmbassadorVanityVisitAction(slug: string): Promise<void> {
  const ambassador = await getAmbassadorBySlug(slug);
  if (!ambassador || ambassador.status !== "published") return;

  const cookieStore = await cookies();
  const visitKey = `${AMBASSADOR_VISIT_COOKIE_PREFIX}${ambassador.id}`;
  if (cookieStore.get(visitKey)) return;

  const headerStore = await headers();
  await logAmbassadorVisit(ambassador, {
    userAgent: headerStore.get("user-agent"),
    referrer: headerStore.get("referer"),
    utmSource: "ambassador",
    utmMedium: slug,
    utmCampaign: "vanity",
  });

  cookieStore.set(visitKey, "1", {
    path: "/",
    maxAge: 60 * 30,
    sameSite: "lax",
  });
}

export async function logAmbassadorLinkClickAction(input: {
  ambassadorId: string;
  linkLabel: string;
  linkUrl: string;
}): Promise<ActionResult> {
  const headerStore = await headers();
  await logAmbassadorLinkClick({
    ambassadorId: input.ambassadorId,
    linkLabel: input.linkLabel,
    linkUrl: input.linkUrl,
    userAgent: headerStore.get("user-agent"),
    referrer: headerStore.get("referer"),
  });
  return { success: true };
}

export async function canAccessAmbassadorCard(ambassadorId: string): Promise<boolean> {
  const session = await auth();
  if (!session?.user) return false;

  if (session.user.role === "admin" || session.user.role === "staff") return true;

  if (session.user.role === "ambassador") {
    const ambassador = await getAmbassadorByUserId(session.user.id);
    return ambassador?.id === ambassadorId;
  }

  return false;
}
