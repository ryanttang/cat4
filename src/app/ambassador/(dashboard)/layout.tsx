import Link from "next/link";
import { signOut } from "@/lib/auth";
import { requireAmbassadorAuth } from "@/lib/auth-utils";
import { Button } from "@/components/ui/button";
import { brand } from "@/lib/brand";

export const dynamic = "force-dynamic";

const navItems = [
  { href: "/ambassador", label: "Dashboard" },
  { href: "/ambassador/qr", label: "My QR" },
];

export default async function AmbassadorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAmbassadorAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-6">
            <Link href="/ambassador" className="text-lg font-bold">
              <span className="text-cat4-blue">{brand.name}</span> Ambassador
            </Link>
            <nav className="hidden gap-4 sm:flex">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/ambassador/login" });
            }}
          >
            <Button type="submit" variant="outline" size="sm">
              Sign Out
            </Button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
