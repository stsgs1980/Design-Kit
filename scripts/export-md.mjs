#!/usr/bin/env node

/**
 * CLI-выгрузка кита в markdown.
 *
 * Читает те же манифесты, что и UI, но без импорта TS — парсит файлы напрямую,
 * поэтому `kit-export.md` из скрипта совпадает с тем, что копируется кнопкой.
 */

import { readFileSync, readdirSync, writeFileSync } from "node:fs";

const KIT_DIR = "lib/kit/entries";
const PATTERNS_DIR = "lib/patterns/entries";

function parseBlocks(dir) {
  const blocks = [];
  for (const file of readdirSync(dir).filter((name) => name.endsWith(".ts"))) {
    const text = readFileSync(`${dir}/${file}`, "utf8");
    const starts = [...text.matchAll(/^ {2}\{\n {4}id: "([a-z0-9-]+)",/gm)];
    for (let i = 0; i < starts.length; i++) {
      const to = i + 1 < starts.length ? starts[i + 1].index : text.lastIndexOf("];");
      blocks.push({ id: starts[i][1], raw: text.slice(starts[i].index, to) });
    }
  }
  return blocks;
}

const kitBlocks = parseBlocks(KIT_DIR);
const patternBlocks = parseBlocks(PATTERNS_DIR);

function field(block, name) {
  const d = new RegExp(`^ {4}${name}: "([^"]+)"`, "m").exec(block)?.[1];
  if (d) return d;
  return new RegExp(`^ {4}${name}: '([^']+)'`, "m").exec(block)?.[1] ?? "";
}

function extractList(block, key) {
  const match = new RegExp(`${key}: \\[([^\\]]*)\\]`, "s").exec(block);
  if (!match) return [];
  return [...match[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
}

function kitMd(id) {
  const hit = kitBlocks.find((item) => item.id === id);
  if (!hit) return null;
  const block = hit.raw;
  const ru = field(block, "ru");
  const name = field(block, "name");
  const what = field(block, "what");
  const file = field(block, "file");
  const usage = field(block, "usage");
  const source = field(block, "source");
  const tech = field(block, "tech");
  const surfaces = extractList(block, "surfaces").join(" · ");
  return [
    `### ${ru} — ${name}`,
    `- **Что:** ${what}`,
    `- **Куда:** ${surfaces}`,
    `- **Техника:** ${tech} · файл: \`${file}\``,
    `- **Использование:** \`${usage}\``,
    source ? `- **Источник:** ${source}` : null,
    ``,
  ]
    .filter(Boolean)
    .join("\n");
}

function patternMd(id) {
  const hit = patternBlocks.find((item) => item.id === id);
  if (!hit) return null;
  const block = hit.raw;
  const name = field(block, "name");
  const latin = field(block, "latin");
  const summary = field(block, "summary");
  const when = field(block, "when");
  const source = field(block, "source");
  return [
    `### ${name} — ${latin}`,
    `- **Что:** ${summary}`,
    `- **Когда:** ${when}`,
    source ? `- **Источник:** ${source}` : null,
    ``,
  ]
    .filter(Boolean)
    .join("\n");
}

const args = process.argv.slice(2);
const kitArg = args.find((part) => part.startsWith("--kit="))?.slice("--kit=".length) ?? "";
const patArg = args.find((part) => part.startsWith("--patterns="))?.slice("--patterns=".length) ?? "";
const expArg = args.find((part) => part.startsWith("--export="))?.slice("--export=".length) ?? "";
const outArg = args.find((part) => part.startsWith("--out="))?.slice("--out=".length) ?? "kit-export.md";
const all = args.includes("--all");

let kitIds = [];
let patIds = [];

if (all) {
  kitIds = kitBlocks.map((item) => item.id);
  patIds = patternBlocks.map((item) => item.id);
} else {
  const raw = expArg ? expArg.split(",") : [...kitArg.split(","), ...patArg.split(",")];
  for (const id of raw.map((part) => part.trim()).filter(Boolean)) {
    if (kitBlocks.some((item) => item.id === id)) kitIds.push(id);
    else if (patternBlocks.some((item) => item.id === id)) patIds.push(id);
  }
}

const header = `# Кит — выгрузка\n> ${kitBlocks.length} компонента · ${patternBlocks.length} приёмов · Design Kit ${new Date().toISOString().slice(0, 10)}\n`;
let body = header + "\n";

if (kitIds.length === 0 && patIds.length === 0) {
  body += "_Ничего не выбрано._\n";
} else {
  if (kitIds.length > 0) {
    body += "## Компоненты\n\n";
    for (const id of kitIds) body += (kitMd(id) ?? "") + "\n";
  }
  if (patIds.length > 0) {
    body += "## Приёмы\n\n";
    for (const id of patIds) body += (patternMd(id) ?? "") + "\n";
  }
}

writeFileSync(outArg, body, "utf8");
process.stdout.write(`[OK] export-md: ${kitIds.length} kit + ${patIds.length} patterns -> ${outArg}\n`);
