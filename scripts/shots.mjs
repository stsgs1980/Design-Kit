#!/usr/bin/env node

/**
 * Съёмка подтверждений: обе темы на 1440 px плюс узкий экран 390 px.
 *
 * Скриншоты — часть приёмки («скриншот подтверждает фикс на той же ширине, что
 * превью»), поэтому они должны восстанавливаться одной командой, а не жить
 * в истории переписки. Кадры пишутся в `.cache/shots/`: репозиторию картинки
 * не нужны, а приёмка смотрит их на диске.
 *
 * Запуск: сервер уже слушает 3000 (`npm run start`), затем
 * `node scripts/shots.mjs`.
 */

import { chromium } from "playwright";
import { applyTheme } from "./lib/theme.mjs";

const BASE = process.env.BASE_URL ?? "http://127.0.0.1:3000";
const OUT = ".cache/shots";

/** Сцены, которые снимаем в обеих темах: адрес, селектор, имя файла. */
const SCENES = [
  { id: "c-spotlight-hover", selector: '[data-pattern="spotlight"]', name: "spotlight", hover: 0.62 },
  { id: "c-orbiting-circles", selector: '[data-scene="orbit-circles"]', name: "orbit" },
  { id: "c-scroll-velocity", selector: '[data-scene="velocity"]', name: "velocity", wheel: 320 },
];

/** Блоки интерфейса, которые снимаем как есть. */
const BLOCKS = [
  { name: "rail", selector: "#catalog aside", hash: "catalog" },
  { name: "passport", selector: "#catalog article", hash: "catalog" },
];

/**
 * Кадр стартового экрана в тёмной теме.
 *
 * Снимается отдельно от сцен: он идёт первым в приёмке — с него начинается
 * разговор о главной странице.
 * @param {import("playwright").Browser} browser - браузер
 * @returns {Promise<void>} ничего
 */
async function shootReadme(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await applyTheme(context, "dark");
  const page = await context.newPage();
  await page.goto(`${BASE}/`, { waitUntil: "load" });
  await page.waitForTimeout(2200);
  await page.screenshot({ path: `${OUT}/readme-start.png` });
  await context.close();
  process.stdout.write(`[OK] кадр главной: ${OUT}/readme-start.png\n`);
}

/** Стены кита и паттернов: отдельные страницы со своей шапкой и крошками. */
const WALLS = [
  { name: "wall-kit", route: "/kit" },
  { name: "wall-patterns", route: "/patterns" },
];

/**
 * Снимок одной сцены с наведением: прожектор и лента показывают себя только в движении.
 * @param {import("playwright").Page} page - страница
 * @param {{ id: string, selector: string, name: string, hover?: number, wheel?: number }} scene - описание сцены
 * @param {string} theme - имя темы для файла
 * @returns {Promise<void>} ничего
 */
async function shootScene(page, scene, theme) {
  await page.goto(`${BASE}/#${scene.id}`, { waitUntil: "load" });
  await page.waitForTimeout(1400);

  const target = page.locator(`#catalog ${scene.selector}`).first();
  await target.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);

  if (scene.hover !== undefined) {
    const box = await target.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width * scene.hover, box.y + box.height * 0.5);
      await page.waitForTimeout(400);
    }
  }
  if (scene.wheel !== undefined) {
    await page.mouse.wheel(0, scene.wheel);
    await page.waitForTimeout(500);
  }

  await target.screenshot({ path: `${OUT}/v20-${scene.name}-${theme}.png` });
}

/**
 * Переключатель вида в обоих положениях: активное состояние должно читаться.
 * @param {import("playwright").Page} page - страница
 * @param {string} theme - имя темы для файла
 * @returns {Promise<void>} ничего
 */
async function shootSwitch(page, theme) {
  await page.goto(`${BASE}/#catalog`, { waitUntil: "load" });
  await page.waitForTimeout(1400);

  for (const [view, label] of [
    ["kit", "по компонентам"],
    ["places", "по месту"],
  ]) {
    await page.locator(`#where button:has-text("${label}")`).click();
    await page.waitForTimeout(600);
    await page.locator("#where").scrollIntoViewIfNeeded();
    const box = await page.locator("#where").boundingBox();
    if (!box) continue;
    await page.screenshot({
      path: `${OUT}/v20-switch-${view}-${theme}.png`,
      clip: { x: Math.max(0, box.x - 150), y: Math.max(0, box.y - 20), width: 620, height: box.height + 40 },
    });
  }

  await page.locator("#catalog").screenshot({ path: `${OUT}/v20-catalog-${theme}.png` });
}

