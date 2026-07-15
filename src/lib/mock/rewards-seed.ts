import type { QrCode, QrScan, RewardClaim } from "@/lib/db/schema";

const now = new Date("2026-01-01T00:00:00.000Z");
const weekAgo = new Date("2025-12-25T00:00:00.000Z");

function ts() {
  return { createdAt: now, updatedAt: now };
}

export const MOCK_QR_CODES: QrCode[] = [
  {
    id: "00000000-0000-4000-8000-000000000200",
    code: "indica1g",
    title: "Indica Pre-roll QR",
    status: "published",
    productId: "00000000-0000-4000-8000-000000000100",
    ambassadorId: null,
    destinationType: "product_page",
    destinationConfig: {},
    ...ts(),
  },
  {
    id: "00000000-0000-4000-8000-000000000201",
    code: "cat4hub",
    title: "CAT4 Link Hub",
    status: "published",
    productId: null,
    ambassadorId: null,
    destinationType: "link_hub",
    destinationConfig: {
      hubTitle: "CAT4",
      hubBio: "Premium cannabis products crafted with precision.",
      links: [
        { label: "Shop Products", url: "/products" },
        { label: "Summer Sweepstakes", url: "/summer-sweepstakes" },
        { label: "Subscribe", url: "/subscribe" },
      ],
    },
    ...ts(),
  },
  {
    id: "00000000-0000-4000-8000-000000000202",
    code: "reward01",
    title: "Launch Reward",
    status: "published",
    productId: null,
    ambassadorId: null,
    destinationType: "claim_reward",
    destinationConfig: {
      claimForm: {
        fields: [
          { name: "email", label: "Email", type: "email", required: true },
          { name: "firstName", label: "First Name", type: "text", required: true },
        ],
        consentText: "I agree to receive marketing emails from CAT4.",
      },
      claimOutcome: {
        type: "code",
        message: "Your reward code is ready!",
        codePrefix: "CAT4-",
      },
    },
    ...ts(),
  },
];

export const MOCK_QR_SCANS: QrScan[] = [
  {
    id: "00000000-0000-4000-8000-000000000210",
    qrCodeId: "00000000-0000-4000-8000-000000000200",
    scannedAt: weekAgo,
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
    referrer: null,
    deviceType: "mobile",
    utmSource: null,
    utmMedium: null,
    utmCampaign: null,
    metadata: { browser: "Safari" },
  },
  {
    id: "00000000-0000-4000-8000-000000000211",
    qrCodeId: "00000000-0000-4000-8000-000000000200",
    scannedAt: now,
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    referrer: "https://google.com",
    deviceType: "desktop",
    utmSource: "qr",
    utmMedium: "indica1g",
    utmCampaign: null,
    metadata: { browser: "Chrome" },
  },
  {
    id: "00000000-0000-4000-8000-000000000212",
    qrCodeId: "00000000-0000-4000-8000-000000000201",
    scannedAt: now,
    userAgent: "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)",
    referrer: null,
    deviceType: "tablet",
    utmSource: null,
    utmMedium: null,
    utmCampaign: null,
    metadata: null,
  },
];

export const MOCK_REWARD_CLAIMS: RewardClaim[] = [
  {
    id: "00000000-0000-4000-8000-000000000220",
    qrCodeId: "00000000-0000-4000-8000-000000000202",
    email: "fan@example.com",
    firstName: "Alex",
    lastName: "Rivera",
    formData: { email: "fan@example.com", firstName: "Alex" },
    rewardCode: "CAT4-A3K9X2",
    createdAt: now,
  },
];
