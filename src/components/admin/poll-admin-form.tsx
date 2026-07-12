"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createSurvey, updateSurvey, addSurveyQuestion, deleteSurveyQuestion } from "@/lib/actions/admin";
import { QUESTION_TYPES, isPollQuestionType } from "@/lib/surveys/constants";
import { slugify, formatDateTime } from "@/lib/utils";
import type { Survey, SurveyQuestion } from "@/lib/db/schema";
import { ChevronLeft, Plus, Trash2 } from "lucide-react";
import { adminPanelClass } from "@/components/admin/admin-ui";
import type { AdminDialogFormProps } from "@/components/admin/admin-form-dialog";

function toDatetimeLocal(value: Date | string | null | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

const POLL_QUESTION_TYPE_OPTIONS = QUESTION_TYPES.filter((item) =>
  isPollQuestionType(item.value)
);

export function PollAdminForm({
  survey,
  questions,
  dialog,
  onSuccess,
  onCreated,
  onQuestionsChange,
}: AdminDialogFormProps & {
  survey?: Survey;
  questions?: SurveyQuestion[];
  onCreated?: (survey: Survey) => void;
  onQuestionsChange?: () => void;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(survey?.title ?? "");
  const [slug, setSlug] = useState(survey?.slug ?? "");
  const [status, setStatus] = useState(survey?.status ?? "draft");
  const [description, setDescription] = useState(survey?.description ?? "");
  const [emailRequired, setEmailRequired] = useState(survey?.emailRequired ?? false);
  const [publicResultsEnabled, setPublicResultsEnabled] = useState(survey?.publicResultsEnabled ?? true);
  const [showResultsAfterVote, setShowResultsAfterVote] = useState(survey?.showResultsAfterVote ?? true);
  const [allowMultipleVotes, setAllowMultipleVotes] = useState(survey?.settings?.allowMultipleVotes ?? false);
  const [anonymousOnly, setAnonymousOnly] = useState(survey?.settings?.anonymousOnly ?? true);
  const [startsAt, setStartsAt] = useState(toDatetimeLocal(survey?.startsAt));
  const [endsAt, setEndsAt] = useState(toDatetimeLocal(survey?.endsAt));
  const [loading, setLoading] = useState(false);

  const [qText, setQText] = useState("");
  const [qType, setQType] = useState<SurveyQuestion["type"]>("single_choice");
  const [qOptions, setQOptions] = useState("");
  const [qRequired, setQRequired] = useState(true);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const data = {
      title,
      slug: slug || slugify(title),
      type: "poll" as const,
      status,
      description,
      emailRequired: anonymousOnly ? false : emailRequired,
      publicResultsEnabled,
      showResultsAfterVote,
      settings: {
        allowMultipleVotes,
        anonymousOnly,
        resultsRefreshSeconds: 5,
      },
      startsAt: startsAt || null,
      endsAt: endsAt || null,
    };
    const result = survey ? await updateSurvey(survey.id, data) : await createSurvey(data);
    if (result.success) {
      if (!survey && result.id && onCreated) {
        onCreated({
          id: result.id,
          title,
          slug: slug || slugify(title),
          type: "poll",
          status,
          description: description || null,
          emailRequired: anonymousOnly ? false : emailRequired,
          publicResultsEnabled,
          showResultsAfterVote,
          settings: data.settings,
          startsAt: startsAt ? new Date(startsAt) : null,
          endsAt: endsAt ? new Date(endsAt) : null,
          createdById: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      } else if (onSuccess) {
        onSuccess();
      } else {
        router.refresh();
      }
    }
    setLoading(false);
  }

  async function handleAddQuestion() {
    if (!survey || !qText) return;
    const options = qOptions ? qOptions.split("\n").filter(Boolean) : undefined;
    await addSurveyQuestion(survey.id, {
      questionText: qText,
      type: qType,
      options,
      required: qRequired,
      sortOrder: questions?.length ?? 0,
    });
    setQText("");
    setQOptions("");
    if (onQuestionsChange) onQuestionsChange();
    else router.refresh();
  }

  async function handleDeleteQuestion(id: string) {
    await deleteSurveyQuestion(id);
    if (onQuestionsChange) onQuestionsChange();
    else router.refresh();
  }

  return (
    <div className={dialog ? "space-y-8" : "max-w-2xl space-y-8"}>
      {!dialog && (
        <Button asChild variant="ghost" className="-ml-2">
          <Link href="/admin/polls">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back
          </Link>
        </Button>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Title</Label>
            <Input
              required
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (!survey) setSlug(slugify(e.target.value));
              }}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Slug</Label>
            <Input required value={slug} onChange={(e) => setSlug(e.target.value)} className="mt-1" />
          </div>
        </div>
        <div>
          <Label>Status</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Description</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Start Date</Label>
            <Input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label>End Date</Label>
            <Input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} className="mt-1" />
          </div>
        </div>
        <div className="space-y-3 rounded-md border border-border p-4">
          <div className="flex items-center gap-2">
            <Switch checked={anonymousOnly} onCheckedChange={setAnonymousOnly} />
            <Label>Anonymous Voting</Label>
          </div>
          {!anonymousOnly && (
            <div className="flex items-center gap-2">
              <Switch checked={emailRequired} onCheckedChange={setEmailRequired} />
              <Label>Email Required</Label>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Switch checked={publicResultsEnabled} onCheckedChange={setPublicResultsEnabled} />
            <Label>Public Live Results Page</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={showResultsAfterVote} onCheckedChange={setShowResultsAfterVote} />
            <Label>Show Results After Voting</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={allowMultipleVotes} onCheckedChange={setAllowMultipleVotes} />
            <Label>Allow Multiple Votes</Label>
          </div>
        </div>
        {survey && (
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              Public URL:{" "}
              <Link href={`/poll/${survey.slug}`} className="text-cat4-blue underline" target="_blank">
                /poll/{survey.slug}
              </Link>
            </p>
            {publicResultsEnabled && (
              <p>
                Results URL:{" "}
                <Link href={`/poll/${survey.slug}/results`} className="text-cat4-blue underline" target="_blank">
                  /poll/{survey.slug}/results
                </Link>
              </p>
            )}
            {survey.startsAt && <p>Starts: {formatDateTime(survey.startsAt)}</p>}
            {survey.endsAt && <p>Ends: {formatDateTime(survey.endsAt)}</p>}
          </div>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : survey ? "Update Poll" : "Create Poll"}
        </Button>
      </form>

      {survey && (
        <div className={`space-y-4 p-4 ${adminPanelClass}`}>
          <h3 className="font-semibold">Poll Questions</h3>
          <p className="text-xs text-muted-foreground">
            Polls work best with one question, but you can add multiple for multi-step voting.
          </p>
          {questions?.map((q, i) => (
            <div key={q.id} className="flex items-start justify-between rounded-md border border-border bg-background/50 p-3">
              <div>
                <p className="text-sm font-medium">
                  {i + 1}. {q.questionText}
                </p>
                <p className="text-xs capitalize text-muted-foreground">
                  {q.type.replaceAll("_", " ")}
                  {q.required ? " · required" : ""}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => handleDeleteQuestion(q.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <div className="space-y-3 border-t pt-4">
            <h4 className="text-sm font-medium">Add Question</h4>
            <Input placeholder="Question text" value={qText} onChange={(e) => setQText(e.target.value)} />
            <Select value={qType} onValueChange={(v) => setQType(v as typeof qType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {POLL_QUESTION_TYPE_OPTIONS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(qType === "single_choice" || qType === "multi_choice") && (
              <Textarea
                placeholder="Options (one per line)"
                value={qOptions}
                onChange={(e) => setQOptions(e.target.value)}
              />
            )}
            <div className="flex items-center gap-2">
              <Switch checked={qRequired} onCheckedChange={setQRequired} />
              <Label>Required</Label>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={handleAddQuestion}>
              <Plus className="mr-1 h-4 w-4" />
              Add Question
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
