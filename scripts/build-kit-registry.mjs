#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";

const KIT_DIR = "components/kit";
const REGISTRY = "components/kit/_shared/registry.ts";

/**
 * Имя компонента демо из id: "border-beam" -> "BorderBeamDemo".
 * @param {string} id - id компонента (имя папки)
 * @returns {string} имя экспорта
 */
function demoName(id) {
  const pascal = id
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");

  return `${pascal}Demo`;
}

/** Строковый ключ объекта: кавычки только для не-идентификаторов (dither vs dot-pattern). */
function key(id) {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(id) ? id : `"${id}"`;
}

/**
 * Папки кита, у которых есть демо-сцена.
 * @returns {{ id: string; name: string }[]} id и имя экспорта, по алфавиту
 */
function collect() {
  return readdirSync(KIT_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("_"))
    .map((entry) => entry.name)
    .filter((id) => existsSync(`${KIT_DIR}/${id}/${id}.demo.tsx`))
    .sort()
    .map((id) => ({ id, name: demoName(id) }));
}

/**
 * Текст реестра: импорты демо и карта id -> компонент.
 * @param {{ id: string; name: string }[]} items - список демо
 * @returns {string} содержимое registry.ts
 */
function render(items) {
  const imports = items
    .map(({ id, name }) => `import { ${name} } from "@/components/kit/${id}/${id}.demo";`)
    .join("\n");
  const map = items.map(({ id, name }) => `  ${key(id)}: ${name},`).join("\n");

  return `// Сгенерировано scripts/build-kit-registry.mjs. Не редактировать руками:
// список демо берётся из папок components/kit/<id>/<id>.demo.tsx.
import type { ReactElement } from "react";

${imports}

/** Демо-сцены по id компонента. */
export const kitDemos: Record<string, () => ReactElement> = {
${map}
};
`;
}

const check = process.argv.includes("--check");
const items = collect();
const next = render(items);

if (check) {
  const current = existsSync(REGISTRY) ? readFileSync(REGISTRY, "utf8") : "";

  if (current !== next) {
    console.error(`[FAIL] ${REGISTRY} устарел: запустите node scripts/build-kit-registry.mjs`);
    process.exit(1);
  }

  process.stdout.write(`[OK] Реестр демо актуален: ${items.length} сцен.\n`);
} else {
  writeFileSync(REGISTRY, next);
  process.stdout.write(`[OK] ${REGISTRY}: ${items.length} сцен.\n`);
}
