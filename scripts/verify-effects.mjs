#!/usr/bin/env node
/**
 * Приёмочный прогон эффектов и страниц.
 *
 * Запуск:  npm run verify:effects                (по умолчанию http://localhost:3000)
 *          BASE_URL=http://localhost:3000 npm run verify:effects
 *
 * Что проверяет (и почему именно это):
 *   1. ошибки в консоли на обеих темах и на всех публичных страницах, включая кит, — главный индикатор
 *      гидрационного рассинхрона, скрипт-тегов и падений в клиентских компонентах;
 *   2. css-маркер `--css-build` — если он пустой, вкладка/сборка показывает старый CSS;
 *   3. наличие и количество точек карты в hero (1400 ± 100) и копий ленты (3) —
 *      «тихие» регрессии после правок раскладки;
 *   4. переполнение по горизонтали на 390 / 768 / 1440 px;
 *   5. `prefers-reduced-motion` реально останавливает ленты;
 *   6. кадры секций в обеих темах в `.cache/verify/`;
 *   7. каталог един: вкладки «кит/паттерны» переключаются на месте, пропсы живут в паспорте,
 *      «с чем сочетать» открывает превью рядом, старые маршруты ведут в тот же паспорт;
 *   8. тема на `<html>`: класс без инлайнового style — иначе React снова увидит рассинхрон
 *      атрибутов при гидрации (см. `scripts/lib/theme-asserts.mjs`).
 *
 * Скрипт не падает на отсутствии Playwright — он объясняет, что доустановить.
 */

const BASE = process.env.BASE_URL || "http://localhost:3000";
// Служебные кадры прогона — в .cache: он вне снапшота воркспейса, иначе каждая
// проверка добавляла к репозиторию несколько мегабайт картинок.
// fileURLToPath, а не .pathname: на Windows путь из URL приходит как
// "/C:/Users/..." с процентами, и mkdir падает с ENOENT.
const OUT = fileURLToPath(new URL("../.cache/verify/", import.meta.url));

import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { applyTheme } from "./lib/theme.mjs";

import { checkAnchors } from "./lib/anchors.mjs";
import { checkCatalog, checkPlaces } from "./lib/catalog-asserts.mjs";
import { checkKitScenes } from "./lib/kit-scenes.mjs";
import { checkNavigation } from "./lib/nav-asserts.mjs";
import { checkPatternScenes } from "./lib/pattern-scenes.mjs";
import { checkThemeState } from "./lib/theme-asserts.mjs";

let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch {
  console.error(
    "Нужен Playwright:\n  npm i -D playwright && npx playwright install chromium\n" +
      "(бинарники кладутся в ~/.cache/ms-playwright и в снапшот воркспейса не попадают — ставьте заново)",
  );
  process.exit(1);
}

const results = [];
const check = (name, ok, detail = "") => {
  results.push({ name, ok, detail });
  console.log(`${ok ? "[OK]" : "[FAIL]"} ${name}${detail ? ` — ${detail}` : ""}`);
};

const browser = await chromium.launch({
  args: ["--no-sandbox", "--enable-unsafe-swiftshader", "--use-gl=swiftshader"],
});

/* --- 1. консоль + темы --- */

// Кадры прогона живут в .cache: вне снапшота и вне git
mkdirSync(OUT, { recursive: true });

