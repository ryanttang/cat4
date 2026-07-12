import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const dataPath = path.join(root, "data/catalyst-cat4-products.json");
const imagesDir = path.join(root, "public/products");
const outPath = path.join(root, "src/lib/mock/products-seed.ts");

const CATEGORY_MAP = {
  PREROLL: "preroll",
  CARTRIDGE: "cartridge",
  FLOWER: "flower",
  EXTRACT: "extract",
  MERCH: "merch",
};

function siteSlug(catalystSlug) {
  return catalystSlug.startsWith("cat4-") ? catalystSlug.slice(5) : catalystSlug;
}

function formatPrice(value) {
  if (value == null || value === "") return null;
  return Number(value).toFixed(2);
}

function normalizeClassification(value) {
  if (!value) return null;
  if (value.toLowerCase() === "i/s") return "Indica";
  return value;
}

function inferSubtype(name, category) {
  const n = name.toLowerCase();
  if (n.includes("battery")) return "Battery";
  if (n.includes("all in one")) return "All in One";
  if (n.includes("pod")) return "Pod";
  if (n.includes("cartridge")) return "Cartridge";
  if (n.includes("infused") && (n.includes("pre-roll") || n.includes("preroll"))) return "Infused Pre-roll";
  if (n.includes("pre-roll") || n.includes("preroll")) return "Pre-roll";
  if (n.includes("badder")) return "Badder";
  if (n.includes("rosin")) return "Rosin";
  if (n.includes("shake")) return "Shake";
  if (category === "flower") return "Flower";
  if (category === "merch") return "Merch";
  return null;
}

function escapeTs(str) {
  return str.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$/g, "\\$");
}

async function downloadImage(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed ${url}: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(dest, buf);
}

async function main() {
  fs.mkdirSync(imagesDir, { recursive: true });
  const { products } = JSON.parse(fs.readFileSync(dataPath, "utf8"));

  const imported = [];
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const slug = siteSlug(p.slug);
    const ext = path.extname(new URL(p.image).pathname) || ".webp";
    const filename = `${slug}${ext}`;
    const localPath = `/products/${filename}`;
    const dest = path.join(imagesDir, filename);

    if (!fs.existsSync(dest)) {
      process.stdout.write(`Downloading ${i + 1}/${products.length}: ${filename}\n`);
      await downloadImage(p.image, dest);
    }

    const category = CATEGORY_MAP[p.category] ?? "merch";
    imported.push({
      id: `00000000-0000-4000-8000-${String(i + 100).padStart(12, "0")}`,
      name: p.name,
      slug,
      category,
      description: p.shortDescription ?? null,
      longDescription: p.description ?? p.shortDescription ?? null,
      images: [localPath],
      price: formatPrice(p.salePrice),
      compareAtPrice: formatPrice(p.originalPrice),
      classification: normalizeClassification(p.classification),
      subtype: inferSubtype(p.name, category),
      size: p.size ?? null,
      thcPercent: p.thcPercent != null ? String(p.thcPercent) : null,
      discountPercent: p.discountPercent ?? null,
      featured: i < 8,
      featuredOrder: i < 8 ? i + 1 : 0,
      published: true,
    });
  }

  const lines = imported.map((p) => {
    const images = JSON.stringify(p.images);
    return `  {
    id: "${p.id}",
    name: ${JSON.stringify(p.name)},
    slug: ${JSON.stringify(p.slug)},
    category: ${JSON.stringify(p.category)},
    description: ${p.description ? JSON.stringify(p.description) : "null"},
    longDescription: ${p.longDescription ? JSON.stringify(p.longDescription) : "null"},
    images: ${images},
    price: ${p.price ? `"${p.price}"` : "null"},
    compareAtPrice: ${p.compareAtPrice ? `"${p.compareAtPrice}"` : "null"},
    classification: ${p.classification ? JSON.stringify(p.classification) : "null"},
    subtype: ${p.subtype ? JSON.stringify(p.subtype) : "null"},
    size: ${p.size ? JSON.stringify(p.size) : "null"},
    thcPercent: ${p.thcPercent ? JSON.stringify(p.thcPercent) : "null"},
    discountPercent: ${p.discountPercent ?? "null"},
    featured: ${p.featured},
    featuredOrder: ${p.featuredOrder},
    published: true,
    ...ts(),
  }`;
  });

  const content = `import type { Product } from "@/lib/db/schema";

const now = new Date("2026-01-01T00:00:00.000Z");

function ts() {
  return { createdAt: now, updatedAt: now };
}

/** CAT4 catalog imported from Catalyst Cannabis (Bellflower pricing). */
export const MOCK_PRODUCTS: Product[] = [
${lines.join(",\n")}
];
`;

  fs.writeFileSync(outPath, content);
  console.log(`Imported ${imported.length} products -> ${outPath}`);
  console.log(`Images saved to ${imagesDir}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
