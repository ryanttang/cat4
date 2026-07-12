import { UPLOAD_ALLOWED_MIME_TYPES, UPLOAD_MAX_BYTES } from "@/lib/constants";

export function sanitizeUploadFilename(name: string): string {
  const base = name.split(/[/\\]/).pop() ?? "upload";
  const sanitized = base.replace(/[^a-zA-Z0-9._-]/g, "_").replace(/_+/g, "_");
  return sanitized.slice(0, 100) || "upload";
}

export function validateUploadFile(file: File): { ok: true } | { ok: false; error: string } {
  if (file.size > UPLOAD_MAX_BYTES) {
    const maxMb = UPLOAD_MAX_BYTES / (1024 * 1024);
    return { ok: false, error: `File exceeds ${maxMb} MB limit` };
  }

  if (
    !UPLOAD_ALLOWED_MIME_TYPES.includes(
      file.type as (typeof UPLOAD_ALLOWED_MIME_TYPES)[number]
    )
  ) {
    return { ok: false, error: "File type not allowed" };
  }

  return { ok: true };
}
