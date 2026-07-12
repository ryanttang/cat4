"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth-utils";
import {
  ambassadorSchema,
  ambassadorHubDefaultsSchema,
  ambassadorPortalAccessSchema,
} from "@/lib/validations";
import {
  createAmbassador as createAmbassadorRecord,
  updateAmbassador as updateAmbassadorRecord,
  deleteAmbassador as deleteAmbassadorRecord,
  updateAmbassadorHubDefaults,
  setAmbassadorUserId,
  exportAmbassadorAnalyticsCsv,
} from "@/lib/data/ambassadors";
import { createUser as createUserRecord, deleteUser as deleteUserRecord } from "@/lib/data/users";
import { ambassadorDisplayName } from "@/lib/ambassadors/constants";

type ActionResult = { success: boolean; error?: string; id?: string };

export async function createAmbassador(data: unknown): Promise<ActionResult> {
  await requireAuth();
  const parsed = ambassadorSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0]?.message };

  const row = await createAmbassadorRecord(parsed.data);
  revalidatePath("/admin/ambassadors");
  return { success: true, id: row.id };
}

export async function updateAmbassador(id: string, data: unknown): Promise<ActionResult> {
  await requireAuth();
  const parsed = ambassadorSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0]?.message };

  const row = await updateAmbassadorRecord(id, parsed.data);
  if (!row) return { success: false, error: "Ambassador not found" };

  revalidatePath("/admin/ambassadors");
  revalidatePath(`/admin/ambassadors/${id}`);
  return { success: true, id: row.id };
}

export async function deleteAmbassador(id: string): Promise<ActionResult> {
  await requireAuth();
  const deleted = await deleteAmbassadorRecord(id);
  if (!deleted) return { success: false, error: "Ambassador not found" };

  revalidatePath("/admin/ambassadors");
  return { success: true };
}

export async function updateAmbassadorSettings(data: unknown): Promise<ActionResult> {
  await requireAuth();
  const parsed = ambassadorHubDefaultsSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0]?.message };

  await updateAmbassadorHubDefaults(parsed.data);
  revalidatePath("/admin/ambassadors");
  revalidatePath("/admin/ambassadors/settings");
  return { success: true };
}

export async function enableAmbassadorPortal(
  ambassadorId: string,
  data: unknown
): Promise<ActionResult> {
  await requireAuth();
  const parsed = ambassadorPortalAccessSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0]?.message };

  const { getAmbassadorById } = await import("@/lib/data/ambassadors");
  const ambassador = await getAmbassadorById(ambassadorId);
  if (!ambassador) return { success: false, error: "Ambassador not found" };
  if (ambassador.userId) return { success: false, error: "Portal access already enabled" };

  const user = await createUserRecord({
    email: ambassador.email,
    password: parsed.data.password,
    name: ambassadorDisplayName(ambassador.firstName, ambassador.lastName),
    role: "ambassador",
  });

  await setAmbassadorUserId(ambassadorId, user.id);
  revalidatePath(`/admin/ambassadors/${ambassadorId}`);
  return { success: true, id: user.id };
}

export async function disableAmbassadorPortal(ambassadorId: string): Promise<ActionResult> {
  await requireAuth();

  const { getAmbassadorById } = await import("@/lib/data/ambassadors");
  const ambassador = await getAmbassadorById(ambassadorId);
  if (!ambassador) return { success: false, error: "Ambassador not found" };
  if (!ambassador.userId) return { success: false, error: "No portal access to disable" };

  await deleteUserRecord(ambassador.userId);
  await setAmbassadorUserId(ambassadorId, null);
  revalidatePath(`/admin/ambassadors/${ambassadorId}`);
  return { success: true };
}

export async function exportAmbassadorAnalyticsAction(ambassadorId: string): Promise<string> {
  await requireAuth();
  return exportAmbassadorAnalyticsCsv(ambassadorId);
}
