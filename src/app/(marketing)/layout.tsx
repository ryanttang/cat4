import { Suspense } from "react";
import { Header } from "@/components/marketing/header";
import { MobileBottomNav } from "@/components/marketing/mobile-bottom-nav";
import { SiteFooter } from "@/components/marketing/site-footer";
import { AgeGateWrapper } from "@/components/marketing/age-gate-wrapper";
import { PageViewTracker } from "@/components/marketing/page-view-tracker";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <AgeGateWrapper>
      <PageViewTracker />
      <Header />
      <main className="min-h-screen bg-background pb-[calc(7.25rem+env(safe-area-inset-bottom))] md:pb-0">
        {children}
      </main>
      <SiteFooter className="relative z-10 -mt-[calc(7.25rem+env(safe-area-inset-bottom))] pb-[calc(7.25rem+env(safe-area-inset-bottom))] md:mt-0 md:pb-0" />
      <Suspense fallback={null}>
        <MobileBottomNav />
      </Suspense>
    </AgeGateWrapper>
  );
}
