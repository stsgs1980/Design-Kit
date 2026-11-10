#!/usr/bin/env node

/**
 * Паспорт компонента против его публичного типа.
 *
 * Проверка идёт через компилятор TypeScript, а не регулярками: сигнатуры в ките
 * объявлены по-разному (`export type XProps`, инлайн-литерал в параметре,
 * пересечение с `React.SVGProps`). Первая версия скрипта читала только
 * деструктуризацию и поэтому пропускала пропс, объявленный в типе и не
 * разобранный в теле: `tsc` такое не считает ошибкой, паспорт тихо расходился
 * с API.
 *
 * Своими считаются только свойства, объявленные в файле самого компонента:
 * унаследованные пропсы React (`className`, `children`, SVG-атрибуты) в паспорт
 * не входят.
 */

import { readFileSync, readdirSync } from "node:fs";

import ts from "typescript";

const KIT_DIR = "components/kit";
const ENTRIES_DIR = "lib/kit/entries";
/** Служебные пропсы разметки: описывать их в паспорте не нужно. */
const IGNORED = new Set(["children", "className", "style"]);
const failures = [];

/** Компилятор по всему проекту: один прогон на все компоненты. */
const configPath = ts.findConfigFile(".", ts.sys.fileExists, "tsconfig.json");
const config = ts.readConfigFile(configPath, ts.sys.readFile);
const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, ".");
const program = ts.createProgram(parsed.fileNames, { ...parsed.options, noEmit: true });
const checker = program.getTypeChecker();

/**
 * Пропсы одного компонента по версии компилятора.
 * @param {string} file - путь к файлу компонента
 * @returns {Set<string> | null} имена пропсов либо null, если компонент не найден
 */
function ownProps(file) {
  const source = program.getSourceFile(file);
  const target = source && ts.isSourceFile(source) ? source : null;

  if (!target) {
    return null;
  }

  const declaration = target.statements.find(
    (node) => ts.isFunctionDeclaration(node) && node.name && /^[A-Z]/.test(node.name.text) && node.parameters[0],
  );

  if (!declaration || declaration.parameters.length === 0) {
    return new Set();
  }

  const propsType = checker.getTypeAtLocation(declaration.parameters[0]);

  return new Set(
    propsType
      .getProperties()
      .filter((property) => {
        const declarations = property.getDeclarations() ?? [];

        return declarations.some((node) => node.getSourceFile().fileName.endsWith(file));
      })
      .map((property) => property.getName()),
  );
}

/**
 * Пропсы из манифеста: поля `name:` внутри `props: [`.
 * @param {string} block - текст одной записи
 * @returns {Set<string>} имена пропсов
 */
function manifestProps(block) {
  const section = block.match(/props: \[([\s\S]*?)\n {4}\],/)?.[1] ?? "";

  return new Set([...section.matchAll(/\{ name: "([^"]+)"/g)].map((match) => match[1]));
}

/**
 * Сверка всех записей кита.
 * @returns {void} код выхода 1 при расхождении
 */
function main() {
  const entries = readdirSync(ENTRIES_DIR).filter((file) => file.endsWith(".ts"));
  const text = entries.map((file) => readFileSync(`${ENTRIES_DIR}/${file}`, "utf8")).join("\n");
  const starts = [...text.matchAll(/^ {2}\{\n {4}id: "([a-z0-9-]+)",/gm)];
  let checked = 0;

  for (const [index, match] of starts.entries()) {
    const id = match[1];
    const block = text.slice(match.index, index + 1 < starts.length ? starts[index + 1].index : text.length);
    const file = `${KIT_DIR}/${id}/${id}.tsx`;
    const inType = ownProps(file);

    if (!inType) {
      failures.push(`[FAIL] ${id}: нет файла ${file}`);
      continue;
    }

    const inManifest = manifestProps(block);

    for (const prop of inType) {
      if (!IGNORED.has(prop) && !inManifest.has(prop)) {
        failures.push(`[FAIL] ${id}: пропс "${prop}" есть в типе, но не в паспорте`);
      }
    }

    for (const prop of inManifest) {
      if (!inType.has(prop)) {
        failures.push(`[FAIL] ${id}: пропс "${prop}" есть в паспорте, но не в типе`);
      }
    }

    checked += 1;
  }

  if (failures.length > 0) {
    failures.forEach((line) => process.stderr.write(`${line}\n`));
    process.exit(1);
  }

  process.stdout.write(`[OK] verify-props: паспорта совпадают с типом, проверено компилятором: ${checked}.\n`);
}

main();
