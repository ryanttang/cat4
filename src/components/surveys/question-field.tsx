"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SurveyQuestion } from "@/lib/db/schema";
import {
  getChoiceOptions,
  getNumericLabels,
} from "@/lib/surveys/results";
import { getRatingMax, getScaleRange } from "@/lib/surveys/constants";
import { cn } from "@/lib/utils";

type QuestionFieldProps = {
  question: SurveyQuestion;
  index: number;
  value: unknown;
  onChange: (value: unknown) => void;
  variant?: "survey" | "poll";
};

export function QuestionField({
  question,
  index,
  value,
  onChange,
  variant = "survey",
}: QuestionFieldProps) {
  const isPoll = variant === "poll";
  const options = getChoiceOptions(question);
  const labels = getNumericLabels(question);

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-cat4-surface p-6",
        isPoll && "p-8"
      )}
    >
      <Label className={cn("text-base", isPoll && "text-lg font-semibold")}>
        {index + 1}. {question.questionText}
        {question.required && <span className="text-red-500"> *</span>}
      </Label>

      {(question.type === "text" || question.type === "feedback") && (
        <Textarea
          className="mt-3"
          required={question.required}
          placeholder={question.options?.[0] ?? (question.type === "feedback" ? "Share your feedback..." : undefined)}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          rows={question.type === "feedback" ? 5 : 3}
        />
      )}

      {question.type === "short_text" && (
        <Input
          className="mt-3"
          required={question.required}
          placeholder={question.options?.[0]}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {question.type === "email" && (
        <Input
          type="email"
          className="mt-3"
          required={question.required}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {question.type === "number" && (
        <Input
          type="number"
          className="mt-3"
          required={question.required}
          min={question.options?.[0]}
          max={question.options?.[1]}
          value={value === undefined || value === null ? "" : String(value)}
          onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
        />
      )}

      {(question.type === "single_choice" || question.type === "yes_no") &&
        (isPoll ? (
          <div className="mt-4 grid gap-3">
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                className={cn(
                  "rounded-lg border px-4 py-3 text-left text-sm font-medium transition-colors",
                  value === opt
                    ? "border-cat4-blue bg-cat4-blue text-white"
                    : "border-border hover:border-cat4-blue hover:bg-cat4-blue/10"
                )}
                onClick={() => onChange(opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-3 space-y-2">
            {options.map((opt) => (
              <label key={opt} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={question.id}
                  value={opt}
                  required={question.required}
                  checked={value === opt}
                  onChange={() => onChange(opt)}
                />
                <span className="text-sm">{opt}</span>
              </label>
            ))}
          </div>
        ))}

      {question.type === "dropdown" && (
        <Select
          value={(value as string) ?? ""}
          onValueChange={onChange}
          required={question.required}
        >
          <SelectTrigger className="mt-3">
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            {options.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {question.type === "multi_choice" &&
        (isPoll ? (
          <div className="mt-4 grid gap-3">
            {options.map((opt) => {
              const selected = ((value as string[]) ?? []).includes(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  className={cn(
                    "rounded-lg border px-4 py-3 text-left text-sm font-medium transition-colors",
                    selected
                      ? "border-cat4-blue bg-cat4-blue text-white"
                      : "border-border hover:border-cat4-blue hover:bg-cat4-blue/10"
                  )}
                  onClick={() => {
                    const current = (value as string[]) ?? [];
                    if (selected) {
                      onChange(current.filter((item) => item !== opt));
                    } else {
                      onChange([...current, opt]);
                    }
                  }}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="mt-3 space-y-2">
            {options.map((opt) => (
              <label key={opt} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  value={opt}
                  checked={((value as string[]) ?? []).includes(opt)}
                  onChange={(e) => {
                    const current = (value as string[]) ?? [];
                    if (e.target.checked) {
                      onChange([...current, opt]);
                    } else {
                      onChange(current.filter((item) => item !== opt));
                    }
                  }}
                />
                <span className="text-sm">{opt}</span>
              </label>
            ))}
          </div>
        ))}

      {question.type === "rating" && (
        <div className="mt-3 flex flex-wrap gap-2">
          {Array.from({ length: getRatingMax(question.options) }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full border text-sm font-medium",
                value === n
                  ? "border-cat4-blue bg-cat4-blue text-white"
                  : "border-border hover:border-cat4-blue",
                isPoll && "h-12 w-12 text-base"
              )}
              onClick={() => onChange(n)}
            >
              {n}
            </button>
          ))}
        </div>
      )}

      {question.type === "scale" && (
        <div className="mt-3">
          <input
            type="range"
            min={getScaleRange(question.options).min}
            max={getScaleRange(question.options).max}
            className="w-full"
            value={value === undefined || value === null ? getScaleRange(question.options).min : Number(value)}
            onChange={(e) => onChange(Number(e.target.value))}
          />
          <div className="mt-1 flex justify-between text-xs text-cat4-light/50">
            <span>{labels.min}</span>
            <span className="font-medium text-cat4-light">
              {value === undefined || value === null ? "—" : String(value)}
            </span>
            <span>{labels.max}</span>
          </div>
        </div>
      )}

      {question.type === "nps" && (
        <div className="mt-3">
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 11 }, (_, i) => i).map((n) => (
              <button
                key={n}
                type="button"
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-md border text-sm",
                  value === n
                    ? "border-cat4-blue bg-cat4-blue text-white"
                    : "border-border hover:border-cat4-blue"
                )}
                onClick={() => onChange(n)}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-xs text-cat4-light/50">
            <span>{labels.min}</span>
            <span>{labels.max}</span>
          </div>
        </div>
      )}
    </div>
  );
}
