import { requireAuth } from "@/lib/auth-utils";
import { getAllUsers } from "@/lib/data";
import { UserManagement } from "@/components/admin/user-management";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { redirect } from "next/navigation";

export default async function AdminUsersPage() {
  const session = await requireAuth("admin");
  if (session.user.role !== "admin") redirect("/admin");

  const allUsers = await getAllUsers();

  return (
    <div>
      <AdminPageHeader title="Users" description="Manage admin and staff accounts." />
      <div className="mt-8">
        <UserManagement users={allUsers} currentUserId={session.user.id} />
      </div>
    </div>
  );
}
