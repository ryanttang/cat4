import { notFound } from "next/navigation";
import Link from "next/link";
import { getSurveyBySlug, getSurveyResultsSummary } from "@/lib/data";
import { LiveResults } from "@/components/surveys/live-results";
import { SectionLabel } from "@/components/marketing/section-label";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const poll = await getSurveyBySlug(slug);
  return { title: poll ? `${poll.title} — Results` : "Poll Results" };
}

export default async function PublicPollResultsPage({ params }: Props) {
  const { slug } = await params;
  const poll = await getSurveyBySlug(slug);

  if (!poll || poll.status === "archived" || poll.type !== "poll") notFound();
  if (!poll.publicResultsEnabled) notFound();

  const initialData = await getSurveyResultsSummary(poll.id);

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionLabel>Live Results</SectionLabel>
      <h1 className="mt-3 text-4xl font-bold text-cat4-light">{poll.title}</h1>
      {poll.description && <p className="mt-3 text-lg text-cat4-light/70">{poll.description}</p>}

      <p className="mt-4 text-sm text-cat4-light/60">
        <Link href={`/poll/${poll.slug}`} className="text-cat4-blue underline">
          Cast your vote
        </Link>
      </p>

      <div className="mt-10">
        <LiveResults
          surveyId={poll.id}
          refreshSeconds={poll.settings?.resultsRefreshSeconds ?? 5}
          showTextResponses={false}
          initialData={initialData ?? undefined}
        />
      </div>
    </div>
  );
}
