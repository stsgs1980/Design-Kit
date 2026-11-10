/**
 * Правила сверки документации с конфигами.
 *
 * Модуль ничего не читает с диска: на вход приходят путь и текст документа,
 * на выход — список провалов. Обход файлов и вывод результата живут в
 * `scripts/check-docs.mjs`, поэтому правила можно переиспользовать и тестировать
 * отдельно.
 */

import { existsSync } from "node:fs";
import { dirname, join } from "node:path";

/** Инлайн-пути с этими префиксами обязаны существовать в репозитории. */
const PATH_PREFIXES = [
  "app/",
  "components/",
  "lib/",
  "docs/",
  "scripts/",
  ".husky/",
  "eslint-rules/",
  "eslint-parsers/",
  "eslint-processors/",
];

/** Скрипты, которые появятся по плану (docs/KIT.md, фаза 4). */
const KNOWN_FUTURE_SCRIPTS = ["kit:shots"];

/** Если в строке есть этот маркер, пути из неё ещё не созданы — проверка их пропускает. */
const PLAN_MARKER = "[plan]";

const SCRIPT_PATTERN = /npm run ([a-z:.-]+)/g;
const PATH_PATTERN = /`([^`]+\/[^`]*)`/g;
const LINK_PATTERN = /\]\(([^)\s]+)\)/g;
/** Каталоги, которые рождают инструменты: их наличие не проверяем. */
const GENERATED_PREFIXES = [".cache/", ".opencode/"];
const NODE_VERSION_PATTERN = /Node\.js-?\s*(?:%3E%3D|>=)\s*(\d+\.\d+\.\d+)/g;

/** Смещение символа -> номер строки (1-based). */
function lineOf(text, index) {
  return text.slice(0, index).split("\n").length;
}

/** Каждый `npm run <name>` в доках должен быть настоящим скриптом package.json. */
export function checkScriptNames(file, text, scripts, failures) {
  for (const match of text.matchAll(SCRIPT_PATTERN)) {
    const name = match[1].replace(/[.-]+$/, "");

    if (KNOWN_FUTURE_SCRIPTS.includes(name) || name in scripts) {
      continue;
    }

    failures.push(`[FAIL] ${file}:${lineOf(text, match.index ?? 0)} npm run ${name} is not in package.json scripts.`);
  }
}

/**
 * Относительные ссылки в markdown: файл-цель должен существовать.
 *
 * Дыра, из-за которой проверка появилась: в `REPORT.md` ссылки на документы
 * вели как `./CONVENTIONS.md` и `./KIT.md`, хотя файлы лежат в `docs/`. В
 * IDE это выглядело как «Не удаётся разрешить Файл», а гейт молчал: он знал
 * только про инлайновые пути в кавычках.
 * @param {string} file путь к документу
 * @param {string} text содержимое документа
 * @param {string[]} failures список провалов
 * @returns {void}
 */
export function checkRelativeLinks(file, text, failures) {
  const dir = dirname(file);

  for (const match of text.matchAll(LINK_PATTERN)) {
    const target = match[1];
    const at = match.index ?? 0;

    if (/^(https?:|mailto:|tel:|#)/.test(target)) {
      continue;
    }

    const path = target.split("#")[0];

    if (!path) {
      continue;
    }

    // Каталоги и картинки пропускаем: `.cache/` и `.opencode/` рождаются
    // инструментами (`npm run shots`, прогоны, плагин целей), и в части сборок
    // их нет.
    if (!/\.[a-z0-9]+$/i.test(path) || GENERATED_PREFIXES.some((prefix) => path.startsWith(prefix))) {
      continue;
    }

    const resolved = join(dir, decodeURIComponent(path));

    if (!existsSync(resolved)) {
      failures.push(`[FAIL] ${file}:${lineOf(text, at)} link target ${path} does not exist.`);
    }
  }
}

/** Инлайн-пути в доках должны существовать, если строка не помечена [plan]. */
export function checkPaths(file, text, failures) {
  const lines = text.split("\n");

  for (const match of text.matchAll(PATH_PATTERN)) {
    let path = match[1];
    const at = match.index ?? 0;

    if (path.includes("$") || path.includes("*") || path.includes("<") || path.includes("{")) {
      continue;
    }

    const anchor = path.indexOf("#");

    if (anchor !== -1) {
      path = path.slice(0, anchor);
    }

    if (!PATH_PREFIXES.some((prefix) => path.startsWith(prefix)) || existsSync(path)) {
      continue;
    }

    // Каталоги, которые рождают инструменты или которых нет в части сборок
    // (картинки `shots`, служебные каталоги), — их существование не проверяем.
    if (GENERATED_PREFIXES.some((prefix) => path.startsWith(prefix))) {
      continue;
    }

    if (lines[lineOf(text, at) - 1].includes(PLAN_MARKER)) {
      continue;
    }

    failures.push(`[FAIL] ${file}:${lineOf(text, at)} path ${path} does not exist.`);
  }
}

/** У каждого блока кода должен быть язык; JSX помечается tsx, а не typescript. */
export function checkFences(file, text, failures) {
  const lines = text.split("\n");
  let openLine = -1;

  lines.forEach((line, index) => {
    if (!line.startsWith("```")) {
      return;
    }

    if (openLine === -1) {
      openLine = index;

      if (line.trim() === "```") {
        failures.push(`[FAIL] ${file}:${index + 1} fenced block without language tag.`);
      }

      return;
    }

    const info = lines[openLine].trim().slice(3);
    const body = lines.slice(openLine + 1, index).join("\n");

    if (info === "typescript" && /<[A-Z][A-Za-z]*[\s/>]/.test(body)) {
      failures.push(`[FAIL] ${file}:${openLine + 1} JSX snippet must be tagged tsx, not typescript.`);
    }

    openLine = -1;
  });
}

/** Маркеры "Node.js >= x.y.z" в доках должны совпадать с engines.node. */
export function checkNodeVersionMarkers(file, text, engineMin, failures) {
  let markers = 0;

  for (const match of text.matchAll(NODE_VERSION_PATTERN)) {
    markers += 1;

    if (engineMin !== undefined && match[1] !== engineMin) {
      failures.push(`[FAIL] ${file}:${lineOf(text, match.index ?? 0)} Node.js ${match[1]} != engines ${engineMin}.`);
    }
  }

  return file === "README.md" ? markers : 0;
}
