import { brand } from "@/lib/brand";
import type { SurveyProfileField, SurveyQuestion, SurveySettings } from "@/lib/db/schema";
import { slugify } from "@/lib/utils";

export type { SurveyProfileField, SurveySettings };

export const SURVEY_PROFILE_FIELD_PRESETS: Array<
  Pick<SurveyProfileField, "key" | "label" | "type">
> = [
  { key: "firstName", label: "First name", type: "text" },
  { key: "lastName", label: "Last name", type: "text" },
  { key: "phone", label: "Phone", type: "tel" },
  { key: "zip", label: "ZIP code", type: "text" },
];

export function createSurveyProfileField(
  overrides: Partial<SurveyProfileField> = {}
): SurveyProfileField {
  const label = overrides.label?.trim() || "New field";
  return {
    id: overrides.id ?? crypto.randomUUID(),
    key: overrides.key?.trim() || slugify(label) || `field_${Date.now()}`,
    label,
    type: overrides.type ?? "text",
    required: overrides.required ?? false,
  };
}

export function mergeSurveySettings(settings?: SurveySettings | null): {
  allowMultipleVotes: boolean;
  anonymousOnly: boolean;
  resultsRefreshSeconds: number | undefined;
  headline: string;
  subtext: string;
  disclaimerText: string;
  emailLabel: string;
  participationConsentEnabled: boolean;
  participationConsentText: string;
  marketingConsentEnabled: boolean;
  marketingConsentText: string;
  marketingConsentRequired: boolean;
  profileFields: SurveyProfileField[];
} {
  return {
    allowMultipleVotes: settings?.allowMultipleVotes ?? false,
    anonymousOnly: settings?.anonymousOnly ?? false,
    resultsRefreshSeconds: settings?.resultsRefreshSeconds,
    headline: settings?.headline ?? "",
    subtext: settings?.subtext ?? "",
    disclaimerText: settings?.disclaimerText?.trim() || brand.defaults.surveyDisclaimer,
    emailLabel: settings?.emailLabel ?? "",
    participationConsentEnabled: settings?.participationConsentEnabled ?? false,
    participationConsentText:
      settings?.participationConsentText?.trim() || brand.defaults.surveyParticipationConsent,
    marketingConsentEnabled: settings?.marketingConsentEnabled ?? false,
    marketingConsentText:
      settings?.marketingConsentText?.trim() || brand.defaults.surveyMarketingConsent,
    marketingConsentRequired: settings?.marketingConsentRequired ?? false,
    profileFields: (settings?.profileFields ?? []).map((field) =>
      createSurveyProfileField(field)
    ),
  };
}

export function defaultSurveySettingsForCreate(): SurveySettings {
  return {
    ...mergeSurveySettings(null),
    participationConsentEnabled: true,
    marketingConsentEnabled: true,
  };
}

export function resolveSurveyPublicCopy(survey: {
  title: string;
  description?: string | null;
  settings?: SurveySettings | null;
}) {
  const settings = mergeSurveySettings(survey.settings);
  return {
    headline: settings.headline.trim() || survey.title,
    subtext: settings.subtext.trim() || survey.description?.trim() || "",
    disclaimerText: settings.disclaimerText.trim(),
    emailLabel: settings.emailLabel.trim() || "Email",
    participationConsentEnabled: settings.participationConsentEnabled,
    participationConsentText: settings.participationConsentText,
    marketingConsentEnabled: settings.marketingConsentEnabled,
    marketingConsentText: settings.marketingConsentText,
    marketingConsentRequired: settings.marketingConsentRequired,
    profileFields: settings.profileFields,
  };
}

export type SurveyIntakeInput = {
  email?: string;
  profile?: Record<string, string>;
  consentParticipation?: boolean;
  consentMarketing?: boolean;
};

