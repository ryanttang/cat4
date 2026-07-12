"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { FileUpload } from "@/components/admin/file-upload";
import { createEducation, updateEducation } from "@/lib/actions/admin";
import { slugify } from "@/lib/utils";
import type { EducationArticle } from "@/lib/db/schema";
import { ChevronLeft } from "lucide-react";
import type { AdminDialogFormProps } from "@/components/admin/admin-form-dialog";

export function EducationForm({
  article,
  dialog,
  onSuccess,
}: AdminDialogFormProps & { article?: EducationArticle }) {
  const router = useRouter();
  const [title, setTitle] = useState(article?.title ?? "");
  const [slug, setSlug] = useState(article?.slug ?? "");
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? "");
  const [body, setBody] = useState(article?.body ?? "");
  const [coverImage, setCoverImage] = useState(article?.coverImage ?? "");
  const [published, setPublished] = useState(article?.published ?? false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const data = { title, slug: slug || slugify(title), excerpt, body, coverImage: coverImage || undefined, published };
    const result = article ? await updateEducation(article.id, data) : await createEducation(data);
    if (result.success) {
      if (onSuccess) onSuccess();
      else {
        router.push("/admin/education");
        router.refresh();
      }
    } else { setError(result.error ?? "Failed"); setLoading(false); }
  }

  return (
    <form onSubmit={handleSubmit} className={dialog ? "space-y-4" : "max-w-2xl space-y-4"}>
      {!dialog && (
        <Button asChild variant="ghost" className="-ml-2"><Link href="/admin/education"><ChevronLeft className="mr-1 h-4 w-4" />Back</Link></Button>
      )}
      <div><Label>Title</Label><Input required value={title} onChange={(e) => { setTitle(e.target.value); if (!article) setSlug(slugify(e.target.value)); }} className="mt-1" /></div>
      <div><Label>Slug</Label><Input required value={slug} onChange={(e) => setSlug(e.target.value)} className="mt-1" /></div>
      <div><Label>Excerpt</Label><Textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className="mt-1" /></div>
      <div><Label>Body (Markdown-lite)</Label><Textarea rows={12} required value={body} onChange={(e) => setBody(e.target.value)} className="mt-1 font-mono text-sm" /></div>
      <FileUpload label="Cover Image" value={coverImage} onChange={setCoverImage} />
      <div className="flex items-center gap-2"><Switch checked={published} onCheckedChange={setPublished} /><Label>Published</Label></div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={loading}>{loading ? "Saving..." : article ? "Update" : "Create"}</Button>
    </form>
  );
}
