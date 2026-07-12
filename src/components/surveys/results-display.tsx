"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { QuestionResult } from "@/lib/surveys/results";

type ResultsDisplayProps = {
  questions: QuestionResult[];
  showTextResponses?: boolean;
};

function BarRow({ label, count, total }: { label: string; count: number; total: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <div className="flex justify-between text-sm">
          <span>{label}</span>
          <span className="text-muted-foreground">
            {count} ({pct.toFixed(0)}%)
          </span>
        </div>
        <div className="mt-1 h-2 rounded-full bg-muted">
          <div className="h-2 rounded-full bg-cat4-blue transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}

export function ResultsDisplay({ questions, showTextResponses = false }: ResultsDisplayProps) {
  return (
    <div className="space-y-6">
      {questions.map((question) => (
        <Card key={question.questionId}>
          <CardHeader>
            <CardTitle className="text-base">{question.questionText}</CardTitle>
            <p className="text-xs text-muted-foreground">
              {question.typeLabel} · {question.result.total} answers
            </p>
          </CardHeader>
          <CardContent>
            {question.result.kind === "choice" && (
              Object.keys(question.result.tally).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(question.result.tally)
                    .sort((a, b) => b[1] - a[1])
                    .map(([answer, count]) => (
                      <BarRow
                        key={answer}
                        label={answer}
                        count={count}
                        total={question.result.total}
                      />
                    ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No responses yet.</p>
              )
            )}

            {question.result.kind === "numeric" && (
              <div className="space-y-4">
                {question.result.average !== null && (
                  <div className="flex gap-6 text-sm">
                    <div>
                      <span className="text-muted-foreground">Average: </span>
                      <span className="font-semibold">{question.result.average.toFixed(1)}</span>
                    </div>
                    {question.result.min !== null && question.result.max !== null && (
                      <div>
                        <span className="text-muted-foreground">Range: </span>
                        <span className="font-semibold">
                          {question.result.min} – {question.result.max}
                        </span>
                      </div>
                    )}
                  </div>
                )}
                {Object.keys(question.result.tally).length > 0 ? (
                  <div className="space-y-2">
                    {Object.entries(question.result.tally)
                      .sort((a, b) => Number(a[0]) - Number(b[0]))
                      .map(([answer, count]) => (
                        <BarRow
                          key={answer}
                          label={answer}
                          count={count}
                          total={question.result.total}
                        />
                      ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No responses yet.</p>
                )}
              </div>
            )}

            {question.result.kind === "text" && (
              showTextResponses ? (
                question.result.responses.length > 0 ? (
                  <ul className="space-y-2">
                    {question.result.responses.map((response, idx) => (
                      <li
                        key={`${question.questionId}-${idx}`}
                        className="rounded-md border border-border bg-muted/30 p-3 text-sm"
                      >
                        {response}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No responses yet.</p>
                )
              ) : (
                <p className="text-sm text-muted-foreground">
                  {question.result.total} text response{question.result.total === 1 ? "" : "s"}
                </p>
              )
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
