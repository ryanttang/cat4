"use server";

import { cookies } from "next/headers";
import {
  subscribeSchema,
  landingEntrySchema,
  surveySubmitSchema,
  rewardClaimSchema,
} from "@/lib/validations";
import { AGE_GATE_COOKIE_NAME, AGE_GATE_COOKIE_MAX_AGE } from "@/lib/constants";
import {
  createCapture,
  createLandingPageEntry,
  createSurveyResponse,
  findSubscriberByEmail,
  createSubscriber,
  createRewardClaim,
  getQrCodeById,
  generateRewardCode,
} from "@/lib/data";
import type { QrDestinationConfig } from "@/lib/db/schema";
import type { z } from "zod";

export async function confirmAgeVerificationAction() {
  const cookieStore = await cookies();
  cookieStore.set(AGE_GATE_COOKIE_NAME, "true", {
    path: "/",
    maxAge: AGE_GATE_COOKIE_MAX_AGE,
    sameSite: "lax",
  });
}

export async function subscribeAction(data: z.infer<typeof subscribeSchema>) {
  const parsed = subscribeSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const { email, firstName, lastName, consentMarketing, source, utmSource, utmMedium, utmCampaign } =
    parsed.data;

  try {
    await createCapture({
      sourceType: utmSource === "ambassador" ? "ambassador" : "subscribe",
      sourceId: null,
      email: email.toLowerCase(),
      firstName: firstName ?? null,
      lastName: lastName ?? null,
      consentMarketing,
      utmSource: utmSource ?? null,
      utmMedium: utmMedium ?? null,
      utmCampaign: utmCampaign ?? null,
      metadata: { source: source ?? "website" },
    });

    const existing = await findSubscriberByEmail(email);
    if (!existing) {
      await createSubscriber({
        email: email.toLowerCase(),
        firstName: firstName ?? null,
        lastName: lastName ?? null,
        consentMarketing,
        source: source ?? "website",
      });
    }

    return { success: true };
  } catch {
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function landingEntryAction(data: z.infer<typeof landingEntrySchema>) {
  const parsed = landingEntrySchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const { landingPageId, email, firstName, lastName, formData } = parsed.data;

  try {
    await createLandingPageEntry({
      landingPageId,
      email,
      firstName: firstName ?? null,
      lastName: lastName ?? null,
      formData: formData ?? null,
    });

    await createCapture({
      sourceType: "landing_page",
      sourceId: landingPageId,
      email,
      firstName: firstName ?? null,
      lastName: lastName ?? null,
      consentMarketing: true,
    });

    return { success: true };
  } catch {
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function surveySubmitAction(data: z.infer<typeof surveySubmitSchema>) {
  const parsed = surveySubmitSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const { surveyId, email, answers, metadata } = parsed.data;

  try {
    const { getSurveyById } = await import("@/lib/data");
    const survey = await getSurveyById(surveyId);
    if (!survey) {
      return { success: false, error: "Survey not found" };
    }

    await createSurveyResponse({
      surveyId,
      email,
      metadata: metadata ?? null,
      answers: answers.map(({ questionId, answer }) => ({
        questionId,
        answer: answer ?? null,
      })),
    });
    return { success: true };
  } catch {
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function rewardClaimAction(data: z.infer<typeof rewardClaimSchema>) {
  const parsed = rewardClaimSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const { qrCodeId, email, firstName, lastName, formData } = parsed.data;

  try {
    const qrCode = await getQrCodeById(qrCodeId);
    if (!qrCode || qrCode.status !== "published" || qrCode.destinationType !== "claim_reward") {
      return { success: false, error: "Reward not available" };
    }

    const config = (qrCode.destinationConfig ?? {}) as QrDestinationConfig;
    const outcome = config.claimOutcome ?? { type: "confirmation" as const };
    const rewardCode =
      outcome.type === "code"
        ? generateRewardCode(outcome.codePrefix ?? "CAT4-")
        : null;

    await createRewardClaim({
      qrCodeId,
      email: email.toLowerCase(),
      firstName: firstName ?? null,
      lastName: lastName ?? null,
      formData: formData ?? null,
      rewardCode,
    });

    await createCapture({
      sourceType: "reward_claim",
      sourceId: qrCodeId,
      email: email.toLowerCase(),
      firstName: firstName ?? null,
      lastName: lastName ?? null,
      consentMarketing: true,
      metadata: { rewardCode },
    });

    return {
      success: true,
      outcomeType: outcome.type,
      message: outcome.message ?? "Thanks! Your reward claim has been submitted.",
      rewardCode,
      redirectUrl: outcome.type === "redirect" ? outcome.redirectUrl : undefined,
    };
  } catch {
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
