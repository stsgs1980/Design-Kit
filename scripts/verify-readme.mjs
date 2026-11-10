#!/usr/bin/env node

/**
 * README по шаблону `stsgs1980/webstorm-config` (README.template.md).
 *
 * Шаблон — это контракт: заголовок, бейджи, статус, оглавление, фиксированный
 * набор разделов, таблица скриптов и карта документов. Проверка держит контракт
 * машинно, иначе README тихо расходится с шаблоном при каждой правке.
 *
 * Проверяется только то, что можно проверить без сети: разделы, их порядок,
 * якоря оглавления, ссылки на локальные файлы, полнота таблицы скриптов.
 */

import { existsSync, readFileSync } from "node:fs";

const README = "README.md";
const SECTIONS = [
  "Overview",
  "Table of Contents",
  "Features",
  "Tech Stack",
  "Getting Started",
  "Scripts",
  "Docs",
  "Architecture",
  "Contributing",
  "Conventions",
  "License",
];

/** Разделы внутри «Getting Started», которые требует шаблон. */
const GETTING_STARTED = ["Prerequisites", "Installation", "CHANGELOG.md"];

const failures = [];
const readme = readFileSync(README, "utf8");
const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const scripts = pkg.scripts ?? {};

/**
 * Заголовки второго и третьего уровня по порядку.
 * @returns {{ level: number, title: string, anchor: string }[]} заголовки
 */
function headings() {
  return [...readme.matchAll(/^(#{2,3}) (.+)$/gm)].map((match) => ({
    level: match[1].length,
    title: match[2].trim(),
    anchor: match[2]
      .trim()
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s-]/gu, "")
      .replace(/\s+/g, "-"),
  }));
}

const found = headings();

// 1. Бейджи и статус — первым блоком до Overview.
if (!/^\[!\[[^\]]+\]\([^)]+\)\]\([^)]+\)$/m.test(readme)) {
  failures.push("[FAIL] README: нет ни одного бейджа под заголовком");
}
if (!/^> \*\*Status\*\*: [A-Z]+$/m.test(readme)) {
  failures.push("[FAIL] README: нет строки «> **Status**: ACTIVE»");
}
const updated = /^> \*\*Last Updated\*\*: (\d{4}-\d{2}-\d{2})$/m.exec(readme)?.[1];
if (updated === undefined) {
  failures.push("[FAIL] README: нет строки «> **Last Updated**: YYYY-MM-DD»");
} else if (Number.isNaN(Date.parse(updated))) {
  failures.push(`[FAIL] README: дата обновления не разбирается — «${updated}»`);
}

// 2. Разделы шаблона и их порядок.
let cursor = -1;
for (const section of SECTIONS) {
  const index = found.findIndex((heading) => heading.level === 2 && heading.title === section);

  if (index === -1) {
    failures.push(`[FAIL] README: нет обязательного раздела «## ${section}»`);
    continue;
  }
  if (index < cursor) {
    failures.push(`[FAIL] README: раздел «## ${section}» стоит не по порядку шаблона`);
  }
  cursor = index;
}

for (const section of GETTING_STARTED) {
  if (!found.some((heading) => heading.level === 3 && heading.title.startsWith(section))) {
    failures.push(`[FAIL] README: в «Getting Started» нет подраздела «### ${section}»`);
  }
}

// 3. Оглавление: каждый якорь обязан вести на существующий заголовок.
const toc = readme.slice(readme.indexOf("## Table of Contents"), readme.indexOf("## Features"));
const anchors = [...toc.matchAll(/\]\(#([a-z0-9-]+)\)/g)].map((match) => match[1]);

// Шаблон не включает в оглавление ни сам «Table of Contents», ни «Overview»:
// обзор читают сразу, а ссылка на оглавление из оглавления бессмысленна.
const EXPECTED_ANCHORS = SECTIONS.length - 2;

if (anchors.length < EXPECTED_ANCHORS) {
  failures.push(`[FAIL] README: в оглавлении ${anchors.length} пунктов, ожидается минимум ${EXPECTED_ANCHORS}`);
}

for (const anchor of anchors) {
  if (!found.some((heading) => heading.anchor === anchor)) {
    failures.push(`[FAIL] README: якорь оглавления «#${anchor}» никуда не ведёт`);
  }
}

// 4. Локальные ссылки и бейджи: файл должен существовать.
for (const match of readme.matchAll(/\]\((?!https?:|#|mailto:)([^)#]+)(?:#[^)]*)?\)/g)) {
  const path = match[1];

  if (!existsSync(path)) {
    failures.push(`[FAIL] README: ссылка на несуществующий файл «${path}»`);
  }
}

// 4a. Обложка README — единственная картинка, которая остаётся в репозитории:
// кадры приёмки живут в `.cache/shots/`, а обложку нельзя удалить молча.
// Существование самого файла проверяет блок 4 выше.
const README_COVER = "screenshots/readme-start.png";
const coverLine = new RegExp(`^!\\[[^\\]]+\\]\\(${README_COVER.replace(/\./g, "\\.")}\\)$`, "m");
if (!coverLine.test(readme)) {
  failures.push(`[FAIL] README: нет обложки «${README_COVER}»`);
}

// 5. Таблица скриптов: без выдуманных и без забытых.
const documented = new Set([...readme.matchAll(/`npm run ([a-z:.-]+)`/g)].map((match) => match[1]));
const real = new Set(Object.keys(scripts));

for (const name of documented) {
  if (!real.has(name)) {
    failures.push(`[FAIL] README: скрипт «npm run ${name}» не объявлен в package.json`);
  }
}
for (const name of real) {
  if (!documented.has(name)) {
    failures.push(`[FAIL] README: скрипт «npm run ${name}» не описан в README`);
  }
}

// 6. Карта документов: каждый документ из docs/ должен быть в таблице.
const listed = new Set([...readme.matchAll(/\]\((docs\/[a-z-]+\.md|REPORT\.md)\)/gi)].map((match) => match[1]));

for (const file of ["REPORT.md", "docs/KIT.md", "docs/PATTERNS.md", "docs/CONVENTIONS.md"]) {
  if (!listed.has(file)) {
    failures.push(`[FAIL] README: документ «${file}» не попал в таблицу «Docs»`);
  }
}

if (failures.length > 0) {
  failures.forEach((line) => process.stderr.write(`${line}\n`));
  process.exit(1);
}

process.stdout.write(
  `[OK] verify-readme: ${SECTIONS.length} разделов шаблона, ${anchors.length} якорей, ` +
    `${documented.size} скриптов, ${listed.size} документов.\n`,
);
