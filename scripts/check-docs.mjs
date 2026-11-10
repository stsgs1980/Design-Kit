#!/usr/bin/env node

/**
 * Сверка документации с конфигами: `.nvmrc`, `engines.node`, скрипты, пути,
 * относительные ссылки, языки блоков кода и версия Node.
 *
 * Сами правила живут в `scripts/lib/docs-checks.mjs`; здесь — обход документов,
 * сверка версий и вывод результата.
 */

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import {
  checkFences,
  checkNodeVersionMarkers,
  checkPaths,
  checkRelativeLinks,
  checkScriptNames,
} from "./lib/docs-checks.mjs";

const EXACT_VERSION_PATTERN = /^(\d+)\.(\d+)\.(\d+)$/;
const VERSION_PATTERN = /(\d+)\.(\d+)\.(\d+)/;

/** Рекурсивно собирает .md файлы каталога. */
function collectMarkdown(dir) {
  if (!existsSync(dir)) {
    return [];
  }

  const out = [];

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name).replace(/\\/g, "/");

    if (entry.isDirectory()) {
      out.push(...collectMarkdown(full));
    } else if (entry.name.endsWith(".md")) {
      out.push(full);
    }
  }

  return out;
}

/** Проверяемые доки: README, REPORT и всё под docs/. */
function getDocFiles() {
  const root = ["README.md", "REPORT.md"].filter((file) => existsSync(file));
  return [...root, ...collectMarkdown("docs")];
}

/** Числовое сравнение версий x.y.z. */
function compareVersions(a, b) {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);

  for (let i = 0; i < 3; i += 1) {
    const da = pa[i] ?? 0;
    const db = pb[i] ?? 0;

    if (da !== db) {
      return da - db;
    }
  }

  return 0;
}

/** .nvmrc должен существовать и быть не ниже engines.node; возвращает минимум из engines. */
function checkVersionAlignment(nvmRaw, enginesNode, failures) {
  const nvmVersion = nvmRaw === undefined ? undefined : EXACT_VERSION_PATTERN.exec(nvmRaw)?.[0];
  const engineMin = enginesNode === undefined ? undefined : VERSION_PATTERN.exec(enginesNode)?.[0];

  if (nvmRaw === undefined) {
    failures.push("[FAIL] .nvmrc not found.");
  } else if (nvmVersion === undefined) {
    failures.push("[FAIL] Cannot parse version from .nvmrc.");
  }

  if (enginesNode === undefined) {
    failures.push("[FAIL] engines.node is not set in package.json.");
  } else if (engineMin === undefined) {
    failures.push("[FAIL] Cannot parse version from engines.node.");
  }

  if (nvmVersion !== undefined && engineMin !== undefined && compareVersions(nvmVersion, engineMin) < 0) {
    failures.push(`[FAIL] .nvmrc ${nvmVersion} does not satisfy engines.node ${enginesNode}.`);
  }

  return engineMin;
}

/** Сверяет доки с конфигами: скрипты, пути, языки фенсов, версия Node. */
function main() {
  const pkg = JSON.parse(readFileSync("package.json", "utf8"));
  const nvmRaw = existsSync(".nvmrc") ? readFileSync(".nvmrc", "utf8").trim() : undefined;
  const files = getDocFiles();
  const failures = [];
  const engineMin = checkVersionAlignment(nvmRaw, pkg.engines?.node, failures);
  let readmeMarkers = 0;

  for (const file of files) {
    const text = readFileSync(file, "utf8");

    checkScriptNames(file, text, pkg.scripts, failures);
    checkPaths(file, text, failures);
    checkRelativeLinks(file, text, failures);
    checkFences(file, text, failures);
    readmeMarkers += checkNodeVersionMarkers(file, text, engineMin, failures);
  }

  if (readmeMarkers === 0) {
    failures.push("[FAIL] README.md has no Node.js version marker matching engines.node.");
  }

  if (failures.length > 0) {
    for (const failure of failures) {
      console.error(failure);
    }

    process.exit(1);
  }

  process.stdout.write(`[OK] check-docs: ${files.length} docs files consistent with configs.\n`);
}

main();
