"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResultsDisplay } from "@/components/surveys/results-display";
import type { SurveyResultsSummary } from "@/lib/surveys/results";

type LiveResultsProps = {
  surveyId: string;
  refreshSeconds?: number;
  showTextResponses?: boolean;
  initialData?: SurveyResultsSummary;
};

export function LiveResults({
  surveyId,
  refreshSeconds = 5,
  showTextResponses = false,
  initialData,
}: LiveResultsProps) {
  const [data, setData] = useState<SurveyResultsSummary | null>(initialData ?? null);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(
    initialData ? new Date(initialData.updatedAt) : null
  );

  const fetchResults = useCallback(async () => {
    try {
      const response = await fetch(`/api/surveys/${surveyId}/results`, {
        cache: "no-store",
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to load results");
      }
      const json = (await response.json()) as SurveyResultsSummary;
      setData(json);
      setLastUpdated(new Date(json.updatedAt));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load results");
    } finally {
      setLoading(false);
    }
  }, [surveyId]);

  useEffect(() => {
    void fetchResults();
    const interval = window.setInterval(() => {
      void fetchResults();
    }, refreshSeconds * 1000);
    return () => window.clearInterval(interval);
  }, [fetchResults, refreshSeconds]);

  if (loading && !data) {
    return <p className="text-sm text-muted-foreground">Loading results...</p>;
  }

  if (error && !data) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (!data) {
    return <p className="text-sm text-muted-foreground">No results available.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {data.totalResponses} total response{data.totalResponses === 1 ? "" : "s"}
          {lastUpdated && (
            <span className="ml-2">
              · Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
            Live
          </span>
          <Button type="button" variant="ghost" size="sm" onClick={() => void fetchResults()}>
            <RefreshCw className="mr-1 h-3 w-3" />
            Refresh
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-amber-600">{error}</p>}

      <ResultsDisplay questions={data.questions} showTextResponses={showTextResponses} />
    </div>
  );
}
