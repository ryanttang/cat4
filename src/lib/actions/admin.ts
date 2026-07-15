"use server";

import { revalidatePath } from "next/cache";
import { requireAuth, canManageUsers } from "@/lib/auth-utils";
import {
  productSchema,
  heroSchema,
  locationSchema,
  educationSchema,
  aboutSectionSchema,
  landingPageSchema,
  surveySchema,
  surveyQuestionSchema,
  homepageSchema,
  userSchema,
  qrCodeSchema,
} from "@/lib/validations";
import type { LandingPageBlock, QrDestinationConfig } from "@/lib/db/schema";
import { brand } from "@/lib/brand";
import {
  createProduct as createProductRecord,
  updateProduct as updateProductRecord,
  deleteProduct as deleteProductRecord,
  updateHero as updateHeroRecord,
  createLocation as createLocationRecord,
  updateLocation as updateLocationRecord,
  deleteLocation as deleteLocationRecord,
  createEducationArticle,
  updateEducationArticle,
  deleteEducationArticle,
  createAboutSection as createAboutSectionRecord,
  updateAboutSection as updateAboutSectionRecord,
  deleteAboutSection as deleteAboutSectionRecord,
  createLandingPage as createLandingPageRecord,
  updateLandingPage as updateLandingPageRecord,
  deleteLandingPage as deleteLandingPageRecord,
  createSurvey as createSurveyRecord,
  updateSurvey as updateSurveyRecord,
  deleteSurvey as deleteSurveyRecord,
  addSurveyQuestion as addSurveyQuestionRecord,
  deleteSurveyQuestion as deleteSurveyQuestionRecord,
  updateHomepageContent as updateHomepageContentRecord,
  createUser as createUserRecord,
  deleteUser as deleteUserRecord,
  getDashboardStats as fetchDashboardStats,
  exportCapturesCsv as fetchCapturesCsv,
  exportLandingPageEntriesCsv as fetchLandingPageEntriesCsv,
  createProductQrCode,
  createQrCode as createQrCodeRecord,
  updateQrCode as updateQrCodeRecord,
  deleteQrCode as deleteQrCodeRecord,
  exportQrScansCsv as fetchQrScansCsv,
  exportRewardClaimsCsv as fetchRewardClaimsCsv,
} from "@/lib/data";

type ActionResult = { success: boolean; error?: string; id?: string };

export async function createProduct(data: unknown): Promise<ActionResult> {
  await requireAuth();
  const parsed = productSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0]?.message };

  const row = await createProductRecord(parsed.data);
  await createProductQrCode(row.id, row.name, row.slug);
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/admin/rewards");
  return { success: true, id: row.id };
}

export async function updateProduct(id: string, data: unknown): Promise<ActionResult> {
  await requireAuth();
  const parsed = productSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0]?.message };

  await updateProductRecord(id, parsed.data);
  revalidatePath("/");
  revalidatePath("/products");
  return { success: true, id };
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  await requireAuth();
  await deleteProductRecord(id);
  revalidatePath("/");
  return { success: true };
}

export async function updateHero(id: string, data: unknown): Promise<ActionResult> {
  await requireAuth();
  const parsed = heroSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0]?.message };

  await updateHeroRecord(id, parsed.data);
  revalidatePath("/");
  return { success: true };
}

export async function createLocation(data: unknown): Promise<ActionResult> {
  await requireAuth();
  const parsed = locationSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0]?.message };

  const row = await createLocationRecord({
    ...parsed.data,
    published: parsed.data.published ?? true,
    phone: parsed.data.phone ?? null,
    hours: parsed.data.hours ?? null,
    imageUrl: parsed.data.imageUrl ?? null,
    shopUrl: parsed.data.shopUrl ?? null,
    directionsUrl: parsed.data.directionsUrl ?? null,
    lat: parsed.data.lat ?? null,
    lng: parsed.data.lng ?? null,
  });
  revalidatePath("/find");
  return { success: true, id: row.id };
}

export async function updateLocation(id: string, data: unknown): Promise<ActionResult> {
  await requireAuth();
  const parsed = locationSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0]?.message };

  await updateLocationRecord(id, parsed.data);
  revalidatePath("/find");
  return { success: true };
}

export async function deleteLocation(id: string): Promise<ActionResult> {
  await requireAuth();
  await deleteLocationRecord(id);
  revalidatePath("/find");
  return { success: true };
}

export async function createEducation(data: unknown): Promise<ActionResult> {
  await requireAuth();
  const parsed = educationSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0]?.message };

  const row = await createEducationArticle({
    ...parsed.data,
    excerpt: parsed.data.excerpt ?? null,
    coverImage: parsed.data.coverImage ?? null,
    tags: parsed.data.tags ?? [],
    published: parsed.data.published ?? false,
    publishedAt: parsed.data.published ? new Date() : null,
  });
  revalidatePath("/education");
  return { success: true, id: row.id };
}

