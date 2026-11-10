#!/usr/bin/env node

/**
 * Гейт вендорных каталогов.
 *
 * Проверяет не «работает ли скил», а то, что наш собственный набор проверок
 * его не трогает: пять инструментов собирают файлы по своим правилам, и один
 * забытый игнор роняет сборку на чужом коде. Плюс ловит импорт из вендорного
 * каталога в наш код — скилы не должны протекать в бандл.
 *
 * Сейчас вендорного кода в репозитории нет (скилы приходят из глобальной
 * установки), поэтому гейт проверяет две вещи по обе стороны: лежащий на
 * диске каталог обязан быть заявлен в `VENDOR_DIRS`, а заявленный — обязан быть
 * исключен у всех пяти инструментов.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import { VENDOR_DIRS, isVendored, vendorRoots } from "./lib/vendor-dirs.mjs";

const ROOT = process.cwd();
let failed = 0;

/**
 * Каталоги, которые могут оказаться в репозитории: их наличие обязано быть
 * объявлено, иначе чужой код снова попадёт под наши гейты.
 */
const CANDIDATE_DIRS = [".claude/skills", ".claude/agents", ".cursor/rules", ".windsurf/rules"];

/**
 * Печать одной проверки в общем формате прогонов.
 * @param {string} title - что именно проверяли
 * @param {boolean} ok - результат
 * @param {string} detail - короткая расшифровка
 * @returns {void}
 */
function check(title, ok, detail) {
  if (!ok) {
    failed += 1;
  }

  process.stdout.write(`${ok ? "[OK]" : "[FAIL]"} ${title}${detail ? ` — ${detail}` : ""}\n`);
}

/**
 * Есть ли каталог на диске.
 * @param {string} dir путь от корня
 * @returns {boolean} true, если это каталог
 */
function isDirectory(dir) {
  return statSync(join(ROOT, dir), { throwIfNoEntry: false })?.isDirectory() ?? false;
}

/**
 * Чтение файла из корня репозитория.
 * @param {string} file - путь от корня
 * @returns {string} содержимое или пустая строка, если файла нет
 */
function read(file) {
  try {
    return readFileSync(join(ROOT, file), "utf8");
  } catch {
    return "";
  }
}

/** Собирает исходники проекта, чтобы найти импорты из вендорных каталогов. */
function projectSources() {
  const out = [];
  const walk = (dir) => {
    for (const entry of readdirSync(join(ROOT, dir), { withFileTypes: true })) {
      const path = dir === "." ? entry.name : `${dir}/${entry.name}`;

      if (isVendored(path) || ["node_modules", ".next", "out", "build", "coverage"].includes(entry.name)) {
        continue;
      }
      if (entry.isDirectory()) {
        walk(path);
      } else if (/\.(ts|tsx|js|jsx|mjs|cjs)$/.test(entry.name)) {
        out.push(path);
      }
    }
  };

  walk(".");

  return out;
}

const onDisk = CANDIDATE_DIRS.filter((dir) => isDirectory(dir));
const undeclared = onDisk.filter((dir) => !VENDOR_DIRS.includes(dir));
check(
  "каталоги вендора на диске объявлены в VENDOR_DIRS",
  undeclared.length === 0,
  undeclared.join(", ") || (onDisk.length ? onDisk.join(", ") : "вендорных каталогов нет"),
);

const eslintConfig = read("eslint.config.mjs");
check(
  "eslint игнорирует вендорные каталоги",
  eslintConfig.includes("VENDOR_GLOBS"),
  "импорт из scripts/lib/vendor-dirs.mjs",
);

const roots = vendorRoots();
const prettierIgnore = read(".prettierignore");
check(
  "prettier игнорирует вендорные каталоги",
  roots.every((root) => prettierIgnore.includes(root)),
  `.prettierignore: ${roots.join(", ")}`,
);

const tsconfig = read("tsconfig.json");
check(
  "tsc не типизирует вендорные каталоги",
  roots.every((root) => tsconfig.includes(`"${root}"`)),
  `tsconfig.json exclude: ${roots.join(", ")}`,
);

const lintMd = read("package.json");
check(
  "markdownlint игнорирует вендорные каталоги",
  roots.every((root) => lintMd.includes(`--ignore ${root}`)),
  `скрипт lint:md: ${roots.join(", ")}`,
);

const length = read("scripts/check-file-length.mjs");
check("анти-монолит игнорирует вендорные каталоги", length.includes("isVendored"), "check-file-length.mjs");

const leaks = projectSources().filter((file) => /from\s+["'][^"']*\.(claude|cursor|windsurf|goose)\//.test(read(file)));
check("наш код не импортирует из вендорных каталогов", leaks.length === 0, leaks.join(", ") || "импортов нет");

if (failed > 0) {
  process.stderr.write(`[FAIL] verify-vendor: ${failed} проверок не прошло.\n`);
  process.exit(1);
}

process.stdout.write("[OK] verify-vendor: вендорные каталоги исключены из всех проверок.\n");
