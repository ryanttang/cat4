import { notFound } from "next/navigation";
import Link from "next/link";
import { getSurveyById, getSurveyResultsSummary } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { LiveResults } from "@/components/surveys/live-results";
import { ChevronLeft } from "lucide-react";

type Props = { params: Promise<{ id: string }> };

export default async function PollResultsPage({ params }: Props) {
  const { id } = await params;
  const poll = await getSurveyById(id);
  if (!poll || poll.type !== "poll") notFound();

  const initialData = await getSurveyResultsSummary(id);

  return (
    <div>
      <Button asChild variant="ghost" className="-ml-2 mb-4">
        <Link href="/admin/polls">
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Polls
        </Link>
      </Button>
      <h1 className="text-3xl font-bold">{poll.title} — Live Results</h1>
      <p className="mt-1 text-muted-foreground">Admin view with live updates</p>

      <div className="mt-8">
        <LiveResults
          surveyId={id}
          refreshSeconds={poll.settings?.resultsRefreshSeconds ?? 5}
          showTextResponses={false}
          initialData={initialData ?? undefined}
        />
      </div>
    </div>
  );
}
