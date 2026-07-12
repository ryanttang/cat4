"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdminPageHeader, adminTableWrapClass } from "@/components/admin/admin-ui";
import { AdminFormDialog, useAdminFormDialog } from "@/components/admin/admin-form-dialog";
import { PollAdminForm } from "@/components/admin/poll-admin-form";
import type { Survey, SurveyQuestion } from "@/lib/db/schema";

type PollsAdminProps = {
  polls: Survey[];
  responseCounts: Record<string, number>;
  questionsBySurveyId: Record<string, SurveyQuestion[]>;
};

export function PollsAdmin({ polls, responseCounts, questionsBySurveyId }: PollsAdminProps) {
  const router = useRouter();
  const dialog = useAdminFormDialog<Survey>();
  const [activePoll, setActivePoll] = useState<Survey | null>(null);

  const pollInDialog = activePoll ?? dialog.editing;

  function handleOpenChange(open: boolean) {
    if (!open) {
      dialog.close();
      setActivePoll(null);
    }
  }

  function handleSuccess() {
    dialog.close();
    setActivePoll(null);
    router.refresh();
  }

  function handleCreated(poll: Survey) {
    setActivePoll(poll);
  }

  function openCreate() {
    setActivePoll(null);
    dialog.openCreate();
  }

  function openEdit(poll: Survey) {
    setActivePoll(null);
    dialog.openEdit(poll);
  }

  return (
    <>
      <AdminPageHeader
        title="Polls"
        description="Create quick polls with live results. Share a link and watch votes come in."
      >
        <Button type="button" onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Create Poll
        </Button>
      </AdminPageHeader>

      <div className={adminTableWrapClass}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left">
              <th className="p-4">Title</th>
              <th className="p-4">Status</th>
              <th className="p-4">Votes</th>
              <th className="p-4">Live Results</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {polls.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  No polls yet. Create your first poll to get started.
                </td>
              </tr>
            ) : (
              polls.map((poll) => (
                <tr key={poll.id} className="border-b border-border/50 transition-colors hover:bg-muted/30">
                  <td className="p-4 font-medium">{poll.title}</td>
                  <td className="p-4">
                    <Badge variant={poll.status === "published" ? "success" : "secondary"}>
                      {poll.status}
                    </Badge>
                  </td>
                  <td className="p-4">{responseCounts[poll.id] ?? 0}</td>
                  <td className="p-4">
                    {poll.publicResultsEnabled ? (
                      <Badge variant="outline">Public</Badge>
                    ) : (
                      <span className="text-muted-foreground">Admin only</span>
                    )}
                  </td>
                  <td className="space-x-2 p-4">
                    <Button type="button" variant="ghost" size="sm" onClick={() => openEdit(poll)}>
                      Edit
                    </Button>
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/admin/polls/${poll.id}/results`}>Live Results</Link>
                    </Button>
                    {poll.publicResultsEnabled && (
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/poll/${poll.slug}/results`} target="_blank">
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
        title={pollInDialog ? "Edit Poll" : "Create Poll"}
        size="wide"
      >
        <PollAdminForm
          key={pollInDialog?.id ?? "new"}
          survey={pollInDialog ?? undefined}
          questions={pollInDialog ? questionsBySurveyId[pollInDialog.id] ?? [] : []}
          dialog
          onSuccess={handleSuccess}
          onCreated={handleCreated}
          onQuestionsChange={() => router.refresh()}
        />
      </AdminFormDialog>
    </>
  );
}
