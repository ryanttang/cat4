import type { BrandAmbassador, AmbassadorLinkClick, QrCode } from "@/lib/db/schema";

const now = new Date("2026-01-01T00:00:00.000Z");
const weekAgo = new Date("2025-12-25T00:00:00.000Z");

function ts() {
  return { createdAt: now, updatedAt: now };
}

export const MOCK_AMBASSADORS: BrandAmbassador[] = [
  {
    id: "00000000-0000-4000-8000-000000000300",
    slug: "jane-doe",
    firstName: "Jane",
    lastName: "Doe",
    email: "jane.doe@example.com",
    phone: "555-0100",
    photoUrl: null,
    bio: "CAT4 Brand Ambassador — Los Angeles",
    territory: "Los Angeles",
    status: "published",
    userId: "00000000-0000-4000-8000-000000000301",
    linkMode: "global",
    customLinks: [],
    hubOverrides: {},
    ...ts(),
  },
  {
    id: "00000000-0000-4000-8000-000000000302",
    slug: "mike-smith",
    firstName: "Mike",
    lastName: "Smith",
    email: "mike.smith@example.com",
    phone: null,
    photoUrl: null,
    bio: "CAT4 Brand Ambassador — San Diego",
    territory: "San Diego",
    status: "published",
    userId: null,
    linkMode: "merge",
    customLinks: [{ label: "Mike's Picks", url: "/products", enabled: true }],
    hubOverrides: { hubTitle: "Mike Smith | CAT4" },
    ...ts(),
  },
];

export const MOCK_AMBASSADOR_QR_CODES: QrCode[] = [
  {
    id: "00000000-0000-4000-8000-000000000310",
    code: "jane-doe",
    title: "Jane Doe QR",
    status: "published",
    productId: null,
    ambassadorId: "00000000-0000-4000-8000-000000000300",
    destinationType: "link_hub",
    destinationConfig: {
      hubTitle: "CAT4",
      hubBio: "Connect with CAT4",
      links: [
        { label: "Shop Products", url: "/products" },
        { label: "Subscribe", url: "/subscribe" },
      ],
    },
    ...ts(),
  },
  {
    id: "00000000-0000-4000-8000-000000000311",
    code: "mike-smith",
    title: "Mike Smith QR",
    status: "published",
    productId: null,
    ambassadorId: "00000000-0000-4000-8000-000000000302",
    destinationType: "link_hub",
    destinationConfig: {
      hubTitle: "Mike Smith | CAT4",
      hubBio: "CAT4 Brand Ambassador — San Diego",
      links: [
        { label: "Shop Products", url: "/products" },
        { label: "Subscribe", url: "/subscribe" },
        { label: "Mike's Picks", url: "/products" },
      ],
    },
    ...ts(),
  },
];

export const MOCK_AMBASSADOR_LINK_CLICKS: AmbassadorLinkClick[] = [
  {
    id: "00000000-0000-4000-8000-000000000320",
    ambassadorId: "00000000-0000-4000-8000-000000000300",
    linkLabel: "Shop Products",
    linkUrl: "/products",
    clickedAt: now,
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
    referrer: null,
    deviceType: "mobile",
  },
  {
    id: "00000000-0000-4000-8000-000000000321",
    ambassadorId: "00000000-0000-4000-8000-000000000300",
    linkLabel: "Subscribe",
    linkUrl: "/subscribe",
    clickedAt: weekAgo,
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    referrer: null,
    deviceType: "desktop",
  },
];

export const MOCK_AMBASSADOR_USER = {
  id: "00000000-0000-4000-8000-000000000301",
  email: "jane.doe@example.com",
  passwordHash: "$mock$",
  name: "Jane Doe",
  role: "ambassador" as const,
  ...ts(),
};
