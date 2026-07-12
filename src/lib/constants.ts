import { brandStorageKeys } from "@/lib/brand";

/** Cookie / localStorage key for age verification. */
export const AGE_GATE_COOKIE_NAME = brandStorageKeys.ageVerified;

/** One year in seconds. */
export const AGE_GATE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export const BCRYPT_ROUNDS = 12;

export const CAPTURES_LIST_LIMIT = 200;
export const DASHBOARD_RECENT_LIMIT = 10;

/** Fallback weight when product size cannot be parsed for sorting. */
export const SIZE_SORT_FALLBACK = 999;

export const UPLOAD_MAX_BYTES = 10 * 1024 * 1024; // 10 MB

export const UPLOAD_ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "video/mp4",
  "video/webm",
] as const;
