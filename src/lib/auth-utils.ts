import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function requireAuth(minRole?: "admin" | "staff") {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  if (session.user.role === "ambassador") {
    redirect("/ambassador");
  }

  const user = session.user;
  if (minRole === "admin" && user.role !== "admin") {
    redirect("/admin");
  }

  return session;
}

export async function requireAmbassadorAuth() {
  const session = await auth();
  if (!session?.user) {
    redirect("/ambassador/login");
  }

  if (session.user.role !== "ambassador") {
    redirect("/admin");
  }

  return session;
}

export function isAdmin(role: string): boolean {
  return role === "admin";
}

export function canManageUsers(role: string): boolean {
  return role === "admin";
}

export function isAmbassador(role: string): boolean {
  return role === "ambassador";
}

export function isStaffOrAdmin(role: string): boolean {
  return role === "admin" || role === "staff";
}
