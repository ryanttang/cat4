"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { surveySubmitAction } from "@/lib/actions/public";
import { QuestionField } from "@/components/surveys/question-field";
import { isSurveyActive } from "@/lib/surveys/constants";
import type { Survey, SurveyQuestion } from "@/lib/db/schema";

type PollFormProps = {
  poll: Survey;
  questions: SurveyQuestion[];
};

function validateAnswers(questions: SurveyQuestion[], answers: Record<string, unknown>): string | null {
  for (const question of questions) {
    if (!question.required) continue;
    const value = answers[question.id];
    if (value === undefined || value === null || value === "") {
      return `Please make a selection for: ${question.questionText}`;
    }
    if (Array.isArray(value) && value.length === 0) {
      return `Please select at least one option for: ${question.questionText}`;
    }
  }
  return null;
}

export function PollForm({ poll, questions }: PollFormProps) {
  const [email, setEmail] = useState("");
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [hasVoted, setHasVoted] = useState(false);

  const isActive = isSurveyActive(poll);
  const anonymousOnly = poll.settings?.anonymousOnly ?? true;
  const showEmail = !anonymousOnly && poll.emailRequired;
  const voteStorageKey = `cat4-poll-vote-${poll.id}`;

  useEffect(() => {
    if (!poll.settings?.allowMultipleVotes && typeof window !== "undefined") {
      setHasVoted(window.localStorage.getItem(voteStorageKey) === "1");
    }
  }, [poll.id, poll.settings?.allowMultipleVotes, voteStorageKey]);

  function setAnswer(questionId: string, value: unknown) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const validationError = validateAnswers(questions, answers);
    if (validationError) {
      setStatus("error");
      setErrorMsg(validationError);
      return;
    }

    setStatus("loading");

    const answerList = questions.map((q) => ({
      questionId: q.id,
      answer: answers[q.id] ?? null,
    }));

    const result = await surveySubmitAction({
      surveyId: poll.id,
      email: showEmail ? email : undefined,
      answers: answerList,
    });

    if (result.success) {
      if (!poll.settings?.allowMultipleVotes && typeof window !== "undefined") {
        window.localStorage.setItem(voteStorageKey, "1");
        setHasVoted(true);
      }
      setStatus("success");
    } else {
      setStatus("error");
      setErrorMsg(result.error ?? "Something went wrong");
    }
  }

  if (!isActive) {
    return (
      <div className="rounded-xl border border-border bg-cat4-surface p-8 text-center">
        <p className="text-cat4-light/70">This poll is not currently active.</p>
        {poll.publicResultsEnabled && (
          <Button asChild className="mt-4" variant="outline">
            <Link href={`/poll/${poll.slug}/results`}>View Results</Link>
          </Button>
        )}
      </div>
    );
  }

  if (hasVoted && status !== "success") {
    return (
      <div className="rounded-xl border border-border bg-cat4-surface p-8 text-center">
        <h2 className="text-xl font-bold text-cat4-light">You already voted</h2>
        <p className="mt-2 text-cat4-light/70">Thanks for participating in this poll.</p>
        {(poll.showResultsAfterVote || poll.publicResultsEnabled) && (
          <Button asChild className="mt-4">
            <Link href={`/poll/${poll.slug}/results`}>View Live Results</Link>
          </Button>
        )}
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-8 text-center">
        <h2 className="text-xl font-bold text-green-800">Vote recorded!</h2>
        <p className="mt-2 text-green-700">Thanks for participating.</p>
        {(poll.showResultsAfterVote || poll.publicResultsEnabled) && (
          <Button asChild className="mt-4">
            <Link href={`/poll/${poll.slug}/results`}>View Live Results</Link>
          </Button>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {showEmail && (
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1"
          />
        </div>
      )}

      {questions.map((q, idx) => (
        <QuestionField
          key={q.id}
          question={q}
          index={idx}
          value={answers[q.id]}
          onChange={(value) => setAnswer(q.id, value)}
          variant="poll"
        />
      ))}

      {questions.length === 0 && (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-cat4-light/60">
          This poll has no questions yet.
        </div>
      )}

      {status === "error" && <p className="text-sm text-red-600">{errorMsg}</p>}

      <div className="flex flex-wrap items-center gap-4">
        {questions.length > 0 && (
          <Button type="submit" disabled={status === "loading"} size="lg">
            {status === "loading" ? "Submitting vote..." : "Submit Vote"}
          </Button>
        )}
        {poll.publicResultsEnabled && (
          <Button asChild variant="ghost">
            <Link href={`/poll/${poll.slug}/results`}>View Live Results</Link>
          </Button>
        )}
      </div>
    </form>
  );
}
