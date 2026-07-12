import { notFound, redirect } from "next/navigation";
import { getSurveyBySlug, getSurveyQuestions } from "@/lib/data";
import { SurveyForm } from "@/components/marketing/survey-form";
import { SectionLabel } from "@/components/marketing/section-label";
import Link from "next/link";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const survey = await getSurveyBySlug(slug);
  return { title: survey?.title ?? "Survey" };
}

export default async function SurveyPage({ params }: Props) {
  const { slug } = await params;
  const survey = await getSurveyBySlug(slug);

  if (!survey || survey.status === "archived") notFound();
  if (survey.type === "poll") redirect(`/poll/${survey.slug}`);

  const questions = await getSurveyQuestions(survey.id);

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionLabel>{survey.type}</SectionLabel>
      <h1 className="mt-3 text-4xl font-bold text-cat4-light">{survey.title}</h1>
      {survey.description && <p className="mt-3 text-lg text-cat4-light/70">{survey.description}</p>}

      {survey.publicResultsEnabled && (
        <p className="mt-4 text-sm text-cat4-light/60">
          <Link href={`/survey/${survey.slug}/results`} className="text-cat4-blue underline">
            View live results
          </Link>
        </p>
      )}

      <div className="mt-10">
        <SurveyForm survey={survey} questions={questions} />
      </div>
    </div>
  );
}
