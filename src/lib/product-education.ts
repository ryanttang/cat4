import type { Product } from "@/lib/db/schema";
import type { ProductCategory } from "@/lib/utils";

export type CategoryIconName = "flower" | "cigarette" | "battery" | "droplets" | "shopping-bag";

export type CategoryBreakdown = {
  slug: ProductCategory;
  label: string;
  icon: CategoryIconName;
  headline: string;
  pitch: string;
  imageFallback: string;
  cat4Wins: string[];
  marketNorms: string[];
};

export const CATEGORY_BREAKDOWNS: CategoryBreakdown[] = [
  {
    slug: "flower",
    label: "Flower",
    icon: "flower",
    headline: "Indoor-quality buds without the boutique markup",
    pitch:
      "Most shelf flower either looks premium and prices like it, or undercuts on price and shows it in the jar. CAT4 flower is grown and cured for everyday sessions — consistent moisture, clear classification, and weights that match the label.",
    imageFallback: "/products/jet-fuel-14g.webp",
    cat4Wins: [
      "Full flower in multiple weights — not shake dressed as top shelf",
      "Indica, sativa, and hybrid labeled clearly so you know what you're buying",
      "House-brand pricing that stays accessible without cutting corners on cure",
      "Batch consistency so your go-to strain feels familiar visit after visit",
    ],
    marketNorms: [
      "Inconsistent trim and moisture between bags",
      "Vague strain names with little effect guidance",
      "Premium pricing for mid-tier quality — or cheap flower that burns harsh",
      "Hard to find the same experience twice",
    ],
  },
  {
    slug: "preroll",
    label: "Pre-rolls",
    icon: "cigarette",
    headline: "Full-flower rolls, not filler packed into paper",
    pitch:
      "Generic pre-rolls often hide shake, stems, and uneven packs behind a low sticker price. CAT4 pre-rolls are built as a real format — full 1g singles, multi-packs, and infused options that actually deliver the session size on the package.",
    imageFallback: "/products/indica-preroll-single-1g.webp",
    cat4Wins: [
      "Full-flower construction — not shake fillers padded into a cone",
      "True 1g singles plus multi-packs for every session size",
      "Infused options when you want more than a standard roll",
      "Reliable burn and potency across indica, sativa, and hybrid blends",
    ],
    marketNorms: [
      "Shake and trim sold as \"premium\" pre-rolls",
      "Underfilled cones that finish before the session does",
      "Canoeing, harsh pulls, and uneven packs",
      "One-size-fits-all SKUs with no real format variety",
    ],
  },
  {
    slug: "cartridge",
    label: "Vapes",
    icon: "battery",
    headline: "High-potency hardware that tastes like the strain",
    pitch:
      "Market vapes often chase THC numbers while flavor falls flat and hardware fails mid-cart. CAT4 vapes — cartridges, pods, and all-in-ones — pair high-potency oil with formats built for clean flavor and reliable vapor from first hit to last.",
    imageFallback: "/products/strawberry-banana-all-in-one-1g.webp",
    cat4Wins: [
      "All-in-ones, pods, and cartridges for how you actually consume",
      "Authentic dessert and fruit profiles that hold through the tank",
      "High-potency distillate and live formulations designed for clean vapor",
      "Ready-to-use AIOs so you're not stuck with a dead battery mid-session",
    ],
    marketNorms: [
      "Muted flavor that disappears after a few hits",
      "Clogging, leaking, and hardware that dies early",
      "Mystery oil with little strain or format clarity",
      "Carts that require a separate battery you may not have",
    ],
  },
  {
    slug: "extract",
    label: "Concentrates",
    icon: "droplets",
    headline: "Connoisseur formats without the gatekeeping price",
    pitch:
      "Concentrates on the open market swing between ultra-luxury jars and opaque budget dabs. CAT4 extracts — badder, rosin, and more — bring proper handling and terpene-aware formulation to a house-brand price point serious dabbers can actually use regularly.",
    imageFallback: "/products/wedding-cake-badder-1g.webp",
    cat4Wins: [
      "Badder, rosin, and concentrate formats for different dab styles",
      "Handling and storage protocols that protect terpene profiles",
      "Clear labeling so potency and format match expectations",
      "Accessible pricing that makes concentrates an everyday option",
    ],
    marketNorms: [
      "Luxury markup that prices out regular use",
      "Budget extracts with flat flavor and harsh finish",
      "Poor storage that kills terps before you open the jar",
      "Unclear format names that don't match the dab experience",
    ],
  },
  {
    slug: "merch",
    label: "Merch",
    icon: "shopping-bag",
    headline: "Reliable gear that matches the CAT4 lineup",
    pitch:
      "Cheap batteries and accessories fail when you need them most — leaving a half-full cart useless. CAT4 merch is selected to work with the formats you already buy, so your whole session stays seamless.",
    imageFallback: "/products/cat-4-pod-battery.webp",
    cat4Wins: [
      "Hardware built for CAT4 pods and cartridges",
      "Consistent quality instead of disposable discount gear",
      "Retailer-ready packaging that matches the brand on shelf",
      "Affordable add-ons that complete the experience",
    ],
    marketNorms: [
      "Generic batteries that die after a few charges",
      "Incompatible threading or weak draw on premium carts",
      "No brand cohesion — gear feels like an afterthought",
      "Replacement costs that add up faster than the cart itself",
    ],
  },
];

