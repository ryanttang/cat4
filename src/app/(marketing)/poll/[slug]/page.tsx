import { notFound } from "next/navigation";
import Link from "next/link";
import { getSurveyBySlug, getSurveyQuestions } from "@/lib/data";
import { PollForm } from "@/components/marketing/poll-form";
import { SectionLabel } from "@/components/marketing/section-label";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const poll = await getSurveyBySlug(slug);
  return { title: poll?.title ?? "Poll" };
}

export default async function PollPage({ params }: Props) {
  const { slug } = await params;
  const poll = await getSurveyBySlug(slug);

  if (!poll || poll.status === "archived" || poll.type !== "poll") notFound();

  const questions = await getSurveyQuestions(poll.id);

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionLabel>Poll</SectionLabel>
      <h1 className="mt-3 text-4xl font-bold text-cat4-light">{poll.title}</h1>
      {poll.description && <p className="mt-3 text-lg text-cat4-light/70">{poll.description}</p>}

      {poll.publicResultsEnabled && (
        <p className="mt-4 text-sm text-cat4-light/60">
          <Link href={`/poll/${poll.slug}/results`} className="text-cat4-blue underline">
            View live results
          </Link>
        </p>
      )}

      <div className="mt-10">
        <PollForm poll={poll} questions={questions} />
      </div>
    </div>
  );
}
