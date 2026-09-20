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
import {
  SURVEY_CONTENT_TYPES,
  SURVEY_PROFILE_FIELD_PRESETS,
  QUESTION_TYPES,
  createSurveyProfileField,
  defaultSurveySettingsForCreate,
  mergeSurveySettings,
  questionNeedsOptions,
} from "@/lib/surveys/constants";
import { slugify, formatDateTime } from "@/lib/utils";
import type { Survey, SurveyProfileField, SurveyQuestion } from "@/lib/db/schema";
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

export function SurveyAdminForm({
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
  const [type, setType] = useState<"survey" | "questionnaire">(
    survey?.type === "questionnaire" ? "questionnaire" : "survey"
  );
  const [status, setStatus] = useState(survey?.status ?? "draft");
  const [description, setDescription] = useState(survey?.description ?? "");
  const [emailRequired, setEmailRequired] = useState(survey?.emailRequired ?? false);
  const [publicResultsEnabled, setPublicResultsEnabled] = useState(survey?.publicResultsEnabled ?? false);
  const [showResultsAfterVote, setShowResultsAfterVote] = useState(survey?.showResultsAfterVote ?? false);
  const [startsAt, setStartsAt] = useState(toDatetimeLocal(survey?.startsAt));
  const [endsAt, setEndsAt] = useState(toDatetimeLocal(survey?.endsAt));
  const [settings, setSettings] = useState(() =>
    mergeSurveySettings(survey ? survey.settings : defaultSurveySettingsForCreate())
  );
  const [loading, setLoading] = useState(false);

  function updateSetting<K extends keyof typeof settings>(key: K, value: (typeof settings)[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  function addProfileField(preset?: Pick<SurveyProfileField, "key" | "label" | "type">) {
    setSettings((prev) => {
      if (preset && prev.profileFields.some((field) => field.key === preset.key)) {
        return prev;
      }
      return {
        ...prev,
        profileFields: [...prev.profileFields, createSurveyProfileField(preset)],
      };
    });
  }

  function updateProfileField(id: string, patch: Partial<SurveyProfileField>) {
    setSettings((prev) => ({
      ...prev,
      profileFields: prev.profileFields.map((field) =>
        field.id === id ? { ...field, ...patch } : field
      ),
    }));
  }

  function removeProfileField(id: string) {
    setSettings((prev) => ({
      ...prev,
      profileFields: prev.profileFields.filter((field) => field.id !== id),
    }));
  }

  const [qText, setQText] = useState("");
  const [qType, setQType] = useState<SurveyQuestion["type"]>("single_choice");
  const [qOptions, setQOptions] = useState("");
  const [qRequired, setQRequired] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const data = {
      title,
      slug: slug || slugify(title),
      type,
      status,
      description,
      emailRequired,
      publicResultsEnabled,
      showResultsAfterVote,
      settings,
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
          type,
          status,
          description: description || null,
          emailRequired,
          publicResultsEnabled,
          showResultsAfterVote,
          settings,
          startsAt: startsAt ? new Date(startsAt) : null,
          endsAt: endsAt ? new Date(endsAt) : null,
          createdById: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      } else if (onSuccess) {
        onSuccess();
      } else if (!survey && result.id) {
        router.push(`/admin/surveys/${result.id}`);
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
          <Link href="/admin/surveys">
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
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SURVEY_CONTENT_TYPES.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
        </div>
        <div>
          <Label>Description</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1" />
          <p className="mt-1 text-xs text-muted-foreground">
            Internal / fallback subtext if the public subtext below is empty.
          </p>
        </div>
        <div>
          <Label>Header</Label>
          <Input
            value={settings.headline}
            onChange={(e) => updateSetting("headline", e.target.value)}
            className="mt-1"
            placeholder={title || "Shown at the top of the public survey"}
          />
        </div>
        <div>
          <Label>Subtext</Label>
          <Textarea
            value={settings.subtext}
            onChange={(e) => updateSetting("subtext", e.target.value)}
            className="mt-1"
            placeholder="Short intro under the header"
          />
        </div>
        <div>
          <Label>Disclaimer</Label>
          <Textarea
            value={settings.disclaimerText}
            onChange={(e) => updateSetting("disclaimerText", e.target.value)}
            className="mt-1 min-h-28"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Shown above the consent checkboxes. Starts with the brand default.
          </p>
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
            <Switch checked={emailRequired} onCheckedChange={setEmailRequired} />
            <Label>Email Required</Label>
          </div>
          {emailRequired && (
            <div>
              <Label>Email field label</Label>
              <Input
                value={settings.emailLabel}
                onChange={(e) => updateSetting("emailLabel", e.target.value)}
                className="mt-1"
                placeholder="Email"
              />
            </div>
          )}
          <div className="flex items-center gap-2">
            <Switch checked={publicResultsEnabled} onCheckedChange={setPublicResultsEnabled} />
            <Label>Public Live Results Page</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={showResultsAfterVote} onCheckedChange={setShowResultsAfterVote} />
            <Label>Show Results After Submission</Label>
          </div>
        </div>

        <div className="space-y-4 rounded-md border border-border p-4">
          <div>
            <h3 className="text-sm font-semibold">Contact fields</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Collected next to email and stored with each response. Labels are shown on the
              public form.
            </p>
          </div>
          {settings.profileFields.map((field) => (
            <div key={field.id} className="grid gap-3 rounded-md border border-border p-3 sm:grid-cols-[1fr_8rem_auto]">
              <div>
                <Label>Label</Label>
                <Input
                  value={field.label}
                  onChange={(e) => {
                    const label = e.target.value;
                    const isPreset = SURVEY_PROFILE_FIELD_PRESETS.some((preset) => preset.key === field.key);
                    updateProfileField(field.id, {
                      label,
                      key: isPreset ? field.key : slugify(label) || field.key,
                    });
                  }}
                  className="mt-1"
                />
              </div>
              <div className="flex items-end gap-2 pb-1">
                <Switch
                  checked={field.required}
                  onCheckedChange={(required) => updateProfileField(field.id, { required })}
                />
                <Label>Required</Label>
              </div>
              <div className="flex items-end">
                <Button type="button" variant="ghost" size="icon" onClick={() => removeProfileField(field.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          <div className="flex flex-wrap gap-2">
            {SURVEY_PROFILE_FIELD_PRESETS.map((preset) => (
              <Button
                key={preset.key}
                type="button"
                variant="outline"
                size="sm"
                disabled={settings.profileFields.some((field) => field.key === preset.key)}
                onClick={() => addProfileField(preset)}
              >
                <Plus className="mr-1 h-3 w-3" />
                {preset.label}
              </Button>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => addProfileField()}>
              <Plus className="mr-1 h-3 w-3" />
              Custom field
            </Button>
          </div>
        </div>

        <div className="space-y-4 rounded-md border border-border p-4">
          <div>
            <h3 className="text-sm font-semibold">Consent</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Each survey starts with complete brand default copy. Edit it here for this page
              only.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={settings.participationConsentEnabled}
              onCheckedChange={(value) => updateSetting("participationConsentEnabled", value)}
            />
            <Label>Require participation agreement</Label>
          </div>
          <div>
            <Label>Participation checkbox copy</Label>
            <Textarea
              value={settings.participationConsentText}
              onChange={(e) => updateSetting("participationConsentText", e.target.value)}
              className="mt-1 min-h-24"
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={settings.marketingConsentEnabled}
              onCheckedChange={(value) => updateSetting("marketingConsentEnabled", value)}
            />
            <Label>Show marketing opt-in</Label>
          </div>
          {settings.marketingConsentEnabled && (
            <div className="flex items-center gap-2">
              <Switch
                checked={settings.marketingConsentRequired}
                onCheckedChange={(value) => updateSetting("marketingConsentRequired", value)}
              />
              <Label>Require marketing opt-in to submit</Label>
            </div>
          )}
          <div>
            <Label>Marketing checkbox copy</Label>
            <Textarea
              value={settings.marketingConsentText}
              onChange={(e) => updateSetting("marketingConsentText", e.target.value)}
              className="mt-1 min-h-24"
            />
          </div>
        </div>
        {survey && (
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              Public URL:{" "}
              <Link href={`/survey/${survey.slug}`} className="text-cat4-blue underline" target="_blank">
                /survey/{survey.slug}
              </Link>
            </p>
            <p>
              <Link href={`/admin/surveys/${survey.id}/responses`} className="text-cat4-blue underline">
                View responses
              </Link>
            </p>
            {publicResultsEnabled && (
              <p>
                Results URL:{" "}
                <Link href={`/survey/${survey.slug}/results`} className="text-cat4-blue underline" target="_blank">
                  /survey/{survey.slug}/results
                </Link>
              </p>
            )}
            {survey.startsAt && <p>Starts: {formatDateTime(survey.startsAt)}</p>}
            {survey.endsAt && <p>Ends: {formatDateTime(survey.endsAt)}</p>}
          </div>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : survey ? "Update Survey" : "Create Survey"}
        </Button>
      </form>

      {survey && (
        <div className={`space-y-4 p-4 ${adminPanelClass}`}>
          <h3 className="font-semibold">Questions</h3>
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
                {QUESTION_TYPES.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {questionNeedsOptions(qType) && (
              <Textarea
                placeholder="Options (one per line)"
                value={qOptions}
                onChange={(e) => setQOptions(e.target.value)}
              />
            )}
            {(qType === "feedback" || qType === "short_text") && (
              <Input
                placeholder="Placeholder text (optional)"
                value={qOptions}
                onChange={(e) => setQOptions(e.target.value)}
              />
            )}
            {qType === "number" && (
              <div className="grid gap-2 sm:grid-cols-2">
                <Input placeholder="Min (optional)" value={qOptions.split("\n")[0] ?? ""} onChange={(e) => setQOptions(`${e.target.value}\n${qOptions.split("\n")[1] ?? ""}`)} />
                <Input placeholder="Max (optional)" value={qOptions.split("\n")[1] ?? ""} onChange={(e) => setQOptions(`${qOptions.split("\n")[0] ?? ""}\n${e.target.value}`)} />
              </div>
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
