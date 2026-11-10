#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";

const KIT_DIR = "components/kit";
const ENTRIES_DIR = "lib/kit/entries";
const DOCS = "docs/KIT.md";
const MANIFEST = "lib/kit/manifest.ts";
const PLACES = "components/guide/catalog/places.ts";
const REGISTRY_CHECK = "scripts/build-kit-registry.mjs";

/** Обязательные поля записи манифеста. */
const REQUIRED = [
  "id",
  "name",
  "ru",
  "what",
  "category",
  "verdict",
  "tech",
  "cost",
  "surfaces",
  "source",
  "file",
  "usage",
];

const failures = [];
const emoji = /\p{Extended_Pictographic}/u;

/**
 * Разбирает записи манифеста: одна запись — блок от `id:` до следующей записи.
 * @param {string} text - содержимое файла категории
 * @param {string} file - имя файла для сообщений об ошибках
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
 * Значение строкового поля внутри записи.
 * @param {string} block - текст одной записи
 * @param {string} name - имя поля
 * @returns {string | undefined} значение без кавычек
 */
function stringField(block, name) {
  return new RegExp(`^ {4}${name}: "([^"]+)"`, "m").exec(block)?.[1];
}

/**
 * Папки компонентов кита (без служебного каталога _shared).
 * @returns {string[]} id компонентов
 */
function componentIds() {
  return readdirSync(KIT_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("_"))
    .map((entry) => entry.name)
    .sort();
}

/**
 * Основная проверка: папки, демо, манифест, реестр и доки.
 * @returns {void} код выхода 1 при любой ошибке
 */
function main() {
  if (!existsSync(DOCS)) {
    failures.push(`[FAIL] нет файла ${DOCS}`);
  }

  const entryFiles = readdirSync(ENTRIES_DIR)
    .filter((file) => file.endsWith(".ts"))
    .sort();
  const entries = entryFiles.flatMap((file) => {
    const text = readFileSync(`${ENTRIES_DIR}/${file}`, "utf8");
    return parseEntries(text, file);
  });
  const manifestText = entryFiles.map((file) => readFileSync(`${ENTRIES_DIR}/${file}`, "utf8")).join("\n");
  const docs = existsSync(DOCS) ? readFileSync(DOCS, "utf8") : "";
  const ids = componentIds();
  const seen = new Set();

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

    const folder = `${KIT_DIR}/${id}`;
    if (!existsSync(`${folder}/${id}.tsx`)) {
      failures.push(`[FAIL] ${id}: нет компонента ${folder}/${id}.tsx`);
    }
    if (!existsSync(`${folder}/${id}.demo.tsx`)) {
      failures.push(`[FAIL] ${id}: нет демо ${folder}/${id}.demo.tsx`);
    }

    const declared = stringField(block, "file");
    if (declared && declared !== `${folder}/${id}.tsx`) {
      failures.push(`[FAIL] ${id}: file="${declared}", ожидается "${folder}/${id}.tsx"`);
    }

    const name = stringField(block, "name");
    if (name && docs && !docs.includes(name)) {
      failures.push(`[FAIL] ${id}: ${name} не упомянут в ${DOCS}`);
    }

    for (const use of block.match(/uses: \[([^\]]*)\]/)?.[1]?.split(",") ?? []) {
      const reference = use.trim().replace(/"/g, "");
      if (reference && !seen.has(reference) && !ids.includes(reference)) {
        failures.push(`[FAIL] ${id}: uses ссылается на несуществующий id "${reference}"`);
      }
    }
  }

  for (const id of ids) {
    if (!seen.has(id)) {
      failures.push(`[FAIL] ${KIT_DIR}/${id} есть в коде, но нет записи в манифесте`);
    }
  }

  // Поверхности: у каждого значения `surfaces` есть подпись в manifest.ts,
  // и каждое такое место существует в списке «по месту». Иначе компонент
  // с тегом `social` живёт в паспорте, но не находится в навигации.
  const surfaces = [
    ...new Set(
      [...manifestText.matchAll(/surfaces: \[([^\]]*)\]/g)].flatMap((match) =>
        match[1]
          .split(",")
          .map((item) => item.trim().replace(/"/g, ""))
          .filter(Boolean),
      ),
    ),
  ].sort();
  const manifestSource = existsSync(MANIFEST) ? readFileSync(MANIFEST, "utf8") : "";
  const labels = new Set([...manifestSource.matchAll(/^ {2}([a-z-]+): "/gm)].map((match) => match[1]));
  const placesSource = existsSync(PLACES) ? readFileSync(PLACES, "utf8") : "";
  const placeIds = new Set([...placesSource.matchAll(/\bid: "([a-z-]+)"/g)].map((match) => match[1]));

  for (const surface of surfaces) {
    if (!labels.has(surface)) {
      failures.push(`[FAIL] поверхность "${surface}" без подписи в ${MANIFEST}`);
    }
    if (!placeIds.has(surface)) {
      failures.push(`[FAIL] поверхность "${surface}" не попала в вид «по месту» (${PLACES})`);
    }
  }

  if (emoji.test(manifestText)) {
    failures.push("[FAIL] в манифесте есть эмодзи: используйте [OK]/[ADAPT]/[NO]");
  }

  try {
    execFileSync(process.execPath, [REGISTRY_CHECK, "--check"], { stdio: "pipe" });
  } catch (error) {
    failures.push(`[FAIL] ${String(error.stderr ?? error.message).trim()}`);
  }

  if (failures.length > 0) {
    failures.forEach((line) => console.error(line));
    process.exit(1);
  }

  const jsFree = entries.filter(({ block }) => block.includes('js: "0"')).length;
  process.stdout.write(
    `[OK] verify-kit: записей ${entries.length}, компонентов ${ids.length}, реестр демо актуален, ` +
      `без JS: ${jsFree}.\n`,
  );
}

main();
