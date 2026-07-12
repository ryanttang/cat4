"use client";

import Link from "next/link";
import type { QrDestinationConfig } from "@/lib/db/schema";
import { brand } from "@/lib/brand";

type LinkHubViewProps = {
  config: QrDestinationConfig;
};

export function LinkHubView({ config }: LinkHubViewProps) {
  const links = config.links ?? [];

  return (
    <div className="min-h-screen bg-cat4-dark px-4 py-16">
      <div className="mx-auto max-w-md text-center">
        {config.hubImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={config.hubImageUrl}
            alt=""
            className="mx-auto mb-6 h-24 w-24 rounded-full object-cover"
          />
        )}
        <h1 className="text-3xl font-bold text-cat4-light">
          {config.hubTitle || brand.defaults.hubTitle}
        </h1>
        {config.hubBio && (
          <p className="mt-3 text-cat4-light/70">{config.hubBio}</p>
        )}

        <div className="mt-10 space-y-3">
          {links.map((link) => {
            const isExternal = /^https?:\/\//i.test(link.url);
            const className =
              "block w-full rounded-xl border border-cat4-blue/30 bg-cat4-blue/10 px-6 py-4 font-medium text-cat4-light transition-colors hover:bg-cat4-blue/20";

            if (isExternal) {
              return (
                <a
                  key={`${link.label}-${link.url}`}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={className}
                >
                  {link.label}
                </a>
              );
            }

            return (
              <Link key={`${link.label}-${link.url}`} href={link.url} className={className}>
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