export function getProductSuperiority(product: Product): { cat4: string; market: string } {
  const category = product.category;
  const subtype = product.subtype?.toLowerCase() ?? "";

  if (category === "preroll") {
    return {
      cat4: `Full 1g ${product.classification?.toLowerCase() ?? ""} flower pre-roll with ${product.thcPercent}% THC — not shake in a cone`,
      market: "Typical budget pre-rolls use trim, run small, and burn unevenly",
    };
  }

  if (subtype.includes("all in one")) {
    return {
      cat4: `Ready-to-use AIO with ${product.thcPercent}% THC, rechargeable hardware, and real strain flavor`,
      market: "Market AIOs often die mid-tank, clog easily, and taste artificial after a few hits",
    };
  }

  if (subtype.includes("pod")) {
    return {
      cat4: `${product.thcPercent}% potency pod with candy-true terpene profiles at house-brand pricing`,
      market: "Generic pods chase THC numbers but lose flavor and consistency fast",
    };
  }

  if (subtype.includes("cartridge")) {
    return {
      cat4: `High-potency ${product.thcPercent}% cart built for clean vapor and bold flavor`,
      market: "Cheap carts need a separate battery, leak, and taste like filler oil",
    };
  }

  if (category === "flower") {
    return {
      cat4: `${product.size} of ${product.classification?.toLowerCase() ?? "premium"} flower with clear labeling and consistent cure`,
      market: "Shelf flower often varies bag-to-bag with vague strain info and inflated pricing",
    };
  }

  if (category === "extract") {
    return {
      cat4: `${product.subtype ?? "Concentrate"} format with ${product.thcPercent}% THC and terpene-aware handling`,
      market: "Budget dabs taste flat; luxury jars price out everyday use",
    };
  }

  if (category === "merch") {
    return {
      cat4: "CAT4-branded hardware designed to pair with pods and carts in the lineup",
      market: "Off-brand batteries fail early and rarely match the cart you're actually buying",
    };
  }

  return {
    cat4: "Lab-tested CAT4 quality at accessible house-brand pricing",
    market: "Typical market products trade quality for price or markup without delivering either",
  };
}

/** Representative products per category for the education breakdown. */
export function getProductsByCategory(
  products: Product[],
  perCategory = 3
): Record<ProductCategory, Product[]> {
  const published = products.filter((p) => p.published);
  const grouped = {} as Record<ProductCategory, Product[]>;

  for (const { slug } of CATEGORY_BREAKDOWNS) {
    grouped[slug] = published.filter((p) => p.category === slug).slice(0, perCategory);
  }

  return grouped;
}
