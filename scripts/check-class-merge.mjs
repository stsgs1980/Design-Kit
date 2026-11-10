#!/usr/bin/env node

/**
 * Проверка склейки классов: `cn` обязан разрешать конфликты Tailwind.
 *
 * Регрессия, ради которой это написано: компонент с базовым `items-start` и
 * потребитель с `items-center` получали оба класса, побеждал порядок правил в
 * собранном CSS — сцена «Прожектор» уезжала вверх, и в разметке всё выглядело
 * правильно. Компилятор такое не видит, lint тоже: это поведение, а не синтаксис.
 *
 * Модуль `lib/tailwind-merge.ts` компилируется во временный CJS и вызывается
 * напрямую: подключать раннер вроде tsx ради одного теста — лишняя зависимость.
 */

import { execFileSync } from "node:child_process";
import { rmSync } from "node:fs";
import { createRequire } from "node:module";

const OUT = ".cache/merge";

/** Кейсы: вход, ожидаемый результат и причина. */
const CASES = [
  ["items-start items-center", "items-center"],
  ["p-2 p-6", "p-6"],
  ["text-sm text-lg", "text-lg"],
  ["text-sm text-left", "text-sm text-left"],
  ["hover:p-2 hover:p-4 p-1", "hover:p-4 p-1"],
  ["dark:bg-card bg-background", "dark:bg-card bg-background"],
  ["w-full max-w-md", "w-full max-w-md"],
  ["rounded-xl rounded-lg", "rounded-lg"],
  ["absolute inset-0 h-full w-full", "absolute inset-0 h-full w-full"],
  ["grid grid-cols-3 gap-2.5", "grid grid-cols-3 gap-2.5"],
  // Оси padding не должны гасить друг друга — это регрессия первой версии
  ["px-3 py-1.5", "px-3 py-1.5"],
  ["p-2 px-4", "px-4"],
  ["px-4 p-2", "p-2"],
  ["gap-x-2 gap-y-4", "gap-x-2 gap-y-4"],
  ["rounded-lg rounded-t-none", "rounded-t-none"],
  ["inset-0 top-2", "top-2"],
];

rmSync(OUT, { recursive: true, force: true });
// Компилятор зовём через node: на Windows запуск .cmd без оболочки запрещён,
// и `npx` падал с ENOENT — проверка не запускалась вовсе.
execFileSync(
  process.execPath,
  [
    "node_modules/typescript/bin/tsc",
    "lib/tailwind-merge.ts",
    "--module",
    "commonjs",
    "--target",
    "es2022",
    "--outDir",
    OUT,
  ],
  {
    stdio: "inherit",
  },
);

const require = createRequire(import.meta.url);
const { mergeClasses } = require(`../${OUT}/tailwind-merge.js`);
const failures = [];

for (const [input, want] of CASES) {
  const got = mergeClasses(input);

  if (got !== want) {
    failures.push(`[FAIL] "${input}" -> "${got}", ждали "${want}"`);
  }
}

if (failures.length > 0) {
  failures.forEach((line) => process.stderr.write(`${line}\n`));
  process.exit(1);
}

process.stdout.write(`[OK] check-class-merge: ${CASES.length} кейсов, конфликты утилит схлопываются.\n`);
