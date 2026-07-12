import { requireAuth } from "@/lib/auth-utils";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AuthProvider } from "@/components/admin/auth-provider";
import { MockModeBanner } from "@/components/admin/mock-mode-banner";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAuth();

  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col bg-background">
        <MockModeBanner />
        <div className="flex flex-1">
          <AdminSidebar role={session.user.role} />
          <main className="flex-1 overflow-auto">
            <div className="p-6 sm:p-8">{children}</div>
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}