export function validateSurveyIntake(
  survey: { emailRequired: boolean; settings?: SurveySettings | null },
  input: SurveyIntakeInput
): string | null {
  const copy = resolveSurveyPublicCopy({
    title: "",
    description: null,
    settings: survey.settings,
  });

  if (survey.emailRequired && !input.email?.trim()) {
    return `${copy.emailLabel} is required`;
  }

  for (const field of copy.profileFields) {
    if (!field.required) continue;
    if (!input.profile?.[field.key]?.trim()) {
      return `${field.label} is required`;
    }
  }

  if (copy.participationConsentEnabled && !input.consentParticipation) {
    return "Please agree to participate before submitting";
  }

  if (copy.marketingConsentEnabled && copy.marketingConsentRequired && !input.consentMarketing) {
    return "Please agree to receive marketing emails";
  }

  return null;
}

export function getSurveyResponseProfile(
  metadata: Record<string, unknown> | null | undefined
): Record<string, string> {
  const raw = metadata?.profile;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  return Object.fromEntries(
    Object.entries(raw as Record<string, unknown>).map(([key, value]) => [
      key,
      value == null ? "" : String(value),
    ])
  );
}

export const SURVEY_CONTENT_TYPES = [
  { value: "survey", label: "Survey" },
  { value: "questionnaire", label: "Questionnaire" },
] as const;

export const POLL_QUESTION_TYPES = [
  "single_choice",
  "multi_choice",
  "yes_no",
  "rating",
  "scale",
] as const satisfies readonly SurveyQuestion["type"][];

export const QUESTION_TYPES = [
  { value: "single_choice", label: "Single Choice", needsOptions: true, group: "choice" },
  { value: "multi_choice", label: "Multi-Select", needsOptions: true, group: "choice" },
  { value: "dropdown", label: "Dropdown", needsOptions: true, group: "choice" },
  { value: "yes_no", label: "Yes / No", needsOptions: false, group: "choice" },
  { value: "short_text", label: "Short Text", needsOptions: false, group: "text" },
  { value: "text", label: "Long Text", needsOptions: false, group: "text" },
  { value: "feedback", label: "Feedback", needsOptions: false, group: "text" },
  { value: "email", label: "Email", needsOptions: false, group: "text" },
  { value: "number", label: "Number", needsOptions: false, group: "text" },
  { value: "rating", label: "Star Rating", needsOptions: false, group: "scale" },
  { value: "scale", label: "Scale (1–10)", needsOptions: false, group: "scale" },
  { value: "nps", label: "NPS (0–10)", needsOptions: false, group: "scale" },
] as const;

export type QuestionTypeValue = (typeof QUESTION_TYPES)[number]["value"];

export function getQuestionTypeLabel(type: SurveyQuestion["type"]): string {
  return QUESTION_TYPES.find((item) => item.value === type)?.label ?? type;
}

export function questionNeedsOptions(type: SurveyQuestion["type"]): boolean {
  return QUESTION_TYPES.find((item) => item.value === type)?.needsOptions ?? false;
}

export function isPollQuestionType(type: SurveyQuestion["type"]): boolean {
  return (POLL_QUESTION_TYPES as readonly string[]).includes(type);
}

export function getRatingMax(options: string[] | null | undefined): number {
  const parsed = Number.parseInt(options?.[0] ?? "5", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 5;
}

export function getScaleRange(options: string[] | null | undefined): { min: number; max: number } {
  const min = Number.parseInt(options?.[0] ?? "1", 10);
  const max = Number.parseInt(options?.[1] ?? "10", 10);
  return {
    min: Number.isFinite(min) ? min : 1,
    max: Number.isFinite(max) ? max : 10,
  };
}

export function isSurveyActive(survey: {
  status: string;
  startsAt: Date | string | null;
  endsAt: Date | string | null;
}): boolean {
  const now = new Date();
  return (
    survey.status === "published" &&
    (!survey.startsAt || new Date(survey.startsAt) <= now) &&
    (!survey.endsAt || new Date(survey.endsAt) >= now)
  );
}
