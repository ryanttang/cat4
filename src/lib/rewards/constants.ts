import type { QrDestinationConfig } from "@/lib/db/schema";

export const QR_DESTINATION_TYPES = [
  "product_page",
  "link_hub",
  "promotion",
  "survey",
  "poll",
  "subscribe",
  "claim_reward",
  "external_url",
] as const;

export type QrDestinationType = (typeof QR_DESTINATION_TYPES)[number];

export const QR_DESTINATION_LABELS: Record<QrDestinationType, string> = {
  product_page: "Product Page",
  link_hub: "Link Hub",
  promotion: "Promotion",
  survey: "Survey",
  poll: "Poll",
  subscribe: "Subscribe",
  claim_reward: "Claim Rewards",
  external_url: "External URL",
};

export const QR_CLAIM_FIELD_TYPES = [
  { value: "email", label: "Email" },
  { value: "text", label: "Text" },
  { value: "tel", label: "Phone" },
] as const;

export const QR_CLAIM_OUTCOME_TYPES = [
  { value: "confirmation", label: "Confirmation message" },
  { value: "code", label: "Unique reward code" },
  { value: "redirect", label: "Redirect to URL" },
] as const;

export function parseDeviceType(userAgent: string | null | undefined): "mobile" | "tablet" | "desktop" | "unknown" {
  if (!userAgent) return "unknown";
  const ua = userAgent.toLowerCase();
  if (/ipad|tablet|playbook|silk|(android(?!.*mobile))/.test(ua)) return "tablet";
  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/.test(ua)) return "mobile";
  if (/mozilla|chrome|safari|firefox|edge/.test(ua)) return "desktop";
  return "unknown";
}

export function parseBrowserMetadata(userAgent: string | null | undefined): Record<string, string> {
  if (!userAgent) return {};
  const ua = userAgent;
  if (/Edg\//.test(ua)) return { browser: "Edge" };
  if (/Chrome\//.test(ua) && !/Edg\//.test(ua)) return { browser: "Chrome" };
  if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) return { browser: "Safari" };
  if (/Firefox\//.test(ua)) return { browser: "Firefox" };
  return { browser: "Other" };
}

export function qrScanPath(code: string): string {
  return `/r/${code}`;
}

export function buildQrUrl(baseUrl: string, code: string): string {
  const base = baseUrl.replace(/\/$/, "");
  return `${base}${qrScanPath(code)}`;
}

export function defaultDestinationConfig(type: QrDestinationType): QrDestinationConfig {
  switch (type) {
    case "link_hub":
      return {
        hubTitle: "",
        hubBio: "",
        links: [{ label: "Visit CAT4", url: "/" }],
      };
    case "claim_reward":
      return {
        claimForm: {
          fields: [
            { name: "email", label: "Email", type: "email", required: true },
            { name: "firstName", label: "First Name", type: "text", required: false },
          ],
          consentText: "I agree to receive marketing emails from CAT4.",
        },
        claimOutcome: {
          type: "confirmation",
          message: "Thanks! Your reward claim has been submitted.",
        },
      };
    case "external_url":
      return { externalUrl: "https://cat4.com" };
    default:
      return {};
  }
}

export function generateShortCode(length = 6): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export function generateRewardCode(prefix = "CAT4-"): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 6; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `${prefix}${suffix}`;
}
