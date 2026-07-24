/**
 * Shared helpers for brand clone / sync tooling.
 * No external deps — Node 18+ ESM.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import readline from "node:readline";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const PLATFORM_ROOT = path.resolve(__dirname, "../..");

/** Default parent for new brand clones (`<clonesRoot>/<brand-id>`). */
export const DEFAULT_CLONES_ROOT = "/Users/ryantang/white-label";

export function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

export function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
}

export function loadBrandConfig(repoRoot = PLATFORM_ROOT) {
  const configPath = path.join(repoRoot, ".brand/config.json");
  if (!fs.existsSync(configPath)) {
    return { clonesRoot: DEFAULT_CLONES_ROOT, cloneExclude: [] };
  }
  const raw = loadJson(configPath);
  return {
    clonesRoot: raw.clonesRoot || DEFAULT_CLONES_ROOT,
    cloneExclude: Array.isArray(raw.cloneExclude) ? raw.cloneExclude : [],
    ...raw,
  };
}

/** True if rel path should be omitted from a fresh white-label clone. */
export function isCloneExcluded(relPath, cloneExclude = []) {
  const norm = relPath.replace(/\\/g, "/");
  for (const p of cloneExclude) {
    const pat = p.replace(/\\/g, "/").replace(/\/+$/, "");
    if (norm === pat || norm.startsWith(`${pat}/`)) return true;
  }
  return false;
}

export function defaultCloneDir(brandId, repoRoot = PLATFORM_ROOT) {
  const { clonesRoot } = loadBrandConfig(repoRoot);
  return path.join(path.resolve(clonesRoot), brandId);
}

export function loadPathsManifest(repoRoot = PLATFORM_ROOT) {
  const manifestPath = path.join(repoRoot, ".brand/paths.json");
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Missing ${manifestPath}. This repo is not brand-tooling ready.`);
  }
  return loadJson(manifestPath);
}

export function loadLineage(repoRoot = PLATFORM_ROOT) {
  const lineagePath = path.join(repoRoot, ".brand/lineage.json");
  if (!fs.existsSync(lineagePath)) return null;
  return loadJson(lineagePath);
}

export function createRl() {
  return readline.createInterface({ input: process.stdin, output: process.stdout });
}

export function ask(rl, question, defaultValue = "") {
  const suffix = defaultValue ? ` (${defaultValue})` : "";
  return new Promise((resolve) => {
    rl.question(`${question}${suffix}: `, (answer) => {
      const trimmed = answer.trim();
      resolve(trimmed || defaultValue);
    });
  });
}

export async function askYesNo(rl, question, defaultYes = true) {
  const hint = defaultYes ? "Y/n" : "y/N";
  const answer = (await ask(rl, `${question} [${hint}]`)).toLowerCase();
  if (!answer) return defaultYes;
  return answer === "y" || answer === "yes";
}

export function slugify(input) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function isHexColor(value) {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value);
}

/** Minimal glob: `*` within a segment, `**` across segments. */
export function matchGlob(relPath, pattern) {
  const norm = relPath.replace(/\\/g, "/");
  const pat = pattern.replace(/\\/g, "/").replace(/\/+$/, "");
  if (norm === pat || norm.startsWith(`${pat}/`)) return true;

  const esc = (s) => s.replace(/[.+^${}()|[\]\\]/g, "\\$&");
  const parts = pat.split("/");
  let re = "^";
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (part === "**") {
      re += i === parts.length - 1 ? ".*" : "(?:.*/)?";
      continue;
    }
    re += part.split("*").map(esc).join("[^/]*");
    if (i < parts.length - 1) re += "/";
  }
  re += "(?:/.*)?$";
  return new RegExp(re).test(norm);
}

export function classifyPath(relPath, manifest) {
  const norm = relPath.replace(/\\/g, "/");
  for (const p of manifest.never || []) {
    if (matchGlob(norm, p)) return "never";
  }
  // Skin wins over platform when both match (identity must not be overwritten).
  for (const p of manifest.skin || []) {
    if (matchGlob(norm, p)) return "skin";
  }
  for (const p of manifest.platform || []) {
    if (matchGlob(norm, p)) return "platform";
  }
  return "unlisted";
}

export function walkFiles(root, { relativeTo = root } = {}) {
  const out = [];
  if (!fs.existsSync(root)) return out;

  const stack = [root];
  while (stack.length) {
    const current = stack.pop();
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const abs = path.join(current, entry.name);
      const rel = path.relative(relativeTo, abs).replace(/\\/g, "/");
      if (entry.name === ".git" || entry.name === "node_modules" || entry.name === ".next") {
        continue;
      }
      if (entry.isDirectory()) {
        stack.push(abs);
      } else if (entry.isFile() || entry.isSymbolicLink()) {
        out.push({ abs, rel });
      }
    }
  }
  return out.sort((a, b) => a.rel.localeCompare(b.rel));
}

export function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

export function copyFile(src, dest) {
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
}

export function git(cmd, cwd, { optional = false } = {}) {
  try {
    return execSync(`git ${cmd}`, {
      cwd,
      encoding: "utf8",
      stdio: optional ? ["ignore", "pipe", "ignore"] : undefined,
    }).trim();
  } catch (err) {
    if (optional) return null;
    throw err;
  }
}

export function fileHash(absPath) {
  const buf = fs.readFileSync(absPath);
  // Fast enough for sync previews without crypto import ceremony
  let h = 0;
  for (let i = 0; i < buf.length; i++) h = (Math.imul(31, h) + buf[i]) | 0;
  return `${buf.length}:${h}`;
}

export function filesEqual(a, b) {
  if (!fs.existsSync(a) || !fs.existsSync(b)) return false;
  const sa = fs.statSync(a);
  const sb = fs.statSync(b);
  if (sa.size !== sb.size) return false;
  return fileHash(a) === fileHash(b);
}

/**
 * Build a set of relative platform files present in `root`.
 * Includes unlisted files that are clearly under src/ platform areas when
 * classify returns platform; skips never/skin.
 */
export function listClassifiedFiles(repoRoot, manifest, kinds = ["platform"]) {
  const kindSet = new Set(kinds);
  const files = walkFiles(repoRoot);
  return files.filter(({ rel }) => kindSet.has(classifyPath(rel, manifest)));
}

export function printTable(rows) {
  for (const row of rows) {
    console.log(`  ${row}`);
  }
}

export function c(text, color) {
  const codes = {
    dim: "\x1b[2m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    cyan: "\x1b[36m",
    red: "\x1b[31m",
    bold: "\x1b[1m",
    reset: "\x1b[0m",
  };
  if (!process.stdout.isTTY) return text;
  return `${codes[color] || ""}${text}${codes.reset}`;
}