export async function updateEducation(id: string, data: unknown): Promise<ActionResult> {
  await requireAuth();
  const parsed = educationSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0]?.message };

  await updateEducationArticle(id, {
    ...parsed.data,
    publishedAt: parsed.data.published ? new Date() : null,
  });
  revalidatePath("/education");
  return { success: true };
}

export async function deleteEducation(id: string): Promise<ActionResult> {
  await requireAuth();
  await deleteEducationArticle(id);
  revalidatePath("/education");
  return { success: true };
}

export async function createAboutSection(data: unknown): Promise<ActionResult> {
  await requireAuth();
  const parsed = aboutSectionSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0]?.message };

  const row = await createAboutSectionRecord({
    ...parsed.data,
    sortOrder: parsed.data.sortOrder ?? 0,
    published: parsed.data.published ?? true,
  });
  revalidatePath("/about");
  return { success: true, id: row.id };
}

export async function updateAboutSection(id: string, data: unknown): Promise<ActionResult> {
  await requireAuth();
  const parsed = aboutSectionSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0]?.message };

  await updateAboutSectionRecord(id, parsed.data);
  revalidatePath("/about");
  return { success: true };
}

export async function deleteAboutSection(id: string): Promise<ActionResult> {
  await requireAuth();
  await deleteAboutSectionRecord(id);
  revalidatePath("/about");
  return { success: true };
}

export async function createLandingPage(data: unknown): Promise<ActionResult> {
  const session = await requireAuth();
  const parsed = landingPageSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0]?.message };

  const defaultBlocks: LandingPageBlock = {
    hero: { headline: parsed.data.title, subheadline: "" },
    form: {
      fields: [{ name: "email", label: "Email", required: true, type: "email" }],
      consentText: brand.defaults.promotionConsent,
    },
    rules: { content: "Official rules go here." },
  };

  const row = await createLandingPageRecord(
    {
      title: parsed.data.title,
      slug: parsed.data.slug,
      type: parsed.data.type,
      status: parsed.data.status ?? "draft",
      blocks: (parsed.data.blocks as LandingPageBlock) ?? defaultBlocks,
      startsAt: parsed.data.startsAt ? new Date(parsed.data.startsAt) : null,
      endsAt: parsed.data.endsAt ? new Date(parsed.data.endsAt) : null,
    },
    session.user.id
  );
  revalidatePath(`/${parsed.data.slug}`);
  revalidatePath(`/${parsed.data.slug}/enter`);
  revalidatePath("/admin/landing-pages");
  return { success: true, id: row.id };
}

export async function updateLandingPage(id: string, data: unknown): Promise<ActionResult> {
  await requireAuth();
  const parsed = landingPageSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0]?.message };

  await updateLandingPageRecord(id, {
    title: parsed.data.title,
    slug: parsed.data.slug,
    type: parsed.data.type,
    status: parsed.data.status,
    blocks: parsed.data.blocks as LandingPageBlock,
    startsAt: parsed.data.startsAt ? new Date(parsed.data.startsAt) : null,
    endsAt: parsed.data.endsAt ? new Date(parsed.data.endsAt) : null,
  });
  revalidatePath(`/${parsed.data.slug}`);
  revalidatePath(`/${parsed.data.slug}/enter`);
  return { success: true };
}

export async function deleteLandingPage(id: string): Promise<ActionResult> {
  await requireAuth();
  await deleteLandingPageRecord(id);
  return { success: true };
}

export async function createSurvey(data: unknown): Promise<ActionResult> {
  const session = await requireAuth();
  const parsed = surveySchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0]?.message };

  const row = await createSurveyRecord(
    {
      title: parsed.data.title,
      slug: parsed.data.slug,
      type: parsed.data.type,
      description: parsed.data.description,
      status: parsed.data.status ?? "draft",
      emailRequired: parsed.data.emailRequired ?? false,
      publicResultsEnabled: parsed.data.publicResultsEnabled ?? false,
      showResultsAfterVote: parsed.data.showResultsAfterVote ?? false,
      settings: parsed.data.settings ?? {},
      startsAt: parsed.data.startsAt ? new Date(parsed.data.startsAt) : null,
      endsAt: parsed.data.endsAt ? new Date(parsed.data.endsAt) : null,
    },
    session.user.id
  );
  revalidatePath(parsed.data.type === "poll" ? "/admin/polls" : "/admin/surveys");
  return { success: true, id: row.id };
}

