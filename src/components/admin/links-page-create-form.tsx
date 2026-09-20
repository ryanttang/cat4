"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createLinkPage } from "@/lib/actions/admin";
import { slugify } from "@/lib/utils";
import type { AdminDialogFormProps } from "@/components/admin/admin-form-dialog";

export function LinksPageCreateForm({ onSuccess }: AdminDialogFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await createLinkPage({
      title,
      slug: slug || slugify(title),
      status: "published",
    });

    if (result.success && result.id) {
      onSuccess?.();
      router.push(`/admin/links/${result.id}`);
    } else {
      setError(result.error ?? "Failed to create");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Title</Label>
        <Input
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (!slugTouched) setSlug(slugify(e.target.value));
          }}
          className="mt-1"
          required
        />
      </div>
      <div>
        <Label>Slug</Label>
        <Input
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(slugify(e.target.value));
          }}
          className="mt-1"
          required
        />
        <p className="mt-1 text-xs text-muted-foreground">Public URL: /links/{slug || "…"}</p>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={loading}>
        {loading ? "Creating..." : "Create page"}
      </Button>
    </form>
  );
}