for (const theme of ["light", "dark"]) {
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
  });
  await applyTheme(ctx, theme);
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text().slice(0, 160));
  });

  for (const path of ["/", "/#patterns", "/guide", "/kit", "/patterns", "/#c-number-ticker", "/#c-glass-clay"]) {
    errors.length = 0;
    await page.goto(BASE + path, { waitUntil: "load" });
    await page.waitForTimeout(1500);
    check(`консоль ${path} (${theme})`, errors.length === 0, errors.slice(0, 2).join(" | "));
  }

  await page.goto(BASE + "/", { waitUntil: "load" });
  await page.waitForTimeout(800);

  const cssBuild = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue("--css-build").trim(),
  );
  check(`css-маркер (${theme})`, cssBuild.length > 0, cssBuild || "пусто — CSS устарел");

  // Справочник: стартовый экран, каталог с сайдбаром, обратный разворот по местам.
  const mapDots = await page.locator('#start svg[aria-label="Карта покрытия"] circle').count();
  check(`карта мира на старте (${theme})`, mapDots > 1300 && mapDots < 1500, `${mapDots}`);

  const sidebarItems = await page.locator("#catalog aside button").count();
  // Число держим равным манифесту: verify:kit печатает «записей N», сюда
  // приходит та же цифра. Разошлись — значит сайдбар потерял запись.
  check(`пункты сайдбара (${theme})`, sidebarItems === 22, `${sidebarItems}`);

  const passportTitle = await page.locator("#catalog article h2").textContent();
  check(`паспорт открыт по умолчанию (${theme})`, (passportTitle ?? "").length > 2, passportTitle ?? "");

  const passportCode = await page.locator("#catalog-pane article code").allTextContents();
  const usage = passportCode.filter((snippet) => snippet.includes("<"));
  check(`код в паспорте (${theme})`, usage.length === 1, usage.join(" | ") || "сниппета нет");

  const matrixRows = await page.locator("#matrix tbody tr").count();
  check(`строки матрицы (${theme})`, matrixRows === 5, `${matrixRows}`);

  const rules = await page.locator("#rules li").count();
  check(`правила сборки (${theme})`, rules === 6, `${rules}`);

  for (const [sel, name] of [
    ["#start", "start"],
    ["#catalog", "catalog"],
    ["#where", "where"],
    ["#matrix", "matrix"],
    ["#rules", "rules"],
  ]) {
    const loc = page.locator(sel);
    await loc.scrollIntoViewIfNeeded();
    await page.waitForTimeout(700);
    await loc.screenshot({ path: `${OUT}verify-${name}-${theme}.png` });
  }

  await checkPlaces(page, theme, check);

  await checkCatalog(page, BASE, theme, check);

  await ctx.close();
}

await checkKitScenes(browser, BASE, check);
await checkPatternScenes(browser, BASE, check);
await checkAnchors(browser, BASE, check);
await checkNavigation(browser, BASE, check);
await checkThemeState(browser, BASE, check);

/* --- 2. адаптив --- */

for (const width of [390, 768, 1440]) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 }, colorScheme: "dark" });
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "load" });
  await page.waitForTimeout(600);
  const overflow = await page.evaluate(() => {
    const doc = document.documentElement.scrollWidth - window.innerWidth;
    const bad = [];
    document.querySelectorAll("h1,h2,h3,p,span,a,button").forEach((el) => {
      const cs = getComputedStyle(el);
      // truncate с многоточием — осознанное поведение, а не переполнение
      if (cs.textOverflow === "ellipsis") return;
      if (el.clientWidth > 0 && el.scrollWidth > el.clientWidth + 2) {
        bad.push(el.textContent.trim().slice(0, 30));
      }
    });
    return { doc, bad: bad.slice(0, 3) };
  });
  // 12 px «сверх окна» — декоративные CornerPlus (-right-3), они вне потока
  check(`нет текстовых переполнений @${width}`, overflow.bad.length === 0, overflow.bad.join(" | "));
  check(`нет горизонтального скролла @${width}`, overflow.doc <= 16, `docOverflow ${overflow.doc}px`);
  await ctx.close();
}

/* --- 3. reduced motion --- */

{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "load" });
  await page.waitForTimeout(600);

  // В паспорте по умолчанию открыт первый компонент: переключаем на «Ленту».
  await page.evaluate(() => {
    const button = [...document.querySelectorAll("#catalog aside button")].find((el) =>
      (el.textContent ?? "").trim().startsWith("Лента"),
    );
    button?.click();
  });
  await page.waitForTimeout(600);

  const state = await page.evaluate(() => {
    const track = document.querySelector("#catalog article .group")?.firstElementChild;
    return track ? getComputedStyle(track).animationPlayState : "ленты не найдено";
  });
  check("reduced-motion ставит ленты на паузу", state === "paused", state);
  await ctx.close();
}

await browser.close();

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} проверок пройдено`);
if (failed.length) {
  console.log("Провалено: " + failed.map((f) => f.name).join(", "));
  process.exit(1);
}
