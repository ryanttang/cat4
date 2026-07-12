"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";

type FileUploadProps = {
  label: string;
  accept?: string;
  value?: string;
  onChange: (url: string) => void;
};

export function FileUpload({ label, accept = "image/*,video/*", value, onChange }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      onChange(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-1 flex items-center gap-3">
        <Input ref={inputRef} type="file" accept={accept} onChange={handleFile} className="hidden" />
        <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={uploading}>
          <Upload className="mr-2 h-4 w-4" />
          {uploading ? "Uploading..." : "Upload File"}
        </Button>
        {value && (
          <span className="truncate text-xs text-muted-foreground max-w-[200px]">{value.split("/").pop()}</span>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
