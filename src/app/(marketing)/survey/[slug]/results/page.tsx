import { notFound } from "next/navigation";
import Link from "next/link";
import { getSurveyBySlug, getSurveyResultsSummary } from "@/lib/data";
import { LiveResults } from "@/components/surveys/live-results";
import { SectionLabel } from "@/components/marketing/section-label";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const survey = await getSurveyBySlug(slug);
  return { title: survey ? `${survey.title} — Results` : "Survey Results" };
}

export default async function PublicSurveyResultsPage({ params }: Props) {
  const { slug } = await params;
  const survey = await getSurveyBySlug(slug);

  if (!survey || survey.status === "archived" || survey.type === "poll") notFound();
  if (!survey.publicResultsEnabled) notFound();

  const initialData = await getSurveyResultsSummary(survey.id);

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionLabel>Live Results</SectionLabel>
      <h1 className="mt-3 text-4xl font-bold text-cat4-light">{survey.title}</h1>
      {survey.description && <p className="mt-3 text-lg text-cat4-light/70">{survey.description}</p>}

      <p className="mt-4 text-sm text-cat4-light/60">
        <Link href={`/survey/${survey.slug}`} className="text-cat4-blue underline">
          Take the survey
        </Link>
      </p>

      <div className="mt-10">
        <LiveResults
          surveyId={survey.id}
          refreshSeconds={survey.settings?.resultsRefreshSeconds ?? 5}
          showTextResponses={false}
          initialData={initialData ?? undefined}
        />
      </div>
    </div>
  );
}
