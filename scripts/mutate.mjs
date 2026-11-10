#!/usr/bin/env node

/**
 * Мутационный аудит: зелёный гейт ничего не доказывает, пока мутация не
 * покраснела. Скрипт копирует репозиторий во временный каталог, ломает одну
 * вещь и смотрит, упала ли проверка, которая эту вещь охраняет.
 *
 * Здесь только статические гейты: они не требуют сборки. Проверки, которые
 * смотрят на отрисованную страницу, гоняет `scripts/mutate-live.mjs`.
 *
 * Запуск: node scripts/mutate.mjs [имя мутации]
 */

import { execFileSync } from "node:child_process";
import { cpSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const ROOT = process.cwd();
const WORK = join(tmpdir(), "design-kit-mutant");
const EXCLUDE = new Set([".next", ".cache", "node_modules", ".git"]);

/** name, file, было, стало, какой гейт обязан покраснеть. */
const MUTATIONS = [
  [
    "props-drift",
    "components/kit/orbiting-circles/orbiting-circles.tsx",
    "  radius?: number;",
    "  radiusPx?: number;",
    "npm run verify:props",
  ],
  [
    "props-undocumented",
    "components/kit/orbiting-circles/orbiting-circles.tsx",
    "  iconSize?: number;",
    "  iconSize?: number;\n  glow?: boolean;",
    "npm run verify:props",
  ],
  [
    "cn-merge-broken",
    "lib/tailwind-merge.ts",
    'return next.axis === "all" || previous.axis === next.axis || previous.axis === "all";',
    "return true;",
    "npm run verify:merge",
  ],
  [
    "readme-number-drift",
    "README.md",
    "22 компонента с паспортами",
    "24 компонента с паспортами",
    "npm run verify:claims",
  ],
  [
    "composition-ghost",
    "lib/patterns/entries/interactions.ts",
    'composition: [{ kit: "magic-card"',
    'composition: [{ kit: "magic-card-v2"',
    "npm run verify:patterns",
  ],
  [
    "demo-unregistered",
    "components/kit/_shared/registry.ts",
    '  "orbiting-circles": OrbitingCirclesDemo,\n',
    "",
    "npm run verify:kit",
  ],
  ["surface-orphan", "components/guide/catalog/places.ts", '  { id: "nav" },\n', "", "npm run verify:kit"],
  [
    "console-left",
    "components/kit/marquee/marquee.tsx",
    "export function Marquee(",
    "console.log('debug');\n\nexport function Marquee(",
    "npm run lint",
  ],
  [
    "emoji-in-ui",
    "components/kit/marquee/marquee.demo.tsx",
    "export function MarqueeDemo(",
    "const BAD = '\u2705';\n\nexport function MarqueeDemo(",
    "npm run lint",
  ],
  ["doc-ghost-path", "README.md", "npm run verify:vendor", "node scripts/nope.mjs", "npm run check:docs"],
  [
    "long-file",
    "components/kit/marquee/marquee.tsx",
    "export function Marquee(",
    `${Array.from({ length: 260 }, (_, index) => `// ${index}`).join("\n")}\n\nexport function Marquee(`,
    "npm run check:file-length",
  ],
  [
    "source-missing",
    "lib/kit/entries/motion.ts",
    '    source: "https://magicui.design/docs/components/orbiting-circles",\n',
    "",
    "npm run verify:kit",
  ],
  [
    "source-404",
    "lib/kit/entries/text.ts",
    'source: "https://magicui.design/docs/components/highlighter"',
    'source: "https://magicui.design/docs/components/text-highlighter-404"',
    "npm run verify:links",
  ],
  [
    "spelled-number",
    "components/guide/hero.tsx",
    "{kitStats().total} компонента.",
    "Двадцать компонентов.",
    "npm run verify:claims",
  ],
  ["readme-section-lost", "README.md", "## Architecture", "### Architecture", "npm run verify:readme"],
  ["claim-ghost-place", "lib/kit/manifest.ts", 'code: "код и данные",\n', "", "npm run verify:kit"],
];

/**
 * Копия репозитория во временном каталоге, чтобы не трогать рабочую копию.
 * @returns {string} путь к копии
 */
function freshCopy() {
  rmSync(WORK, { recursive: true, force: true });
  mkdirSync(WORK, { recursive: true });
  cpSync(ROOT, WORK, {
    recursive: true,
    filter: (path) => !EXCLUDE.has(path.replace(`${ROOT}/`, "").split("/")[0]),
  });
  symlinkSync(join(ROOT, "node_modules"), join(WORK, "node_modules"));
  return WORK;
}

/**
 * Прогоняет одну мутацию в отдельной копии.
 * @param {string[]} mutation - описание мутации
 * @returns {boolean} поймал ли гейт
 */
function run([name, file, from, to, command]) {
  const dir = freshCopy();
  const target = join(dir, file);
  const original = readFileSync(target, "utf8");

  if (!original.includes(from)) {
    console.error(`${name.padEnd(22)} [SKIP] мутация устарела: «${from}» нет в ${file}`);
    return false;
  }

  writeFileSync(target, original.replace(from, to));

  try {
    execFileSync("npm", command.split(" ").slice(1), { cwd: dir, stdio: "pipe" });
    console.error(`${name.padEnd(22)} [SKIP] мутация прошла незамеченной — это дыра в гейтах`);
    return false;
  } catch (error) {
    const output = `${String(error.stdout ?? "")}${String(error.stderr ?? "")}`;
    const line = output.split("\n").find((row) => row.includes("[FAIL]") || row.includes("error")) ?? "";

    console.log(`${name.padEnd(22)} ${command.padEnd(24)} поймал  ${line.trim().slice(0, 100)}`);
    return true;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const [, , only] = process.argv;
const picked = MUTATIONS.filter(([name]) => !only || name === only);
const holes = picked.filter((mutation) => !run(mutation)).map(([name]) => name);

console.log(
  holes.length === 0
    ? `[OK] mutate: все ${picked.length} мутаций пойманы.`
    : `[FAIL] mutate: пропущено ${holes.length} из ${picked.length}: ${holes.join(", ")}`,
);

process.exit(holes.length === 0 ? 0 : 1);
