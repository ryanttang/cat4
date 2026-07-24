/**
 * Report lineage + quick health for brand tooling.
 */
import path from "node:path";
import {
  PLATFORM_ROOT,
  c,
  classifyPath,
  loadLineage,
  loadPathsManifest,
  walkFiles,
} from "./shared.mjs";

export function runStatus(argv = []) {
  let peer = null;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--peer") peer = path.resolve(argv[++i]);
  }

  const lineage = loadLineage(PLATFORM_ROOT);
  const manifest = loadPathsManifest(PLATFORM_ROOT);
  const files = walkFiles(PLATFORM_ROOT);
  const counts = { platform: 0, skin: 0, never: 0, unlisted: 0 };
  for (const { rel } of files) {
    counts[classifyPath(rel, manifest)]++;
  }

  console.log(`\n${c("Brand status", "bold")}`);
  console.log(`  Root:    ${PLATFORM_ROOT}`);
  if (!lineage) {
    console.log(c("  Lineage: missing (.brand/lineage.json)", "yellow"));
  } else {
    console.log(`  Role:    ${lineage.role}`);
    console.log(`  Brand:   ${lineage.brandName} (${lineage.brandId})`);
    if (lineage.clonedFrom) {
      console.log(`  Cloned:  ${lineage.clonedFrom.brandName || "?"} @ ${lineage.clonedFrom.commit || "?"}`);
      console.log(`  Source:  ${lineage.clonedFrom.path || lineage.clonedFrom.remote || "?"}`);
    }
  }
  console.log(`\n  Path inventory (tracked by walk, excluding node_modules/.next/.git):`);
  console.log(`    platform: ${counts.platform}`);
  console.log(`    skin:     ${counts.skin}`);
  console.log(`    unlisted: ${counts.unlisted}${counts.unlisted ? c("  ← consider adding to .brand/paths.json", "yellow") : ""}`);
  console.log(`    never:    ${counts.never}`);

  if (peer) {
    console.log(`\n  Peer: ${peer}`);
    console.log(c("  Tip: npm run brand:diff -- --peer <path>", "dim"));
  }

  console.log(`\n${c("Commands", "dim")}`);
  console.log(c("  npm run brand:clone", "dim"));
  console.log(c("  npm run brand:sync -- pull --from ../CAT4", "dim"));
  console.log(c("  npm run brand:sync -- push --to ../CAT4", "dim"));
  console.log(c("  npm run brand:doctor", "dim"));
}