export async function updateSurvey(id: string, data: unknown): Promise<ActionResult> {
  await requireAuth();
  const parsed = surveySchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0]?.message };

  await updateSurveyRecord(id, {
    ...parsed.data,
    startsAt: parsed.data.startsAt ? new Date(parsed.data.startsAt) : null,
    endsAt: parsed.data.endsAt ? new Date(parsed.data.endsAt) : null,
  });
  const basePath = parsed.data.type === "poll" ? "/poll" : "/survey";
  revalidatePath(`${basePath}/${parsed.data.slug}`);
  revalidatePath(`${basePath}/${parsed.data.slug}/results`);
  revalidatePath(parsed.data.type === "poll" ? "/admin/polls" : "/admin/surveys");
  return { success: true };
}

export async function deleteSurvey(id: string): Promise<ActionResult> {
  await requireAuth();
  await deleteSurveyRecord(id);
  return { success: true };
}

export async function addSurveyQuestionAction(surveyId: string, data: unknown): Promise<ActionResult> {
  await requireAuth();
  const parsed = surveyQuestionSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0]?.message };

  const row = await addSurveyQuestionRecord(surveyId, parsed.data);
  return { success: true, id: row.id };
}

export { addSurveyQuestionAction as addSurveyQuestion };

export async function deleteSurveyQuestion(id: string): Promise<ActionResult> {
  await requireAuth();
  await deleteSurveyQuestionRecord(id);
  return { success: true };
}

export async function updateHomepageSettings(data: unknown): Promise<ActionResult> {
  await requireAuth();
  const parsed = homepageSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0]?.message };

  await updateHomepageContentRecord(parsed.data);
  revalidatePath("/");
  revalidatePath("/admin/home");
  return { success: true };
}

export async function createUser(data: unknown): Promise<ActionResult> {
  const session = await requireAuth("admin");
  if (!canManageUsers(session.user.role)) {
    return { success: false, error: "Unauthorized" };
  }

  const parsed = userSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0]?.message };
  if (!parsed.data.password) return { success: false, error: "Password is required" };

  const row = await createUserRecord({
    email: parsed.data.email.toLowerCase(),
    password: parsed.data.password,
    name: parsed.data.name,
    role: parsed.data.role,
  });
  return { success: true, id: row.id };
}

export async function deleteUser(id: string): Promise<ActionResult> {
  const session = await requireAuth("admin");
  if (!canManageUsers(session.user.role)) {
    return { success: false, error: "Unauthorized" };
  }
  if (session.user.id === id) {
    return { success: false, error: "Cannot delete your own account" };
  }

  await deleteUserRecord(id);
  return { success: true };
}

export async function getDashboardStats() {
  await requireAuth();
  return fetchDashboardStats();
}

export async function exportLandingPageEntriesCsv(landingPageId: string): Promise<string> {
  await requireAuth();
  return fetchLandingPageEntriesCsv(landingPageId);
}

export async function exportCapturesCsv(): Promise<string> {
  await requireAuth();
  return fetchCapturesCsv();
}

export async function createQrCode(data: unknown): Promise<ActionResult> {
  await requireAuth();
  const parsed = qrCodeSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0]?.message };

  const row = await createQrCodeRecord({
    title: parsed.data.title,
    code: parsed.data.code,
    status: parsed.data.status ?? "draft",
    productId: parsed.data.productId ?? null,
    destinationType: parsed.data.destinationType,
    destinationConfig: (parsed.data.destinationConfig as QrDestinationConfig) ?? {},
  });
  revalidatePath("/admin/rewards");
  return { success: true, id: row.id };
}

export async function updateQrCode(id: string, data: unknown): Promise<ActionResult> {
  await requireAuth();
  const parsed = qrCodeSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0]?.message };

  await updateQrCodeRecord(id, {
    title: parsed.data.title,
    code: parsed.data.code,
    status: parsed.data.status,
    productId: parsed.data.productId,
    destinationType: parsed.data.destinationType,
    destinationConfig: parsed.data.destinationConfig as QrDestinationConfig,
  });
  revalidatePath("/admin/rewards");
  revalidatePath(`/admin/rewards/${id}/analytics`);
  return { success: true, id };
}

export async function deleteQrCode(id: string): Promise<ActionResult> {
  await requireAuth();
  await deleteQrCodeRecord(id);
  revalidatePath("/admin/rewards");
  return { success: true };
}

export async function exportQrScansCsv(qrCodeId: string): Promise<string> {
  await requireAuth();
  return fetchQrScansCsv(qrCodeId);
}

export async function exportRewardClaimsCsv(qrCodeId: string): Promise<string> {
  await requireAuth();
  return fetchRewardClaimsCsv(qrCodeId);
}
