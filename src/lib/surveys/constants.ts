import type { SurveyQuestion, SurveySettings } from "@/lib/db/schema";

export type { SurveySettings };

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
