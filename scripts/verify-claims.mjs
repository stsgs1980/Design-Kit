#!/usr/bin/env node

/**
 * Числа в README против манифеста.
 *
 * Документация — тоже утверждение о состоянии проекта. «Пять мест» при
 * десяти местах в манифесте читается как факт, хотя это устаревшая цифра:
 * проверка ловит такие расхождения цифрой, а не глазами ревьюера.
 *
 * Считаем только то, что выводимо из манифеста: компоненты, приёмы, места,
 * занятость и «ноль JS». Формулировки берутся цифрами — иначе русские
 * числительные («семнадцать») сверять нечем.
 */

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const KIT = "lib/kit/entries";
const PATTERNS = "lib/patterns/entries";
const failures = [];

/**
 * Число записей в каталоге манифестов.
 * @param {string} dir - каталог с файлами записей
 * @returns {string[]} содержимое всех файлов
 */
function readAll(dir) {
  return readdirSync(dir)
    .filter((file) => file.endsWith(".ts"))
    .map((file) => readFileSync(`${dir}/${file}`, "utf8"));
}

const kit = readAll(KIT).join("\n");
const patterns = readAll(PATTERNS).join("\n");
const readme = readFileSync("README.md", "utf8");

const count = (text, pattern) => [...text.matchAll(pattern)].length;

const facts = {
  components: count(kit, /^ {4}id: "/gm),
  patterns: count(patterns, /^ {4}id: "/gm),
  noJs: count(kit, /cost: \{ js: "0"/g),
  places: new Set(
    [...kit.matchAll(/surfaces: \[([^\]]+)\]/g)].flatMap((match) =>
      match[1].split(",").map((part) => part.trim().replace(/"/g, "")),
    ),
  ).size,
  used: new Set([...patterns.matchAll(/kit: "([a-z0-9-]+)"/g)].map((match) => match[1])).size,
};

/**
 * Сверка одного утверждения из README.
 * @param {string} title - что проверяем
 * @param {RegExp} pattern - регулярка с числом в первой группе
 * @param {number} expected - ожидаемое число из манифеста
 * @returns {void} пишет строку результата
 */
function claim(title, pattern, expected) {
  const found = readme.match(pattern)?.[1];

  if (found === undefined) {
    failures.push(`[FAIL] README: не найдено утверждение «${title}»`);
    return;
  }
  if (Number(found) !== expected) {
    failures.push(`[FAIL] README: «${title}» — в тексте ${found}, в манифесте ${expected}`);
  }
}

claim("компонентов в ките", /(\d+) компонент[а-я]* с паспортами/, facts.components);
claim("приёмов", /(\d+) приём/, facts.patterns);
claim("занятых компонентов", /(\d+) занятых компонент/, facts.used);
claim("мест страницы", /(\d+) мест страницы/, facts.places);
claim("компонентов без JS", /(\d+) без JS/, facts.noJs);

/** Каталоги, где живёт текст интерфейса. */
const UI_DIRS = ["app", "components", "lib"];

/** Числительные от десяти: в интерфейсе они всегда расходятся с манифестом. */
const NUMERALS =
  /(десять|одиннадцат|двенадцат|тринадцат|четырнадцат|пятнадцат|шестнадцат|семнадцат|восемнадцат|девятнадцат|двадцат)/i;

/**
 * Рекурсивно собирает файлы исходников.
 * @param {string} dir - каталог
 * @returns {string[]} пути к .ts и .tsx
 */
function sources(dir) {
  const out = [];

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!entry.name.startsWith("_") || dir !== "components") {
        out.push(...sources(full));
      }
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      out.push(full);
    }
  }

  return out;
}

// Числительные словами в UI живут отдельно от манифеста и устаревают молча:
// «двадцать компонентов» пережило добавление двух компонентов и никто не заметил.
for (const file of UI_DIRS.flatMap((dir) => sources(dir))) {
  const text = readFileSync(file, "utf8");
  const hit = NUMERALS.exec(text);

  if (hit) {
    const line = text.slice(0, hit.index).split("\n").length;
    failures.push(`[FAIL] ${file}:${line}: число словом «${hit[0]}» — считайте его из манифеста (kitStats)`);
  }
}

if (failures.length > 0) {
  failures.forEach((line) => process.stderr.write(`${line}\n`));
  process.exit(1);
}

process.stdout.write(
  `[OK] verify-claims: README сходится с манифестом — ${facts.components} компонентов, ` +
    `${facts.patterns} приёмов, ${facts.places} мест, ${facts.used} занято, ${facts.noJs} без JS.\n`,
);
