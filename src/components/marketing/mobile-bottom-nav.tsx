"use client";

import Link from "next/link";
import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { GraduationCap, MapPin, Package, type LucideIcon } from "lucide-react";
import { ProductSearchBar } from "@/components/marketing/product-search-bar";
import { cn } from "@/lib/utils";

type NavTab = {
  href: string;
  label: string;
  icon: LucideIcon;
  isActive: (pathname: string) => boolean;
};

const tabs: NavTab[] = [
  {
    href: "/products",
    label: "Products",
    icon: Package,
    isActive: (pathname) => pathname === "/products" || pathname.startsWith("/products/"),
  },
  {
    href: "/find",
    label: "Find",
    icon: MapPin,
    isActive: (pathname) => pathname === "/find" || pathname.startsWith("/find/"),
  },
  {
    href: "/education",
    label: "Education",
    icon: GraduationCap,
    isActive: (pathname) => pathname === "/education" || pathname.startsWith("/education/"),
  },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border/40 bg-cat4-primary/95 backdrop-blur supports-[backdrop-filter]:bg-cat4-primary/90 md:hidden"
      aria-label="Mobile navigation"
    >
      <div className="border-b border-border/30 px-3 py-2">
        <Suspense fallback={<div className="h-9 w-full rounded-md bg-cat4-surface/30" />}>
          <ProductSearchBar />
        </Suspense>
      </div>
      <div className="mx-auto grid h-16 max-w-lg grid-cols-3 pb-[env(safe-area-inset-bottom)]">
        {tabs.map(({ href, label, icon: Icon, isActive }) => {
          const active = isActive(pathname);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-2 transition-colors",
                active ? "text-cat4-blue" : "text-cat4-light/60 hover:text-cat4-light"
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon className={cn("h-5 w-5", active && "stroke-[2.5]")} />
              <span className={cn("text-[10px] font-medium leading-none", active && "font-semibold")}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
