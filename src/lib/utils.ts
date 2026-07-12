import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export {
  PRODUCT_CATEGORIES,
  type ProductCategory,
  getAdminCategoryLabel as getCategoryLabel,
} from "@/lib/categories";

export function formatPrice(value: string | number | null | undefined): string | null {
  if (value == null || value === "") return null;
  const num = typeof value === "number" ? value : Number.parseFloat(value);
  if (Number.isNaN(num)) return null;
  return num.toFixed(2);
}

export function formatPriceDisplay(value: string | number | null | undefined): string | null {
  const formatted = formatPrice(value);
  return formatted ? `$${formatted}` : null;
}

export const LANDING_PAGE_TYPES = [
  { value: "sweepstakes", label: "Sweepstakes" },
  { value: "raffle", label: "Raffle" },
  { value: "giveaway", label: "Giveaway" },
  { value: "contest", label: "Contest" },
] as const;

export const SURVEY_TYPES = [
  { value: "survey", label: "Survey" },
  { value: "questionnaire", label: "Questionnaire" },
] as const;

export function formatDate(date: Date | string | null): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(date: Date | string | null): string {
  if (!date) return "—";
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