/**
 * Полный набор для одной темы.
 * @param {import("playwright").Browser} browser - браузер
 * @param {"light" | "dark"} theme - тема
 * @returns {Promise<void>} ничего
 */
async function shootTheme(browser, theme) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 980 },
    deviceScaleFactor: 1,
  });
  await applyTheme(context, theme);
  const page = await context.newPage();
  page.on("pageerror", (error) => process.stderr.write(`[FAIL] ${theme}: ${String(error)}\n`));

  for (const scene of SCENES) {
    await shootScene(page, scene, theme);
  }
  for (const block of BLOCKS) {
    await page.goto(`${BASE}/#${block.hash}`, { waitUntil: "load" });
    await page.waitForTimeout(1400);
    await page
      .locator(block.selector)
      .first()
      .screenshot({ path: `${OUT}/v20-${block.name}-${theme}.png` });
  }
  for (const wall of WALLS) {
    await page.goto(`${BASE}${wall.route}`, { waitUntil: "load" });
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `${OUT}/v20-${wall.name}-${theme}.png` });
  }

  await shootSwitch(page, theme);

  await context.close();
  process.stdout.write(`[OK] снимки ${theme}\n`);
}

/** Ширины, на которых проверяем горизонтальный скролл: телефон, планшет, ноутбук, монитор. */
const WIDTHS = [390, 768, 1024, 1280, 1440, 1680, 1920];

/**
 * Горизонтальный скролл на всём диапазоне ширин.
 *
 * Раньше проверяли только 390 px и 1440 в теме, и промах «паспорт шире экрана»
 * жил ровно между ними: на 1024-1920 страница уезжала вбок, потому что колонка
 * каталога не имела `min-w-0` и тянулась по содержимому ленты.
 * @param {import("playwright").Browser} browser - браузер
 * @returns {Promise<number>} сколько ширин уехало
 */
async function checkWidths(browser) {
  let broken = 0;

  for (const width of WIDTHS) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
    const page = await context.newPage();

    for (const scene of SCENES) {
      await page.goto(`${BASE}/#${scene.id}`, { waitUntil: "load" });
      await page.waitForTimeout(900);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);

      if (overflow > 0) {
        broken += 1;
        process.stdout.write(`[FAIL] ${width} px ${scene.name}: страница шире экрана на ${overflow} px\n`);
      }
    }

    await context.close();
  }

  process.stdout.write(
    broken === 0
      ? `[OK] ${WIDTHS.join("/")} px: горизонтального скролла нет\n`
      : `[FAIL] горизонтальный скролл на ${broken} проверках\n`,
  );

  return broken;
}

/**
 * Узкий экран: сцены не должны ломать раскладку на 390 px.
 * @param {import("playwright").Browser} browser - браузер
 * @returns {Promise<void>} ничего
 */
async function shootMobile(browser) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    colorScheme: "dark",
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();

  for (const scene of SCENES) {
    await page.goto(`${BASE}/#${scene.id}`, { waitUntil: "load" });
    await page.waitForTimeout(1400);
    const target = page.locator(`#catalog ${scene.selector}`).first();
    await target.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await target.screenshot({ path: `${OUT}/v20-m-${scene.name}.png` });

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    process.stdout.write(`${overflow === 0 ? "[OK]" : "[FAIL]"} 390 px ${scene.name}: overflow ${overflow}\n`);
  }

  await context.close();
}

const browser = await chromium.launch({ args: ["--no-sandbox"] });

try {
  for (const theme of ["light", "dark"]) {
    await shootTheme(browser, theme);
  }
  await shootMobile(browser);
  await shootReadme(browser);
  const brokenWidths = await checkWidths(browser);

  if (brokenWidths > 0) {
    process.exitCode = 1;
  }
} finally {
  await browser.close();
}
