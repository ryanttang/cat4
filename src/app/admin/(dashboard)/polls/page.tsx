import { getSurveysByTypes, getSurveyQuestions, getSurveyResponseCounts } from "@/lib/data";
import { PollsAdmin } from "@/components/admin/polls-admin";

export default async function AdminPollsPage() {
  const [polls, responseCountsList] = await Promise.all([
    getSurveysByTypes(["poll"]),
    getSurveyResponseCounts(),
  ]);

  const responseCounts = Object.fromEntries(
    responseCountsList.map((response) => [response.surveyId, response.count])
  );

  const questionsEntries = await Promise.all(
    polls.map(async (poll) => [poll.id, await getSurveyQuestions(poll.id)] as const)
  );
  const questionsBySurveyId = Object.fromEntries(questionsEntries);

  return (
    <PollsAdmin
      polls={polls}
      responseCounts={responseCounts}
      questionsBySurveyId={questionsBySurveyId}
    />
  );
}
