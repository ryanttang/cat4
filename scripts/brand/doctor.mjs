/**
 * Scan for leftover source-brand strings after a clone / before a sync.
 */
import fs from "node:fs";
import path from "node:path";
import {
  PLATFORM_ROOT,
  c,
  classifyPath,
  loadLineage,
  loadPathsManifest,
  walkFiles,
} from "./shared.mjs";

const TEXT_EXT = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".mjs",
  ".cjs",
  ".json",
  ".md",
  ".css",
  ".mjs",
  ".example",
  ".yml",
  ".yaml",
]);

function parseArgs(argv) {
  const opts = { fromName: null, fromId: null, skinOnly: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--name") opts.fromName = argv[++i];
    else if (argv[i] === "--id") opts.fromId = argv[++i];
    else if (argv[i] === "--skin-only") opts.skinOnly = true;
  }
  return opts;
}

export function runDoctor(argv = []) {
  const opts = parseArgs(argv);
  const lineage = loadLineage(PLATFORM_ROOT);
  const fromName = opts.fromName || lineage?.clonedFrom?.brandName || "CAT4";
  const fromId = opts.fromId || lineage?.clonedFrom?.brandId || "cat4";
  const currentId = lineage?.brandId;
  const currentName = lineage?.brandName;

  const isPlatform = lineage?.role === "platform";
  const isClone = lineage?.role === "clone";

  const manifest = loadPathsManifest(PLATFORM_ROOT);
  const hits = [];

  for (const { abs, rel } of walkFiles(PLATFORM_ROOT)) {
    const kind = classifyPath(rel, manifest);
    if (kind === "never") continue;
    if (opts.skinOnly && kind !== "skin") continue;
    // Platform doctor: white-label debt in shared code only
    if (isPlatform && kind !== "platform") continue;
    if (rel === "src/lib/brand.ts") continue;
    if (rel.startsWith(".brand/")) continue;
    if (rel.startsWith("data/")) continue; // catalog dumps — expected skin content
    if (rel.endsWith(".webp") || rel.endsWith(".png") || rel.endsWith(".jpg")) continue;

    const ext = path.extname(rel);
    if (!TEXT_EXT.has(ext) && path.basename(rel) !== ".env.example") continue;

    const text = fs.readFileSync(abs, "utf8");
    const lines = text.split(/\r?\n/);
    lines.forEach((line, idx) => {
      // Ignore Tailwind / CSS token usages like text-cat4-blue, cat4.blue
      const stripped = line
        .replace(/cat4-[a-z0-9-]+/gi, "")
        .replace(/cat4\.[a-z0-9_]+/gi, "");

      const nameHit = fromName && stripped.includes(fromName);
      // On clones, flag leftover source id; on platform, id in package names is fine — focus on display name in UI
      const idHit =
        isClone &&
        fromId &&
        currentId !== fromId &&
        new RegExp(`\\b${fromId}\\b`, "i").test(stripped);

      if (!nameHit && !idHit) return;
      if (isPlatform && (rel.startsWith("README") || rel.startsWith("AGENTS"))) return;
      if (isPlatform && rel.includes("white-label")) return;
      if (isPlatform && rel.includes("cat4-platform")) return;
      if (isPlatform && rel.includes("scripts/brand")) return;

      hits.push({
        rel,
        line: idx + 1,
        kind,
        snippet: line.trim().slice(0, 120),
      });
    });
  }

  console.log(`\n${c("Brand doctor", "bold")}`);
  console.log(
    `  Looking for leftover ${c(fromName, "yellow")} / ${c(fromId, "yellow")}` +
      (currentName ? ` in deploy ${currentName}` : "")
  );

  if (hits.length === 0) {
    console.log(c("\nNo leftover brand-string hits (with Tailwind classnames ignored).", "green"));
    return;
  }

  console.log(c(`\n${hits.length} hit(s):`, "yellow"));
  for (const h of hits.slice(0, 100)) {
    console.log(`  ${h.rel}:${h.line} [${h.kind}]`);
    console.log(c(`    ${h.snippet}`, "dim"));
  }
  if (hits.length > 100) {
    console.log(c(`  …and ${hits.length - 100} more`, "dim"));
  }
  console.log(
    c(
      "\nPrefer brand.name / brand.defaults for user-facing copy so clones stay clean.",
      "dim"
    )
  );
}
