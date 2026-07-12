"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdminPageHeader, adminTableWrapClass } from "@/components/admin/admin-ui";
import { AdminFormDialog, useAdminFormDialog } from "@/components/admin/admin-form-dialog";
import { SurveyAdminForm } from "@/components/admin/survey-admin-form";
import type { Survey, SurveyQuestion } from "@/lib/db/schema";

type SurveysAdminProps = {
  surveys: Survey[];
  responseCounts: Record<string, number>;
  questionsBySurveyId: Record<string, SurveyQuestion[]>;
};

export function SurveysAdmin({ surveys, responseCounts, questionsBySurveyId }: SurveysAdminProps) {
  const router = useRouter();
  const dialog = useAdminFormDialog<Survey>();
  const [activeSurvey, setActiveSurvey] = useState<Survey | null>(null);

  const surveyInDialog = activeSurvey ?? dialog.editing;

  function handleOpenChange(open: boolean) {
    if (!open) {
      dialog.close();
      setActiveSurvey(null);
    }
  }

  function handleSuccess() {
    dialog.close();
    setActiveSurvey(null);
    router.refresh();
  }

  function handleCreated(survey: Survey) {
    setActiveSurvey(survey);
  }

  function openCreate() {
    setActiveSurvey(null);
    dialog.openCreate();
  }

  function openEdit(survey: Survey) {
    setActiveSurvey(null);
    dialog.openEdit(survey);
  }

  return (
    <>
      <AdminPageHeader
        title="Surveys"
        description="Create multi-question surveys with ratings, feedback, NPS, and more."
      >
        <Button type="button" onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Create Survey
        </Button>
      </AdminPageHeader>

      <div className={adminTableWrapClass}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left">
              <th className="p-4">Title</th>
              <th className="p-4">Type</th>
              <th className="p-4">Status</th>
              <th className="p-4">Responses</th>
              <th className="p-4">Live Results</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {surveys.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                  No surveys yet. Create your first survey to get started.
                </td>
              </tr>
            ) : (
              surveys.map((survey) => (
                <tr key={survey.id} className="border-b border-border/50 transition-colors hover:bg-muted/30">
                  <td className="p-4 font-medium">{survey.title}</td>
                  <td className="p-4 capitalize">{survey.type}</td>
                  <td className="p-4">
                    <Badge variant={survey.status === "published" ? "success" : "secondary"}>
                      {survey.status}
                    </Badge>
                  </td>
                  <td className="p-4">{responseCounts[survey.id] ?? 0}</td>
                  <td className="p-4">
                    {survey.publicResultsEnabled ? (
                      <Badge variant="outline">Public</Badge>
                    ) : (
                      <span className="text-muted-foreground">Admin only</span>
                    )}
                  </td>
                  <td className="space-x-2 p-4">
                    <Button type="button" variant="ghost" size="sm" onClick={() => openEdit(survey)}>
                      Edit
                    </Button>
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/admin/surveys/${survey.id}/results`}>Live Results</Link>
                    </Button>
                    {survey.publicResultsEnabled && (
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/survey/${survey.slug}/results`} target="_blank">
                          Public
                        </Link>
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AdminFormDialog
        open={dialog.open}
        onOpenChange={handleOpenChange}
        title={surveyInDialog ? "Edit Survey" : "Create Survey"}
        size="wide"
      >
        <SurveyAdminForm
          key={surveyInDialog?.id ?? "new"}
          survey={surveyInDialog ?? undefined}
          questions={surveyInDialog ? questionsBySurveyId[surveyInDialog.id] ?? [] : []}
          dialog
          onSuccess={handleSuccess}
          onCreated={handleCreated}
          onQuestionsChange={() => router.refresh()}
        />
      </AdminFormDialog>
    </>
  );
}
