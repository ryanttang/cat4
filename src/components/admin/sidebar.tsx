"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Package,
  MapPin,
  BookOpen,
  Info,
  Home,
  Megaphone,
  ClipboardList,
  BarChart3,
  Users,
  Mail,
  Settings,
  LogOut,
  Trophy,
  UsersRound,
  LineChart,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { brand } from "@/lib/brand";
import { Button } from "@/components/ui/button";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

const dashboardItem: NavItem = {
  href: "/admin",
  label: "Brand Overview",
  icon: LayoutDashboard,
};

const navSections: NavSection[] = [
  {
    title: "Manage Brand",
    items: [
      { href: "/admin/products", label: "Products", icon: Package },
      { href: "/admin/locations", label: "Locations", icon: MapPin },
    ],
  },
  {
    title: "Brand Pages",
    items: [
      { href: "/admin/home", label: "Home Page", icon: Home },
      { href: "/admin/education", label: "Education", icon: BookOpen },
      { href: "/admin/about", label: "About", icon: Info },
    ],
  },
  {
    title: "Brand Tools",
    items: [
      { href: "/admin/analytics", label: "Analytics", icon: LineChart },
      { href: "/admin/rewards", label: "Rewards", icon: Trophy },
      { href: "/admin/ambassadors", label: "Ambassadors", icon: UsersRound },
      { href: "/admin/landing-pages", label: "Promotions", icon: Megaphone },
      { href: "/admin/surveys", label: "Surveys", icon: ClipboardList },
      { href: "/admin/polls", label: "Polls", icon: BarChart3 },
      { href: "/admin/captures", label: "Subscribes", icon: Mail },
    ],
  },
];

function isNavItemActive(pathname: string, href: string) {
  return pathname === href || (href !== "/admin" && pathname.startsWith(href));
}

const navLinkClass = (active: boolean) =>
  cn(
    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
    active
      ? "bg-cat4-blue/20 text-cat4-blue"
      : "text-cat4-light/70 hover:bg-white/5 hover:text-cat4-light"
  );

function SidebarNavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const active = isNavItemActive(pathname, item.href);
  const Icon = item.icon;

  return (
    <Link href={item.href} className={navLinkClass(active)}>
      <Icon className="h-4 w-4" />
      {item.label}
    </Link>
  );
}

export function AdminSidebar({ role }: { role: string }) {
  const pathname = usePathname();
  const isAdmin = role === "admin";

  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-border/40 bg-cat4-primary text-cat4-light">
      <div className="flex h-16 shrink-0 items-center border-b border-border/40 px-6">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="text-2xl font-bold tracking-tight text-cat4-blue">{brand.name}</span>
          <span className="text-sm font-medium text-cat4-light/60">Admin</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto p-4">
        <SidebarNavLink item={dashboardItem} pathname={pathname} />

        {navSections.map((section) => (
          <div key={section.title}>
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-cat4-light/40">
              {section.title}
            </p>
            <div className="space-y-1">
              {section.items.map((item) => (
                <SidebarNavLink key={item.href} item={item} pathname={pathname} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-border/40 p-4">
        {isAdmin && (
          <Link
            href="/admin/users"
            className={cn(
              "mb-2",
              navLinkClass(
                pathname === "/admin/users" || pathname.startsWith("/admin/users/")
              )
            )}
          >
            <Users className="h-4 w-4" />
            Users
          </Link>
        )}
        <Link
          href="/admin/settings"
          className={cn(
            "mb-2",
            navLinkClass(
              pathname === "/admin/settings" || pathname.startsWith("/admin/settings/")
            )
          )}
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
        <Button
          variant="ghost"
          className="w-full justify-start text-cat4-light/70 hover:bg-white/5 hover:text-cat4-light"
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
        <Link href="/" className="mt-2 block text-center text-xs text-cat4-light/50 hover:text-cat4-light">
          View Site →
        </Link>
      </div>
    </aside>
  );
}
