#!/usr/bin/env node

import { execSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { isVendored } from "./lib/vendor-dirs.mjs";

const DEFAULT_MAX_LINES = 250;
const EXTENSIONS = /\.(ts|tsx|js|jsx|mts|cts|mjs|cjs)$/;
/** Test files are exempt: the limit must not force splitting one test suite. */
const TEST_FILE = /\.(test|spec)\.(ts|tsx|js|jsx|mts|cts|mjs|cjs)$/;
/** Everything under tests/ or __tests__/ is test support code. */
const TEST_DIR = /(?:^|[\\/])(?:__tests__|tests?)[\\/]/;
/** Directories that never take part in the anti-monolith check. */
const SKIP_DIRS = new Set(["node_modules", ".next", "out", "build", "coverage", ".git", ".cache"]);

const args = process.argv.slice(2);
const checkAll = args.includes("--all");
const maxLinesArg = args.find((arg) => arg.startsWith("--max-lines="));

/**
 * Parse and strictly validate the --max-lines flag.
 * @param {string | undefined} raw - raw flag value without the prefix
 * @returns {number} validated line limit
 */
function parseMaxLines(raw) {
  if (raw === undefined) {
    return DEFAULT_MAX_LINES;
  }

  const parsed = Number(raw.slice("--max-lines=".length));

  if (!Number.isInteger(parsed) || parsed <= 0) {
    console.error(`[FAIL] Invalid --max-lines value: '${raw}'. Expected a positive integer.`);
    process.exit(2);
  }

  return parsed;
}

const MAX_LINES = parseMaxLines(maxLinesArg);

/**
 * Whether the working directory is inside a git repository.
 * @returns {boolean} true when `git rev-parse` succeeds
 */
function isGitRepo() {
  try {
    execSync("git rev-parse --is-inside-work-tree", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

/**
 * Recursively collect source files outside the skipped directories.
 * @param {string} dir - directory to walk
 * @returns {string[]} file paths with forward slashes
 */
function walk(dir) {
  const out = [];

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name).replace(/\\/g, "/");

    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name) && !isVendored(full)) {
        out.push(...walk(full));
      }
    } else if (EXTENSIONS.test(entry.name)) {
      out.push(full);
    }
  }

  return out;
}

/**
 * Files to check: staged files by default, the whole tree with --all.
 * Without git (exported archive) the whole tree is checked either way.
 * @returns {string[]} file paths to check
 */
function listFiles() {
  if (!isGitRepo()) {
    return walk(".");
  }

  const command = checkAll ? "git ls-files -z" : "git diff --cached --name-only --diff-filter=ACM -z";

  return execSync(command, { encoding: "utf8" })
    .split("\0")
    .filter((file) => EXTENSIONS.test(file));
}

/**
 * Whether test code is exempt from the anti-monolith limit.
 * @param {string} file - repository-relative path
 * @returns {boolean} true for *.test.* and *.spec.* files and tests/ or __tests__/ trees
 */
function isTestFile(file) {
  return TEST_FILE.test(file) || TEST_DIR.test(file);
}

/**
 * Anti-monolith check: TS/JS source files must not exceed MAX_LINES.
 * Test files (*.test.*, *.spec.*, tests/, __tests__/) are exempt.
 * @returns {void}
 */
function main() {
  // Вендорный код приходит как есть: чужие скрипты на 700 строк — не наш монолит.
  const candidates = listFiles().filter((file) => !isVendored(file));
  const files = candidates.filter((file) => !isTestFile(file));
  const skippedTests = candidates.length - files.length;

  let failed = 0;

  for (const file of files) {
    if (!existsSync(file)) {
      continue;
    }

    // A trailing newline terminates the last line; it is not an extra line.
    const content = readFileSync(file, "utf8").replace(/\r?\n$/, "");
    const lines = content.split("\n").length;

    if (lines > MAX_LINES) {
      console.error(`[FAIL] File '${file}' has ${lines} lines. Limit: ${MAX_LINES}.`);
      failed = 1;
    }
  }

  if (failed) {
    console.error("[Anti-Monolith] Commit rejected.");
    process.exit(1);
  }

  process.stdout.write(
    `[OK] Checked files: ${files.length}, tests skipped: ${skippedTests}. Limit: ${MAX_LINES} lines.\n`,
  );
}

main();
