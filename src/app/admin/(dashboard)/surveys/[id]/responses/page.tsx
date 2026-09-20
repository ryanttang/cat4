import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getSurveyById,
  getSurveyQuestions,
  getSurveyResponseDetails,
  SURVEY_RESPONSE_LIST_LIMIT,
} from "@/lib/data";
import { mergeSurveySettings, getSurveyResponseProfile } from "@/lib/surveys/constants";
import { formatSurveyAnswerValue } from "@/lib/surveys/results";
import { Button } from "@/components/ui/button";
import { adminTableWrapClass } from "@/components/admin/admin-ui";
import { formatDateTime } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";

type Props = { params: Promise<{ id: string }> };

export default async function SurveyResponsesPage({ params }: Props) {
  const { id } = await params;
  const survey = await getSurveyById(id);
  if (!survey || survey.type === "poll") notFound();

  const [questions, responses] = await Promise.all([
    getSurveyQuestions(id),
    getSurveyResponseDetails(id),
  ]);
  const profileFields = mergeSurveySettings(survey.settings).profileFields;
  const showingCapped = responses.length >= SURVEY_RESPONSE_LIST_LIMIT;

  return (
    <div>
      <Button asChild variant="ghost" className="-ml-2 mb-4">
        <Link href="/admin/surveys">
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Surveys
        </Link>
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{survey.title} — Responses</h1>
          <p className="mt-1 text-muted-foreground">
            {showingCapped
              ? `Showing the latest ${SURVEY_RESPONSE_LIST_LIMIT} responses`
              : `${responses.length} ${responses.length === 1 ? "response" : "responses"}`}
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={`/admin/surveys/${survey.id}/results`}>Live Results</Link>
        </Button>
      </div>

      <div className={adminTableWrapClass}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left">
              <th className="p-4">Submitted</th>
              <th className="p-4">Email</th>
              {profileFields.map((field) => (
                <th key={field.id} className="p-4">
                  {field.label}
                </th>
              ))}
              <th className="p-4">Participated</th>
              <th className="p-4">Marketing</th>
              {questions.map((question) => (
                <th key={question.id} className="max-w-[14rem] p-4" title={question.questionText}>
                  <span className="line-clamp-2">{question.questionText}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {responses.map((response) => (
              <tr
                key={response.id}
                className="border-b border-border/50 align-top transition-colors hover:bg-muted/30"
              >
                <td className="whitespace-nowrap p-4">{formatDateTime(response.submittedAt)}</td>
                <td className="p-4">{response.respondentEmail || "—"}</td>
                {profileFields.map((field) => {
                  const profile = getSurveyResponseProfile(response.metadata);
                  return (
                    <td key={field.id} className="p-4">
                      {profile[field.key] || "—"}
                    </td>
                  );
                })}
                <td className="p-4">{response.metadata?.consentParticipation ? "Yes" : "—"}</td>
                <td className="p-4">{response.metadata?.consentMarketing ? "Yes" : "—"}</td>
                {questions.map((question) => (
                  <td key={question.id} className="max-w-[16rem] p-4">
                    <p className="whitespace-pre-wrap break-words">
                      {formatSurveyAnswerValue(response.answersByQuestionId[question.id])}
                    </p>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {responses.length === 0 && (
          <p className="p-8 text-center text-muted-foreground">No responses yet.</p>
        )}
      </div>
    </div>
  );
}
