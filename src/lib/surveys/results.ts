import type { SurveyQuestion } from "@/lib/db/schema";
import { getQuestionTypeLabel, getRatingMax, getScaleRange } from "./constants";

export type AnswerRow = {
  questionId: string;
  answer: unknown;
};

type RawAnswerRow =
  | AnswerRow
  | { questionId: string; answer: unknown }
  | { survey_answers: { questionId: string; answer: unknown } };

export type ChoiceResult = {
  kind: "choice";
  tally: Record<string, number>;
  total: number;
};

export type NumericResult = {
  kind: "numeric";
  tally: Record<string, number>;
  total: number;
  average: number | null;
  min: number | null;
  max: number | null;
};

export type TextResult = {
  kind: "text";
  responses: string[];
  total: number;
};

export type QuestionResult = {
  questionId: string;
  questionText: string;
  type: SurveyQuestion["type"];
  typeLabel: string;
  result: ChoiceResult | NumericResult | TextResult;
};

export type SurveyResultsSummary = {
  totalResponses: number;
  questions: QuestionResult[];
  updatedAt: string;
};

function normalizeAnswerRows(rows: RawAnswerRow[]): AnswerRow[] {
  return rows.map((row) =>
    "survey_answers" in row
      ? {
          questionId: row.survey_answers.questionId,
          answer: row.survey_answers.answer,
        }
      : row
  );
}

function isNumericQuestion(type: SurveyQuestion["type"]): boolean {
  return type === "rating" || type === "scale" || type === "nps" || type === "number";
}

function isTextQuestion(type: SurveyQuestion["type"]): boolean {
  return type === "text" || type === "feedback" || type === "short_text" || type === "email";
}

export function computeQuestionResults(
  questions: SurveyQuestion[],
  answerRows: RawAnswerRow[]
): QuestionResult[] {
  const normalized = normalizeAnswerRows(answerRows);

  return questions.map((question) => {
    const answers = normalized
      .filter((row) => row.questionId === question.id)
      .map((row) => row.answer)
      .filter((value) => value !== null && value !== undefined && value !== "");

    if (isTextQuestion(question.type)) {
      const responses = answers.map((value) => String(value));
      return {
        questionId: question.id,
        questionText: question.questionText,
        type: question.type,
        typeLabel: getQuestionTypeLabel(question.type),
        result: {
          kind: "text",
          responses,
          total: responses.length,
        },
      };
    }

    if (isNumericQuestion(question.type)) {
      const tally: Record<string, number> = {};
      const numericValues: number[] = [];

      for (const value of answers) {
        const num = typeof value === "number" ? value : Number.parseFloat(String(value));
        if (!Number.isFinite(num)) continue;
        numericValues.push(num);
        const key = String(num);
        tally[key] = (tally[key] ?? 0) + 1;
      }

      const average =
        numericValues.length > 0
          ? numericValues.reduce((sum, n) => sum + n, 0) / numericValues.length
          : null;

      return {
        questionId: question.id,
        questionText: question.questionText,
        type: question.type,
        typeLabel: getQuestionTypeLabel(question.type),
        result: {
          kind: "numeric",
          tally,
          total: numericValues.length,
          average,
          min: numericValues.length ? Math.min(...numericValues) : null,
          max: numericValues.length ? Math.max(...numericValues) : null,
        },
      };
    }

    const tally: Record<string, number> = {};
    for (const value of answers) {
      if (Array.isArray(value)) {
        for (const item of value) {
          const key = String(item);
          tally[key] = (tally[key] ?? 0) + 1;
        }
      } else {
        const key = String(value);
        tally[key] = (tally[key] ?? 0) + 1;
      }
    }

    return {
      questionId: question.id,
      questionText: question.questionText,
      type: question.type,
      typeLabel: getQuestionTypeLabel(question.type),
      result: {
        kind: "choice",
        tally,
        total: answers.length,
      },
    };
  });
}

export function computeSurveyResults(
  questions: SurveyQuestion[],
  answerRows: RawAnswerRow[],
  totalResponses: number
): SurveyResultsSummary {
  return {
    totalResponses,
    questions: computeQuestionResults(questions, answerRows),
    updatedAt: new Date().toISOString(),
  };
}

export function getChoiceOptions(question: SurveyQuestion): string[] {
  if (question.type === "yes_no") return ["Yes", "No"];
  return question.options ?? [];
}

export function getNumericLabels(question: SurveyQuestion): { min: string; max: string } {
  if (question.type === "nps") return { min: "0 - Not likely", max: "10 - Very likely" };
  if (question.type === "rating") {
    const max = getRatingMax(question.options);
    return { min: "1", max: String(max) };
  }
  if (question.type === "scale") {
    const { min, max } = getScaleRange(question.options);
    return { min: String(min), max: String(max) };
  }
  return { min: "1", max: "10" };
}
