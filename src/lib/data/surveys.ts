import { randomUUID } from "crypto";
import { eq, desc, sql, inArray } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { mockStore } from "@/lib/mock/store";
import {
  surveys,
  surveyQuestions,
  surveyResponses,
  surveyAnswers,
  type Survey,
  type SurveyQuestion,
  type SurveySettings,
} from "@/lib/db/schema";
import { isMockDataMode, mockSurveys, mockSurveyQuestions, now } from "./shared";
import { computeSurveyResults, type SurveyResultsSummary } from "@/lib/surveys/results";

export async function getAllSurveys(): Promise<Survey[]> {
  if (isMockDataMode()) {
    return [...mockSurveys()].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  return getDb().select().from(surveys).orderBy(desc(surveys.updatedAt));
}

export async function getSurveysByTypes(types: Survey["type"][]): Promise<Survey[]> {
  const all = await getAllSurveys();
  if (isMockDataMode()) {
    return all.filter((survey) => types.includes(survey.type));
  }

  return getDb()
    .select()
    .from(surveys)
    .where(inArray(surveys.type, types))
    .orderBy(desc(surveys.updatedAt));
}

export async function getSurveyById(id: string): Promise<Survey | null> {
  if (isMockDataMode()) {
    return mockSurveys().find((s) => s.id === id) ?? null;
  }

  const [survey] = await getDb().select().from(surveys).where(eq(surveys.id, id)).limit(1);
  return survey ?? null;
}

export async function getSurveyBySlug(slug: string): Promise<Survey | null> {
  if (isMockDataMode()) {
    return mockSurveys().find((s) => s.slug === slug) ?? null;
  }

  const [survey] = await getDb().select().from(surveys).where(eq(surveys.slug, slug)).limit(1);
  return survey ?? null;
}

export async function getSurveyResponseCounts(): Promise<Array<{ surveyId: string; count: number }>> {
  if (isMockDataMode()) {
    const counts = new Map<string, number>();
    for (const response of mockStore.surveyResponses) {
      counts.set(response.surveyId, (counts.get(response.surveyId) ?? 0) + 1);
    }
    return Array.from(counts.entries()).map(([surveyId, count]) => ({ surveyId, count }));
  }

  return getDb()
    .select({
      surveyId: surveyResponses.surveyId,
      count: sql<number>`count(*)::int`,
    })
    .from(surveyResponses)
    .groupBy(surveyResponses.surveyId);
}

export async function getSurveyQuestions(surveyId: string): Promise<SurveyQuestion[]> {
  if (isMockDataMode()) {
    return mockSurveyQuestions()
      .filter((q) => q.surveyId === surveyId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  return getDb()
    .select()
    .from(surveyQuestions)
    .where(eq(surveyQuestions.surveyId, surveyId))
    .orderBy(surveyQuestions.sortOrder);
}

export async function createSurvey(
  data: {
    title: string;
    slug: string;
    type: Survey["type"];
    description?: string | null;
    status?: Survey["status"];
    emailRequired?: boolean;
    publicResultsEnabled?: boolean;
    showResultsAfterVote?: boolean;
    settings?: SurveySettings;
    startsAt?: Date | string | null;
    endsAt?: Date | string | null;
  },
  createdById?: string
): Promise<Survey> {
  const startsAt = data.startsAt ? new Date(data.startsAt) : null;
  const endsAt = data.endsAt ? new Date(data.endsAt) : null;

  if (isMockDataMode()) {
    const survey: Survey = {
      id: randomUUID(),
      title: data.title,
      slug: data.slug,
      type: data.type,
      description: data.description ?? null,
      status: data.status ?? "draft",
      emailRequired: data.emailRequired ?? false,
      publicResultsEnabled: data.publicResultsEnabled ?? false,
      showResultsAfterVote: data.showResultsAfterVote ?? false,
      settings: data.settings ?? {},
      startsAt,
      endsAt,
      createdById: createdById ?? null,
      createdAt: now(),
      updatedAt: now(),
    };
    mockSurveys().push(survey);
    return survey;
  }

  const [survey] = await getDb()
    .insert(surveys)
    .values({
      title: data.title,
      slug: data.slug,
      type: data.type,
      description: data.description,
      status: data.status,
      emailRequired: data.emailRequired,
      publicResultsEnabled: data.publicResultsEnabled,
      showResultsAfterVote: data.showResultsAfterVote,
      settings: data.settings ?? {},
      startsAt,
      endsAt,
      createdById,
    })
    .returning();
  return survey;
}

export async function updateSurvey(
  id: string,
  data: {
    title?: string;
    slug?: string;
    type?: Survey["type"];
    description?: string | null;
    status?: Survey["status"];
    emailRequired?: boolean;
    publicResultsEnabled?: boolean;
    showResultsAfterVote?: boolean;
    settings?: SurveySettings;
    startsAt?: Date | string | null;
    endsAt?: Date | string | null;
  }
): Promise<Survey | null> {
  const startsAt =
    data.startsAt === undefined ? undefined : data.startsAt ? new Date(data.startsAt) : null;
  const endsAt =
    data.endsAt === undefined ? undefined : data.endsAt ? new Date(data.endsAt) : null;

  if (isMockDataMode()) {
    const index = mockSurveys().findIndex((s) => s.id === id);
    if (index === -1) return null;
    const current = mockSurveys()[index];
    mockSurveys()[index] = {
      ...current,
      ...data,
      startsAt: startsAt === undefined ? current.startsAt : startsAt,
      endsAt: endsAt === undefined ? current.endsAt : endsAt,
      updatedAt: now(),
    };
    return mockSurveys()[index];
  }

  const [survey] = await getDb()
    .update(surveys)
    .set({
      ...data,
      startsAt,
      endsAt,
      updatedAt: now(),
    })
    .where(eq(surveys.id, id))
    .returning();
  return survey ?? null;
}

export async function deleteSurvey(id: string): Promise<boolean> {
  if (isMockDataMode()) {
    const index = mockSurveys().findIndex((s) => s.id === id);
    if (index === -1) return false;
    mockSurveys().splice(index, 1);
    const questionIds = mockSurveyQuestions()
      .filter((q) => q.surveyId === id)
      .map((q) => q.id);
    mockStore.surveyQuestions = mockSurveyQuestions().filter((q) => q.surveyId !== id);
    const responseIds = mockStore.surveyResponses
      .filter((r) => r.surveyId === id)
      .map((r) => r.id);
    mockStore.surveyResponses = mockStore.surveyResponses.filter((r) => r.surveyId !== id);
    mockStore.surveyAnswers = mockStore.surveyAnswers.filter(
      (a) => !responseIds.includes(a.responseId) && !questionIds.includes(a.questionId)
    );
    return true;
  }

  await getDb().delete(surveys).where(eq(surveys.id, id));
  return true;
}

export async function addSurveyQuestion(
  surveyId: string,
  data: {
    type: SurveyQuestion["type"];
    questionText: string;
    options?: string[] | null;
    required?: boolean;
    sortOrder?: number;
  }
): Promise<SurveyQuestion> {
  if (isMockDataMode()) {
    const question: SurveyQuestion = {
      id: randomUUID(),
      surveyId,
      type: data.type,
      questionText: data.questionText,
      options: data.options ?? null,
      required: data.required ?? false,
      sortOrder: data.sortOrder ?? 0,
    };
    mockSurveyQuestions().push(question);
    return question;
  }

  const [question] = await getDb()
    .insert(surveyQuestions)
    .values({ ...data, surveyId })
    .returning();
  return question;
}

export async function deleteSurveyQuestion(id: string): Promise<boolean> {
  if (isMockDataMode()) {
    const index = mockSurveyQuestions().findIndex((q) => q.id === id);
    if (index === -1) return false;
    mockSurveyQuestions().splice(index, 1);
    mockStore.surveyAnswers = mockStore.surveyAnswers.filter((a) => a.questionId !== id);
    return true;
  }

  await getDb().delete(surveyQuestions).where(eq(surveyQuestions.id, id));
  return true;
}

export async function createSurveyResponse(data: {
  surveyId: string;
  email?: string;
  answers: Array<{ questionId: string; answer: unknown }>;
  metadata?: Record<string, unknown> | null;
}): Promise<{ responseId: string }> {
  if (isMockDataMode()) {
    const responseId = randomUUID();
    mockStore.surveyResponses.push({
      id: responseId,
      surveyId: data.surveyId,
      respondentEmail: data.email?.toLowerCase() ?? null,
      submittedAt: now(),
      metadata: data.metadata ?? null,
    });
    for (const answer of data.answers) {
      mockStore.surveyAnswers.push({
        id: randomUUID(),
        responseId,
        questionId: answer.questionId,
        answer: answer.answer,
      });
    }
    return { responseId };
  }

  const [response] = await getDb()
    .insert(surveyResponses)
    .values({
      surveyId: data.surveyId,
      respondentEmail: data.email?.toLowerCase(),
      metadata: data.metadata,
    })
    .returning();

  if (data.answers.length > 0) {
    await getDb().insert(surveyAnswers).values(
      data.answers.map((a) => ({
        responseId: response.id,
        questionId: a.questionId,
        answer: a.answer,
      }))
    );
  }

  return { responseId: response.id };
}

export async function getSurveyResponses(surveyId: string) {
  if (isMockDataMode()) {
    return mockStore.surveyResponses.filter((r) => r.surveyId === surveyId);
  }

  return getDb()
    .select()
    .from(surveyResponses)
    .where(eq(surveyResponses.surveyId, surveyId));
}

export async function getSurveyAnswersBySurveyId(surveyId: string) {
  if (isMockDataMode()) {
    const responseIds = mockStore.surveyResponses
      .filter((r) => r.surveyId === surveyId)
      .map((r) => r.id);
    return mockStore.surveyAnswers.filter((a) => responseIds.includes(a.responseId));
  }

  return getDb()
    .select()
    .from(surveyAnswers)
    .innerJoin(surveyResponses, eq(surveyAnswers.responseId, surveyResponses.id))
    .where(eq(surveyResponses.surveyId, surveyId));
}

export async function getSurveyResultsSummary(surveyId: string): Promise<SurveyResultsSummary | null> {
  const survey = await getSurveyById(surveyId);
  if (!survey) return null;

  const [questions, responses, allAnswers] = await Promise.all([
    getSurveyQuestions(surveyId),
    getSurveyResponses(surveyId),
    getSurveyAnswersBySurveyId(surveyId),
  ]);

  return computeSurveyResults(questions, allAnswers, responses.length);
}
