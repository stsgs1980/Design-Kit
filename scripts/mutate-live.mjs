#!/usr/bin/env node

/**
 * Живые мутации: проверки, которые смотрят на отрисованную страницу,
 * нельзя прогнать на копии в /tmp (Turbopack не собирает проект вне корня).
 *
 * Поэтому мутация применяется к рабочей копии, собирается, поднимается
 * отдельный сервер на 3100 и гейт запускается с BASE_URL на него. Файл
 * возвращается в исходное состояние в finally — даже если гейт упал.
 *
 * Запуск: node scripts/mutate-live.mjs [имя мутации]
 */

import { execFileSync, spawn } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";

const PORT = 3100;
const BASE_URL = `http://127.0.0.1:${PORT}`;

/** name, file, было, стало, что обязано покраснеть. */
const MUTATIONS = [
  [
    "aria-missing",
    "components/guide/catalog/catalog.tsx",
    "aria-pressed={view === id}",
    "data-pressed={view === id}",
    "node scripts/verify-effects.mjs",
  ],
  ["wall-header-lost", "app/kit/page.tsx", "<SiteHeader />", "", "node scripts/verify-effects.mjs"],
];

const [, , only] = process.argv;
const picked = MUTATIONS.filter(([name]) => !only || name === only);

/**
 * Ждёт, пока сервер начнёт отвечать.
 * @param {string} url - адрес проверки
 * @param {number} attempts - сколько раз пробовать
 * @returns {Promise<boolean>} поднялся ли сервер
 */
async function waitForServer(url, attempts = 40) {
  for (let index = 0; index < attempts; index += 1) {
    try {
      const response = await fetch(url);

      if (response.ok) {
        return true;
      }
    } catch {
      // сервер ещё поднимается
    }
    await sleep(500);
  }

  return false;
}

/**
 * Собирает проект: без сборки мутация не попадёт в отдаваемый HTML.
 * @returns {void}
 */
function build() {
  execFileSync("npm", ["run", "build"], { stdio: "pipe" });
}

/**
 * Прогоняет одну мутацию и печатает результат.
 * @param {[string, string, string, string, string]} mutation - описание мутации
 * @returns {Promise<boolean>} поймал ли гейт
 */
async function run([name, file, from, to, command]) {
  const original = readFileSync(file, "utf8");

  if (!original.includes(from)) {
    console.error(`[SKIP] ${name}: не найдено «${from}» в ${file} — мутация устарела`);
    return false;
  }

  writeFileSync(file, original.replace(from, to));
  let server;
  let caught = false;

  try {
    build();
    server = spawn("npm", ["run", "start", "--", "-p", String(PORT)], { stdio: "ignore", detached: true });
    const alive = await waitForServer(BASE_URL);

    if (!alive) {
      throw new Error("сервер не поднялся");
    }

    try {
      execFileSync("npm", ["exec", "--", "node", command.replace(/^node /, "")], {
        stdio: "pipe",
        env: { ...process.env, BASE_URL },
      });
      caught = false;
    } catch (error) {
      caught = true;
      const output = `${String(error.stdout ?? "")}${String(error.stderr ?? "")}`;
      const line = output.split("\n").find((row) => row.includes("[FAIL]")) ?? "";

      console.log(`${name.padEnd(20)} ${line.trim() || "(гейт упал без [FAIL])"}`);
    }
  } finally {
    if (server) {
      try {
        process.kill(-server.pid);
      } catch {
        // процесс уже завершился
      }
    }
    writeFileSync(file, original);
    build();
  }

  if (!caught) {
    console.error(`${name.padEnd(20)} [SKIP] мутация прошла незамеченной — это дыра в гейтах`);
  }

  return caught;
}

const results = [];

for (const mutation of picked) {
  results.push([mutation[0], await run(mutation)]);
}

const holes = results.filter(([, caught]) => !caught).map(([name]) => name);

console.log(
  holes.length === 0
    ? `[OK] mutate-live: все ${results.length} живых мутаций пойманы.`
    : `[FAIL] mutate-live: пропущено ${holes.length}: ${holes.join(", ")}`,
);

process.exit(holes.length === 0 ? 0 : 1);
