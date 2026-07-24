/**
 * Bidirectional platform sync between this repo and a peer brand clone (or the base).
 *
 *   pull  — copy platform paths FROM peer INTO this repo
 *   push  — copy platform paths FROM this repo INTO peer
 *
 * Skin paths are never overwritten unless --include-skin (dangerous).
 */
import fs from "node:fs";
import path from "node:path";
import {
  PLATFORM_ROOT,
  askYesNo,
  c,
  classifyPath,
  copyFile,
  createRl,
  filesEqual,
  listClassifiedFiles,
  loadLineage,
  loadPathsManifest,
  printTable,
} from "./shared.mjs";

function parseArgs(argv) {
  const opts = {
    direction: null,
    peer: null,
    dryRun: false,
    yes: false,
    includeSkin: false,
    paths: [],
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "pull" || a === "push") opts.direction = a;
    else if (a === "--from" || a === "--to" || a === "--peer") opts.peer = path.resolve(argv[++i]);
    else if (a === "--dry-run") opts.dryRun = true;
    else if (a === "--yes" || a === "-y") opts.yes = true;
    else if (a === "--include-skin") opts.includeSkin = true;
    else if (a === "--path") opts.paths.push(argv[++i].replace(/\\/g, "/"));
  }
  return opts;
}

function resolvePeer(opts) {
  if (opts.peer) return opts.peer;
  const lineage = loadLineage(PLATFORM_ROOT);
  if (lineage?.clonedFrom?.path && fs.existsSync(lineage.clonedFrom.path)) {
    return lineage.clonedFrom.path;
  }
  throw new Error(
    "Pass --from / --to / --peer <path>, or set clonedFrom.path in .brand/lineage.json"
  );
}

function planSync({ sourceRoot, destRoot, manifest, includeSkin, onlyPaths }) {
  const kinds = includeSkin ? ["platform", "skin"] : ["platform"];
  const sourceFiles = listClassifiedFiles(sourceRoot, manifest, kinds);
  const planned = [];

  const only = onlyPaths.length ? new Set(onlyPaths.map((p) => p.replace(/\\/g, "/"))) : null;

  for (const { abs: srcAbs, rel } of sourceFiles) {
    if (only && !matchesOnly(rel, only)) continue;
    const kind = classifyPath(rel, manifest);
    if (kind === "never") continue;
    if (!includeSkin && kind === "skin") continue;

    const destAbs = path.join(destRoot, rel);
    if (!fs.existsSync(destAbs)) {
      planned.push({ rel, kind, action: "add", srcAbs, destAbs });
    } else if (!filesEqual(srcAbs, destAbs)) {
      planned.push({ rel, kind, action: "update", srcAbs, destAbs });
    }
  }

  // Detect deletes only when path-filtering is off (safer default: never auto-delete)
  return planned.sort((a, b) => a.rel.localeCompare(b.rel));
}

function matchesOnly(rel, onlySet) {
  for (const p of onlySet) {
    if (rel === p || rel.startsWith(`${p.replace(/\/$/, "")}/`)) return true;
  }
  return false;
}

export async function runSync(argv = []) {
  const opts = parseArgs(argv);
  if (!opts.direction) {
    throw new Error("Usage: brand:sync <pull|push> --from|--to <peer> [--dry-run] [--yes] [--path <rel>]");
  }

  const thisRoot = PLATFORM_ROOT;
  const peerRoot = resolvePeer(opts);

  if (!fs.existsSync(peerRoot)) {
    throw new Error(`Peer not found: ${peerRoot}`);
  }
  if (path.resolve(peerRoot) === path.resolve(thisRoot)) {
    throw new Error("Peer cannot be the same as this repo.");
  }

  const sourceRoot = opts.direction === "pull" ? peerRoot : thisRoot;
  const destRoot = opts.direction === "pull" ? thisRoot : peerRoot;

  // Prefer destination manifest so clones control what they accept as platform,
  // falling back to source if dest is missing one.
  let manifest;
  try {
    manifest = loadPathsManifest(destRoot);
  } catch {
    manifest = loadPathsManifest(sourceRoot);
  }

  const planned = planSync({
    sourceRoot,
    destRoot,
    manifest,
    includeSkin: opts.includeSkin,
    onlyPaths: opts.paths,
  });

  const thisLineage = loadLineage(thisRoot);
  const peerLineage = loadLineage(peerRoot);

  console.log(`\n${c("Brand platform sync", "bold")}`);
  console.log(`  Direction: ${c(opts.direction, "cyan")} (${sourceRoot} → ${destRoot})`);
  console.log(`  This:      ${thisLineage?.brandName || "?"} (${thisLineage?.role || "?"})`);
  console.log(`  Peer:      ${peerLineage?.brandName || "?"} (${peerLineage?.role || "?"})`);
  if (opts.includeSkin) {
    console.log(c("  WARNING: --include-skin will overwrite brand identity files.", "yellow"));
  }

  if (planned.length === 0) {
    console.log(c("\nAlready in sync for selected platform paths.", "green"));
    return;
  }

  const adds = planned.filter((p) => p.action === "add");
  const updates = planned.filter((p) => p.action === "update");
  console.log(`\n${planned.length} file(s): ${adds.length} add, ${updates.length} update\n`);
  printTable(
    planned.slice(0, 80).map((p) => `${p.action.padEnd(6)} [${p.kind}] ${p.rel}`)
  );
  if (planned.length > 80) {
    console.log(c(`  …and ${planned.length - 80} more`, "dim"));
  }

  if (opts.dryRun) {
    console.log(c("\nDry run — no files written.", "dim"));
    return;
  }

  let proceed = opts.yes;
  if (!proceed) {
    const rl = createRl();
    try {
      proceed = await askYesNo(rl, `\nApply ${planned.length} change(s) to ${destRoot}?`, false);
    } finally {
      rl.close();
    }
  }
  if (!proceed) {
    console.log("Aborted.");
    return;
  }

  for (const item of planned) {
    copyFile(item.srcAbs, item.destAbs);
  }

  console.log(c(`\nApplied ${planned.length} file(s).`, "green"));
  console.log(c("Run tests/lint in the destination, then commit.", "dim"));
}

export function runDiff(argv = []) {
  const opts = parseArgs(["pull", ...argv]);
  if (!opts.peer && argv.includes("--peer")) {
    // parseArgs already handled
  }
  // Force dry planning both ways
  opts.dryRun = true;
  const thisRoot = PLATFORM_ROOT;
  const peerRoot = resolvePeer({ ...opts, peer: opts.peer });
  const manifest = loadPathsManifest(
    fs.existsSync(path.join(thisRoot, ".brand/paths.json")) ? thisRoot : peerRoot
  );

  const forward = planSync({
    sourceRoot: peerRoot,
    destRoot: thisRoot,
    manifest,
    includeSkin: false,
    onlyPaths: opts.paths,
  });
  const backward = planSync({
    sourceRoot: thisRoot,
    destRoot: peerRoot,
    manifest,
    includeSkin: false,
    onlyPaths: opts.paths,
  });

  console.log(`\n${c("Platform drift", "bold")}`);
  console.log(`  This ← Peer (pull): ${forward.length} file(s)`);
  printTable(forward.slice(0, 40).map((p) => `${p.action} ${p.rel}`));
  if (forward.length > 40) console.log(c(`  …+${forward.length - 40}`, "dim"));

  console.log(`\n  This → Peer (push): ${backward.length} file(s)`);
  printTable(backward.slice(0, 40).map((p) => `${p.action} ${p.rel}`));
  if (backward.length > 40) console.log(c(`  …+${backward.length - 40}`, "dim"));
}
