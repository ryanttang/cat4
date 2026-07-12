import { getSurveysByTypes, getSurveyQuestions, getSurveyResponseCounts } from "@/lib/data";
import { SurveysAdmin } from "@/components/admin/surveys-admin";

export default async function AdminSurveysPage() {
  const [surveys, responseCountsList] = await Promise.all([
    getSurveysByTypes(["survey", "questionnaire"]),
    getSurveyResponseCounts(),
  ]);

  const responseCounts = Object.fromEntries(
    responseCountsList.map((response) => [response.surveyId, response.count])
  );

  const questionsEntries = await Promise.all(
    surveys.map(async (survey) => [survey.id, await getSurveyQuestions(survey.id)] as const)
  );
  const questionsBySurveyId = Object.fromEntries(questionsEntries);

  return (
    <SurveysAdmin
      surveys={surveys}
      responseCounts={responseCounts}
      questionsBySurveyId={questionsBySurveyId}
    />
  );
}
