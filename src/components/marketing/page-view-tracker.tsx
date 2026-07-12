"use client";

import { Suspense, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { recordPageViewAction } from "@/lib/actions/analytics";
import { brandStorageKeys } from "@/lib/brand";

const SESSION_KEY = brandStorageKeys.analyticsSession;

function getOrCreateSessionId(): string {
  try {
    const existing = window.sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `s_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    window.sessionStorage.setItem(SESSION_KEY, id);
    return id;
  } catch {
    return `s_${Date.now()}`;
  }
}

function PageViewTrackerInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTracked = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) return;

    const query = searchParams?.toString() ?? "";
    const trackKey = `${pathname}?${query}`;
    if (lastTracked.current === trackKey) return;
    lastTracked.current = trackKey;

    const params: Record<string, string | undefined> = {};
    searchParams?.forEach((value, key) => {
      params[key] = value;
    });

    void recordPageViewAction({
      path: pathname,
      searchParams: params,
      referrer: typeof document !== "undefined" ? document.referrer || null : null,
      sessionId: getOrCreateSessionId(),
    });
  }, [pathname, searchParams]);

  return null;
}

export function PageViewTracker() {
  return (
    <Suspense fallback={null}>
      <PageViewTrackerInner />
    </Suspense>
  );
}
