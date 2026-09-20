import { AgeGateWrapper } from "@/components/marketing/age-gate-wrapper";
import { PageViewTracker } from "@/components/marketing/page-view-tracker";

/** CMS-backed page — never prerender against Neon at build time. */
export const dynamic = "force-dynamic";

export default function HubLayout({ children }: { children: React.ReactNode }) {
  return (
    <AgeGateWrapper>
      <PageViewTracker />
      <main className="min-h-screen bg-cat4-dark">{children}</main>
    </AgeGateWrapper>
  );
}
