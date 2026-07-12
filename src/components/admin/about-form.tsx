"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { createAboutSection, updateAboutSection } from "@/lib/actions/admin";
import type { aboutSections } from "@/lib/db/schema";
import { ChevronLeft } from "lucide-react";
import type { AdminDialogFormProps } from "@/components/admin/admin-form-dialog";

type Section = typeof aboutSections.$inferSelect;

export function AboutForm({
  section,
  dialog,
  onSuccess,
}: AdminDialogFormProps & { section?: Section }) {
  const router = useRouter();
  const [title, setTitle] = useState(section?.title ?? "");
  const [body, setBody] = useState(section?.body ?? "");
  const [sortOrder, setSortOrder] = useState(section?.sortOrder ?? 0);
  const [published, setPublished] = useState(section?.published ?? true);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const data = { title, body, sortOrder, published };
    const result = section ? await updateAboutSection(section.id, data) : await createAboutSection(data);
    if (result.success) {
      if (onSuccess) onSuccess();
      else {
        router.push("/admin/about");
        router.refresh();
      }
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className={dialog ? "space-y-4" : "max-w-2xl space-y-4"}>
      {!dialog && (
        <Button asChild variant="ghost" className="-ml-2"><Link href="/admin/about"><ChevronLeft className="mr-1 h-4 w-4" />Back</Link></Button>
      )}
      <div><Label>Title</Label><Input required value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1" /></div>
      <div><Label>Body</Label><Textarea rows={6} required value={body} onChange={(e) => setBody(e.target.value)} className="mt-1" /></div>
      <div><Label>Sort Order</Label><Input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} className="mt-1 w-24" /></div>
      <div className="flex items-center gap-2"><Switch checked={published} onCheckedChange={setPublished} /><Label>Published</Label></div>
      <Button type="submit" disabled={loading}>{loading ? "Saving..." : section ? "Update" : "Create"}</Button>
    </form>
  );
}
