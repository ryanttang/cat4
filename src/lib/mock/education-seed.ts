import type { EducationArticle } from "@/lib/db/schema";

const now = new Date("2026-01-01T00:00:00.000Z");

function ts() {
  return { createdAt: now, updatedAt: now };
}

export const MOCK_EDUCATION_ARTICLES: EducationArticle[] = [
  {
    id: "00000000-0000-4000-8000-000000000030",
    title: "CAT4 Flower vs. Typical Market Flower",
    slug: "cat4-flower-vs-market",
    excerpt:
      "Why CAT4 flower delivers indoor-quality buds, clear classification, and consistent cure — without boutique pricing or shake-in-a-bag shortcuts.",
    body: `## The Flower Problem on Most Menus

Walk into almost any dispensary and flower is the category with the widest quality gap. You'll see jars that look incredible at luxury prices, budget bags that burn harsh, and everything in between — often with vague strain names and inconsistent moisture from batch to batch.

## What CAT4 Flower Does Differently

CAT4 flower is positioned for everyday sessions, not just special occasions. Every bag is labeled with clear indica, sativa, or hybrid classification so you know what effect to expect. Weights match the label — you're getting full flower, not shake dressed up as top shelf.

## Consistency Over Hype

The goal isn't a one-time wow factor. It's a go-to strain that feels familiar visit after visit. CAT4 invests in cure and batch consistency so repeat buyers know exactly what they're grabbing off the shelf.

## Value Without Cutting Corners

House-brand pricing doesn't mean cutting quality. CAT4 flower is lab-tested, licensed, and built to compete with mid-tier and premium options at a price point that makes stocking your rotation affordable.

## When to Choose CAT4 Flower

If you've been burned by inconsistent bags, inflated pricing, or flower that looks great in the jar but burns harsh — CAT4 is built to be the reliable pick you don't have to second-guess.`,
    coverImage: null,
    tags: ["flower", "comparison"],
    published: true,
    publishedAt: now,
    ...ts(),
  },
  {
    id: "00000000-0000-4000-8000-000000000031",
    title: "CAT4 Pre-Rolls vs. Typical Market Pre-Rolls",
    slug: "cat4-prerolls-vs-market",
    excerpt:
      "Full 1g singles, multi-packs, and infused options — why CAT4 pre-rolls are built as a real format, not shake stuffed into paper.",
    body: `## The Pre-Roll Shortcut

Budget pre-rolls are one of the most common places dispensaries hide low-quality material. Shake, stems, and uneven packs get rolled into cones, sold at a low sticker price, and often canoe, run harsh, or finish before the session does.

## Full-Flower Construction

CAT4 pre-rolls use full flower — not trim fillers padded into a cone. That means a cleaner burn, more reliable potency, and a session that actually matches what's on the package.

## Real Format Variety

CAT4 offers true 1g singles for solo sessions, multi-packs for sharing, and infused options when you want more than a standard roll. Indica, sativa, and hybrid blends are labeled clearly so you're not guessing at effects.

## Burn Quality Matters

A pre-roll that canoes or pulls harsh isn't a deal — it's wasted product. CAT4 pre-rolls are rolled for even burns and consistent draws across the lineup.

## The Bottom Line

If you've grabbed cheap pre-rolls and felt disappointed halfway through, CAT4 is the upgrade that still respects your budget — full flower, honest weights, and formats that fit how you actually consume.`,
    coverImage: null,
    tags: ["prerolls", "comparison"],
    published: true,
    publishedAt: now,
    ...ts(),
  },
  {
    id: "00000000-0000-4000-8000-000000000032",
    title: "CAT4 Vapes vs. Typical Market Vapes",
    slug: "cat4-vapes-vs-market",
    excerpt:
      "All-in-ones, pods, and cartridges with real strain flavor, reliable hardware, and high-potency oil — without the mid-tank failures common on shelf.",
    body: `## When Vapes Chase Numbers Over Experience

Many market vapes optimize for THC percentages on the label while flavor disappears after a few hits, hardware clogs or leaks, and all-in-one batteries die with oil still in the tank.

## Formats That Match How You Consume

CAT4 covers the full vape spectrum: ready-to-use all-in-ones for grab-and-go sessions, pods for proprietary systems, and cartridges for 510 setups. You're not forced into one format that doesn't fit your routine.

## Flavor That Holds

CAT4 vape products are formulated for authentic dessert and fruit profiles that stay present through the tank — not muted oil that tastes like filler after the first few pulls.

## Hardware You Can Trust

All-in-ones are rechargeable so you're not stuck mid-session. Pods and carts are built for clean vapor production from first hit to last, with potency that matches the label.

## Why It Matters

A vape that fails early or tastes flat isn't saving you money — it's wasting it. CAT4 vapes are priced as house-brand products but built to outperform the generic alternatives sitting next to them on the menu.`,
    coverImage: null,
    tags: ["vapes", "comparison"],
    published: true,
    publishedAt: now,
    ...ts(),
  },
  {
    id: "00000000-0000-4000-8000-000000000033",
    title: "CAT4 Concentrates vs. Typical Market Concentrates",
    slug: "cat4-concentrates-vs-market",
    excerpt:
      "Badder, rosin, and concentrate formats with terpene-aware handling — connoisseur quality without the luxury gatekeeping price.",
    body: `## The Concentrate Price Swing

Concentrates on the open market often split into two extremes: ultra-luxury jars with markup that prices out regular use, and budget dabs with flat flavor, harsh finishes, and poor storage that kills terps before you open the jar.

## Formats for Every Dab Style

CAT4 offers badder, rosin, and other concentrate formats so you can match the product to your rig and preference — not force one texture into every session.

## Terpene-Aware Handling

Proper handling and storage protocols protect terpene profiles from production to packaging. That means flavor and aroma that reflect what the format promises, not a flat slab that could be anything.

## Clear Labeling

Potency and format names on CAT4 concentrates match the dab experience. No mystery jars with unclear names and inconsistent effects.

## Everyday Connoisseur Quality

CAT4 brings proper concentrate quality to a house-brand price point — so serious dabbers can actually use it regularly instead of saving it for special occasions only.`,
    coverImage: null,
    tags: ["concentrates", "comparison"],
    published: true,
    publishedAt: now,
    ...ts(),
  },
  {
    id: "00000000-0000-4000-8000-000000000034",
    title: "CAT4 Quality & Testing Standards",
    slug: "cat4-quality-standards",
    excerpt:
      "How CAT4 ensures every product meets rigorous quality, safety, and transparency standards — regardless of format.",
    body: `## Quality Is the Product

At CAT4, quality isn't a marketing line — it's the foundation of the brand. From sourcing raw material to final packaging, every step is designed to deliver cannabis that meets or exceeds state regulatory standards.

## Lab Testing & Transparency

All CAT4 products undergo testing at licensed third-party laboratories. Tests typically cover:

- **Potency** — Accurate THC and cannabinoid profiles
- **Purity** — Screening for pesticides, heavy metals, and microbial contaminants
- **Compliance** — Verification against state-specific requirements

Results are reflected on product labeling so consumers know exactly what they're purchasing.

## Formulation & Format Integrity

CAT4 products are formulated for their intended experience. Pre-rolls use full flower (not shake fillers). Vape products use distillate or live resin formulations designed for clean flavor and reliable vapor production. Extracts follow proper handling and storage protocols to preserve terpene profiles.

## Responsible Production

CAT4 supports licensed cultivation and manufacturing partners who operate within regulated frameworks. This ensures worker safety, environmental compliance, and product traceability — benefits that extend to every consumer who chooses the brand.

## Our Commitment

If a product doesn't meet our standards, it doesn't ship. That commitment is what makes CAT4 a brand retailers are proud to put on their shelves and consumers are confident recommending to friends.`,
    coverImage: null,
    tags: ["quality", "testing"],
    published: true,
    publishedAt: now,
    ...ts(),
  },
];
