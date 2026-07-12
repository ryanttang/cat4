"use client";

import { useEffect } from "react";
import Link from "next/link";
import { appendAmbassadorUtm } from "@/lib/ambassadors/constants";
import {
  logAmbassadorLinkClickAction,
  recordAmbassadorVanityVisitAction,
} from "@/lib/actions/ambassador";
import type { ResolvedAmbassadorHub } from "@/lib/data/ambassadors";

type AmbassadorHubViewProps = {
  ambassadorId: string;
  slug: string;
  hub: ResolvedAmbassadorHub;
  recordVanityVisit?: boolean;
};

export function AmbassadorHubView({
  ambassadorId,
  slug,
  hub,
  recordVanityVisit = false,
}: AmbassadorHubViewProps) {
  const links = hub.links ?? [];

  useEffect(() => {
    if (!recordVanityVisit) return;
    void recordAmbassadorVanityVisitAction(slug);
  }, [recordVanityVisit, slug]);

  async function handleLinkClick(linkLabel: string, linkUrl: string) {
    await logAmbassadorLinkClickAction({ ambassadorId, linkLabel, linkUrl });
  }

  return (
    <div className="min-h-screen bg-cat4-dark px-4 py-16">
      <div className="mx-auto max-w-md text-center">
        {hub.hubImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={hub.hubImageUrl}
            alt=""
            className="mx-auto mb-6 h-24 w-24 rounded-full object-cover"
          />
        )}
        <h1 className="text-3xl font-bold text-cat4-light">{hub.hubTitle || "CAT4"}</h1>
        {hub.hubBio && <p className="mt-3 text-cat4-light/70">{hub.hubBio}</p>}

        <div className="mt-10 space-y-3">
          {links.map((link) => {
            const href = appendAmbassadorUtm(link.url, slug);
            const isExternal = /^https?:\/\//i.test(href);
            const className =
              "block w-full rounded-xl border border-cat4-blue/30 bg-cat4-blue/10 px-6 py-4 font-medium text-cat4-light transition-colors hover:bg-cat4-blue/20";

            if (isExternal) {
              return (
                <a
                  key={`${link.label}-${link.url}`}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={className}
                  onClick={() => handleLinkClick(link.label, link.url)}
                >
                  {link.label}
                </a>
              );
            }

            return (
              <Link
                key={`${link.label}-${link.url}`}
                href={href}
                className={className}
                onClick={() => handleLinkClick(link.label, link.url)}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
