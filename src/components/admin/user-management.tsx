"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createUser, deleteUser } from "@/lib/actions/admin";
import { adminPanelClass } from "@/components/admin/admin-ui";
import type { User } from "@/lib/db/schema";
import { Trash2 } from "lucide-react";

export function UserManagement({ users, currentUserId }: { users: User[]; currentUserId: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"admin" | "staff">("staff");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await createUser({ email, password, name, role });
    if (result.success) {
      setEmail("");
      setPassword("");
      setName("");
      router.refresh();
    } else {
      setError(result.error ?? "Failed");
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this user?")) return;
    await deleteUser(id);
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleCreate} className={`max-w-md space-y-4 p-6 ${adminPanelClass}`}>
        <h3 className="font-semibold">Add User</h3>
        <div><Label>Email</Label><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" /></div>
        <div><Label>Password</Label><Input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1" /></div>
        <div><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" /></div>
        <div>
          <Label>Role</Label>
          <Select value={role} onValueChange={(v) => setRole(v as typeof role)}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="staff">Staff</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={loading}>{loading ? "Creating..." : "Create User"}</Button>
      </form>

      <div className={`overflow-x-auto ${adminPanelClass}`}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left"><th className="p-4">Email</th><th className="p-4">Name</th><th className="p-4">Role</th><th className="p-4"></th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-border/50 transition-colors hover:bg-muted/30">
                <td className="p-4">{u.email}</td>
                <td className="p-4">{u.name ?? "—"}</td>
                <td className="p-4 capitalize">{u.role}</td>
                <td className="p-4">
                  {u.id !== currentUserId && (
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(u.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
