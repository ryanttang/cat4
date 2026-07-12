export type HomepageCta = {
  label: string;
  href: string;
};

export type HomepageContent = {
  seo: {
    title: string;
    description: string;
  };
  hero: {
    badge: string;
    headline: string;
    headlineAccent: string;
    body: string;
    primaryCta: HomepageCta;
    secondaryCta: HomepageCta;
  };
  stats: Array<{
    value: string;
    label: string;
    useProductCount?: boolean;
  }>;
  lineup: {
    sectionLabel: string;
  };
  fanFavorites: {
    title: string;
    ctaLabel: string;
    ctaHref: string;
  };
  whatIsCat4: {
    sectionLabel: string;
    title: string;
    body: string;
    imageUrl: string;
    imageCaption: string;
    bullets: Array<{ icon: string; text: string }>;
    ctaLabel: string;
    ctaHref: string;
  };
  benefits: {
    sectionLabel: string;
    title: string;
    cards: Array<{
      title: string;
      description: string;
      imageUrl: string;
      icon: string;
    }>;
  };
  educationPreview: {
    sectionLabel: string;
    title: string;
    ctaLabel: string;
    ctaHref: string;
  };
  finalCta: {
    sectionLabel: string;
    title: string;
    subtitle: string;
    bodyParagraphs: string[];
    imageUrl: string;
    primaryCta: HomepageCta;
    secondaryCta: HomepageCta;
  };
};

export const HOMEPAGE_SETTING_KEY = "homepage";

export const HOMEPAGE_ICON_OPTIONS = [
  { value: "tag", label: "Tag" },
  { value: "badge-check", label: "Badge Check" },
  { value: "layers", label: "Layers" },
  { value: "sparkles", label: "Sparkles" },
  { value: "shield-check", label: "Shield Check" },
  { value: "flask-conical", label: "Flask" },
] as const;

export const DEFAULT_HOMEPAGE_CONTENT: HomepageContent = {
  seo: {
    title: "CAT4 — Premium Cannabis House Brand",
    description:
      "CAT4 is a premium cannabis house brand with transparent quality, full-format variety, and value across flower, pre-rolls, vapes, and concentrates.",
  },
  hero: {
    badge: "The CAT4 Standard",
    headline: "Cannabis done right.",
    headlineAccent: "For everyone.",
    body: "CAT4 is a premium house brand redefining what consumers should expect from cannabis — transparent quality, full-format variety, and value that keeps you coming back.",
    primaryCta: { label: "Shop the lineup", href: "/products" },
    secondaryCta: { label: "Find near you", href: "/find" },
  },
  stats: [
    { value: "", label: "Products", useProductCount: true },
    { value: "100%", label: "Lab-tested batches" },
  ],
  lineup: {
    sectionLabel: "The lineup",
  },
  fanFavorites: {
    title: "Fan favorites from the menu",
    ctaLabel: "Browse Products",
    ctaHref: "/products",
  },
  whatIsCat4: {
    sectionLabel: "What is CAT4?",
    title: "A house brand built for the modern cannabis market",
    body: "CAT4 isn't a single strain or SKU — it's a complete cannabis ecosystem. Developed for licensed retailers and sold through partners like Catalyst Cannabis, CAT4 covers every format serious consumers actually buy: pre-rolls, pods, cartridges, flower, and concentrates.",
    imageUrl: "/products/strawberry-banana-all-in-one-1g.webp",
    imageCaption: "CAT4 All-in-One · Indica",
    bullets: [
      { icon: "sparkles", text: "Curated product line with a unified quality standard" },
      { icon: "shield-check", text: "Exclusively sold through licensed dispensaries" },
      { icon: "flask-conical", text: "Third-party lab tested for potency and purity" },
    ],
    ctaLabel: "See why CAT4 wins",
    ctaHref: "/education",
  },
  benefits: {
    sectionLabel: "Benefits",
    title: "Why consumers choose CAT4",
    cards: [
      {
        title: "Premium quality, real value",
        description:
          "Lab-tested cannabis at prices that make everyday enjoyment accessible — not just special occasions.",
        imageUrl: "/products/peaches-cream-all-in-one-1g.webp",
        icon: "tag",
      },
      {
        title: "Consistency in every format",
        description:
          "From 1g pre-rolls to full-spectrum extracts, CAT4 delivers the same trusted standard batch after batch.",
        imageUrl: "/products/watermelon-cartridge-1g.webp",
        icon: "badge-check",
      },
      {
        title: "Built for how you consume",
        description:
          "Flower, vapes, pre-rolls, concentrates — one brand covers your entire routine without compromise.",
        imageUrl: "/products/banana-mimosa-rosin-1g.webp",
        icon: "layers",
      },
    ],
  },
  educationPreview: {
    sectionLabel: "Why CAT4 wins",
    title: "How each product beats the market",
    ctaLabel: "Full breakdown",
    ctaHref: "/education",
  },
  finalCta: {
    sectionLabel: "Why it matters",
    title: "Experience the CAT4 difference today",
    subtitle: "Trust is the product cannabis was missing.",
    bodyParagraphs: [
      "Menus are overwhelming. Quality varies wildly. Prices don't match expectations. CAT4 exists to fix that — giving retailers a brand that drives repeat business and giving consumers a name they can grab off the shelf with confidence.",
      "We raise the floor for everyday cannabis, not just the ceiling for luxury buyers. Browse {productCount}+ lab-tested products or visit a licensed retailer near you.",
    ],
    imageUrl: "/products/jet-fuel-14g.webp",
    primaryCta: { label: "Shop all products", href: "/products" },
    secondaryCta: { label: "CAT4 Education", href: "/education" },
  },
};

export function mergeHomepageContent(
  stored: Partial<HomepageContent> | null | undefined
): HomepageContent {
  if (!stored) return DEFAULT_HOMEPAGE_CONTENT;

  return {
    seo: { ...DEFAULT_HOMEPAGE_CONTENT.seo, ...stored.seo },
    hero: { ...DEFAULT_HOMEPAGE_CONTENT.hero, ...stored.hero },
    stats: stored.stats?.length ? stored.stats : DEFAULT_HOMEPAGE_CONTENT.stats,
    lineup: { ...DEFAULT_HOMEPAGE_CONTENT.lineup, ...stored.lineup },
    fanFavorites: { ...DEFAULT_HOMEPAGE_CONTENT.fanFavorites, ...stored.fanFavorites },
    whatIsCat4: {
      ...DEFAULT_HOMEPAGE_CONTENT.whatIsCat4,
      ...stored.whatIsCat4,
      bullets: stored.whatIsCat4?.bullets?.length
        ? stored.whatIsCat4.bullets
        : DEFAULT_HOMEPAGE_CONTENT.whatIsCat4.bullets,
    },
    benefits: {
      ...DEFAULT_HOMEPAGE_CONTENT.benefits,
      ...stored.benefits,
      cards: stored.benefits?.cards?.length
        ? stored.benefits.cards
        : DEFAULT_HOMEPAGE_CONTENT.benefits.cards,
    },
    educationPreview: {
      ...DEFAULT_HOMEPAGE_CONTENT.educationPreview,
      ...stored.educationPreview,
    },
    finalCta: {
      ...DEFAULT_HOMEPAGE_CONTENT.finalCta,
      ...stored.finalCta,
      bodyParagraphs: stored.finalCta?.bodyParagraphs?.length
        ? stored.finalCta.bodyParagraphs
        : DEFAULT_HOMEPAGE_CONTENT.finalCta.bodyParagraphs,
    },
  };
}
