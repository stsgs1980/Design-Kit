#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync } from "node:fs";

const PATTERNS_DIR = "components/patterns";
const ENTRIES_DIR = "lib/patterns/entries";
const KIT_ENTRIES_DIR = "lib/kit/entries";
const REGISTRY = `${PATTERNS_DIR}/_shared/registry.ts`;
const DOCS = "docs/PATTERNS.md";

/** Обязательные поля записи паттерна. */
const REQUIRED = [
  "id",
  "name",
  "latin",
  "summary",
  "category",
  "verdict",
  "from",
  "when",
  "composition",
  "rules",
  "pitfalls",
  "cost",
];

const failures = [];
const emoji = /\p{Extended_Pictographic}/u;

/**
 * Разбирает записи манифеста паттернов.
 * @param {string} text - содержимое файла категории
 * @param {string} file - имя файла для сообщений
 * @returns {Array<{ id: string; block: string; file: string }>} записи
 */
function parseEntries(text, file) {
  const starts = [...text.matchAll(/^ {2}\{\n {4}id: "([a-z0-9-]+)",/gm)];

  return starts.map((match, index) => {
    const to = index + 1 < starts.length ? starts[index + 1].index : text.lastIndexOf("];");
    return { id: match[1], block: text.slice(match.index, to), file };
  });
}

/**
 * id компонентов кита из манифеста.
 * @returns {Set<string>} id компонентов
 */
function kitIds() {
  const ids = new Set();

  for (const file of readdirSync(KIT_ENTRIES_DIR).filter((name) => name.endsWith(".ts"))) {
    const text = readFileSync(`${KIT_ENTRIES_DIR}/${file}`, "utf8");
    for (const match of text.matchAll(/^ {4}id: "([a-z0-9-]+)",/gm)) {
      ids.add(match[1]);
    }
  }

  return ids;
}

/** Основная проверка: папки, сцены, реестр, состав и доки. */
function main() {
  const entryFiles = readdirSync(ENTRIES_DIR).filter((file) => file.endsWith(".ts"));
  const entries = entryFiles.flatMap((file) => parseEntries(readFileSync(`${ENTRIES_DIR}/${file}`, "utf8"), file));
  const manifestText = entryFiles.map((file) => readFileSync(`${ENTRIES_DIR}/${file}`, "utf8")).join("\n");
  const registry = existsSync(REGISTRY) ? readFileSync(REGISTRY, "utf8") : "";
  const docs = existsSync(DOCS) ? readFileSync(DOCS, "utf8") : "";
  const kit = kitIds();
  const seen = new Set();

  if (!existsSync(DOCS)) {
    failures.push(`[FAIL] нет файла ${DOCS}`);
  }

  for (const { id, block, file } of entries) {
    if (seen.has(id)) {
      failures.push(`[FAIL] дубль id: ${id}`);
    }
    seen.add(id);

    for (const field of REQUIRED) {
      if (!new RegExp(`^ {4}${field}:`, "m").test(block)) {
        failures.push(`[FAIL] ${file}: ${id} без поля ${field}`);
      }
    }

    if (!existsSync(`${PATTERNS_DIR}/${id}/${id}.demo.tsx`)) {
      failures.push(`[FAIL] ${id}: нет сцены ${PATTERNS_DIR}/${id}/${id}.demo.tsx`);
    }

    if (!new RegExp(`^ {2}"?${id}"?:`, "m").test(registry)) {
      failures.push(`[FAIL] ${id}: нет в реестре сцен ${REGISTRY}`);
    }

    if (!registry.includes(`patterns/${id}/${id}.demo`)) {
      failures.push(`[FAIL] ${id}: реестр не импортирует сцену ${id}`);
    }

    const composition = block.match(/composition: \[([\s\S]*?)\n {4}\],/)?.[1] ?? "";
    const parts = [...composition.matchAll(/kit: "([a-z0-9-]+)"/g)].map((match) => match[1]);

    if (parts.length === 0) {
      failures.push(`[FAIL] ${id}: композиция пуста`);
    }

    for (const part of parts) {
      if (!kit.has(part)) {
        failures.push(`[FAIL] ${id}: состав ссылается на несуществующий компонент "${part}"`);
      }
    }

    const source = /^ {4}source: "([^"]+)"/m.exec(block)?.[1] ?? "";
    const concept = /^ {4}origin: "concept"/m.test(block);

    if (!concept && !source.startsWith("https://patterns-museum.vercel.app/")) {
      failures.push(`[FAIL] ${id}: source должен вести в музей паттернов, сейчас "${source}"`);
    }

    if (concept && !/^ {4}notes: "/m.test(block)) {
      failures.push(`[FAIL] ${id}: у собственного приёма нет поля notes — читателю нужен референс`);
    }

    if (docs && !docs.includes(id)) {
      failures.push(`[FAIL] ${id}: не упомянут в ${DOCS}`);
    }
  }

  for (const name of readdirSync(PATTERNS_DIR, { withFileTypes: true })) {
    if (!name.isDirectory() || name.name.startsWith("_")) {
      continue;
    }
    if (!seen.has(name.name)) {
      failures.push(`[FAIL] ${PATTERNS_DIR}/${name.name} есть в коде, но нет записи в манифесте`);
    }
  }

  if (emoji.test(manifestText)) {
    failures.push("[FAIL] в манифесте паттернов есть эмодзи");
  }

  if (failures.length > 0) {
    failures.forEach((line) => console.error(line));
    process.exit(1);
  }

  const parts = new Set(entries.flatMap(({ block }) => [...block.matchAll(/kit: "([a-z0-9-]+)"/g)].map((m) => m[1])));
  process.stdout.write(`[OK] verify-patterns: паттернов ${entries.length}, занято компонентов ${parts.size}.\n`);
}

main();
