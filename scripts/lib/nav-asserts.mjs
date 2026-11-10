/**
 * Проверки навигации: каждый видимый переход обязан вести туда, куда обещает.
 *
 * Появились после того, как со «стены» кита нельзя было вернуться в каталог:
 * крошки вели в начало главной, а вкладка каталога не открывалась. Здесь
 * проверяется не «есть ли ссылка», а «куда она приземляется»: вкладка, вид и
 * заголовок паспорта. Состояние читается с ожиданием, а не сразу после клика:
 * иначе проверка ловит разметку до обновления и проходит ложно.
 */

import { checkLayout } from "./layout-asserts.mjs";

/** Состояние каталога после клика: то, что видит человек. */
function readState() {
  const pressed = document.querySelector('#where button[aria-pressed="true"]');
  const pane = document.querySelector("#catalog-pane article h2");
  const box = (selector) => {
    const node = document.querySelector(selector);
    return node ? Math.round(node.getBoundingClientRect().top) : null;
  };

  return {
    hash: window.location.hash,
    path: window.location.pathname,
    kit: document.querySelector("#tab-kit")?.getAttribute("aria-selected") === "true",
    patterns: document.querySelector("#tab-patterns")?.getAttribute("aria-selected") === "true",
    view: pressed?.textContent?.trim() ?? "",
    heading: pane?.textContent?.trim() ?? "",
    catalog: box("#catalog"),
    matrix: box("#matrix"),
    rules: box("#rules"),
    scrolled: Math.round(window.scrollY),
  };
}

/** Свежий документ: `goto` на тот же адрес иначе остаётся переходом внутри страницы. */
async function openHome(page, base) {
  await page.goto(`${base}/`, { waitUntil: "load" });
  await page.waitForTimeout(600);
}

/** Ждёт, пока состояние удовлетворит условию, иначе возвращает последнее. */
async function waitState(page, predicate, timeout = 3000) {
  const deadline = Date.now() + timeout;
  let state = await page.evaluate(readState);

  while (Date.now() < deadline) {
    if (predicate(state)) return state;
    await page.waitForTimeout(100);
    state = await page.evaluate(readState);
  }

  return state;
}

/** Кликает по видимой ссылке с точным текстом в шапке. */
async function clickHeader(page, label) {
  await page.evaluate((text) => {
    const links = [...document.querySelectorAll("header a")];
    links.find((link) => link.textContent?.trim() === text && link.getClientRects().length > 0)?.click();
  }, label);
}

/**
 * Прогоняет навигацию: шапка, крошки, стены и возвраты.
 *
 * @param browser инстанс Playwright
 * @param base адрес приложения
 * @param check функция отчёта из основного скрипта
 */
export async function checkNavigation(browser, base, check) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(String(error)));

  const cases = [
    ["Каталог", (s) => s.kit && Math.abs(s.catalog ?? -999) < 220],
    ["По месту", (s) => s.view.includes("по месту") && s.heading.length > 0],
    ["Наборы", (s) => s.patterns && s.heading === "Первый экран"],
    ["Цена", (s) => Math.abs(s.matrix ?? -999) < 260],
    ["Правила", (s) => Math.abs(s.rules ?? -999) < 260],
  ];

  for (const [label, ok] of cases) {
    await openHome(page, base);
    await clickHeader(page, label);
    const state = await waitState(page, ok, 2500);
    check(`шапка: «${label}» ведёт в цель`, ok(state), `hash ${state.hash || "пусто"}, «${state.heading}»`);
  }

  // Логотип возвращает на стартовый экран, а не «куда-нибудь вверх».
  await openHome(page, base);
  await page.evaluate(() => {
    window.location.hash = "#rules";
  });
  await page.waitForTimeout(600);
  // Настоящий клик, а не `el.click()` из evaluate: браузер прокручивает к
  // фрагменту только на пользовательском переходе, синтетический клик менял
  // hash и оставлял страницу на месте — проверка падала не по делу.
  await page.locator('header a[href="/#start"]').click();
  const brand = await waitState(page, (state) => state.hash === "#start" && state.scrolled < 120, 2500);
  check("логотип возвращает на старт", brand.hash === "#start" && brand.scrolled < 120, `hash ${brand.hash}`);

  // Вкладки и вид: переключение на месте, без перезагрузки.
  await openHome(page, base);
  await page.locator("#tab-patterns").click();
  const tabPatterns = await waitState(page, (state) => state.patterns);
  await page.locator("#tab-kit").click();
  const tabKit = await waitState(page, (state) => state.kit && state.heading.length > 0);
  check(
    "вкладки каталога ходят в обе стороны",
    tabPatterns.patterns && tabKit.kit,
    `${tabPatterns.heading} -> ${tabKit.heading}`,
  );

  // Стена кита: из неё есть выход обратно в каталог на нужную вкладку.
  await openHome(page, base);
  await page.evaluate(() => {
    [...document.querySelectorAll("a")].find((link) => link.textContent?.includes("вся стена"))?.click();
  });
  await page.waitForTimeout(1000);
  const wallPath = await page.evaluate(readState);
  const backLabel = await page.evaluate(() => document.querySelector('nav[aria-label="Маршрут"] a')?.textContent ?? "");
  await page.evaluate(() => document.querySelector('nav[aria-label="Маршрут"] a')?.click());
  const backHome = await waitState(page, (state) => state.kit && Math.abs(state.catalog ?? -999) < 220, 3000);
  check(
    "стена кита -> каталог на вкладку «кит»",
    wallPath.path === "/kit" && backLabel.includes("в каталог") && backHome.kit,
    `${wallPath.path} -> ${backHome.path}${backHome.hash}`,
  );

  // Стена паттернов: то же самое, но на вкладку «паттерны».
  await page.goto(`${base}/patterns`, { waitUntil: "load" });
  await page.waitForTimeout(900);
  await page.evaluate(() => document.querySelector('nav[aria-label="Маршрут"] a')?.click());
  const backPatterns = await waitState(page, (state) => state.patterns && state.heading.length > 0, 3000);
  check(
    "стена паттернов -> каталог на вкладку «паттерны»",
    backPatterns.patterns,
    `${backPatterns.path}${backPatterns.hash} — «${backPatterns.heading}»`,
  );

  // Закон ведёт в живой паттерн: и hash, и паспорт должны смениться.
  await openHome(page, base);
  await page.evaluate(() => {
    window.location.hash = "#rules";
  });
  await page.waitForTimeout(700);
  await page.evaluate(() => {
    [...document.querySelectorAll("#rules a")].find((link) => link.textContent?.includes("пример:"))?.click();
  });
  const law = await waitState(page, (state) => state.heading === "Первый экран", 3000);
  check(
    "закон ведёт в паттерн-пример",
    law.patterns && law.hash === "#c-hero-recipe" && law.heading === "Первый экран",
    `${law.hash} — «${law.heading}»`,
  );

  check("навигация без ошибок в консоли", errors.length === 0, errors.slice(0, 2).join(" | "));
  await ctx.close();

  await checkLayout(browser, base, check);

  // На узком экране разделы шапки доступны: без этого из паспорта некуда деться.
  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const phone = await mobile.newPage();
  await phone.goto(`${base}/`, { waitUntil: "load" });
  await phone.waitForTimeout(800);
  const visible = await phone.evaluate(() =>
    [...document.querySelectorAll("header nav a")]
      .filter((link) => link.getClientRects().length > 0)
      .map((link) => link.textContent?.trim() ?? ""),
  );
  await phone.evaluate(() => {
    [...document.querySelectorAll("header nav a")]
      .find((link) => link.textContent?.trim() === "Каталог" && link.getClientRects().length > 0)
      ?.click();
  });
  const phoneState = await waitState(phone, (state) => state.kit && Math.abs(state.catalog ?? -999) < 220, 2500);
  check(
    "мобильная шапка: разделы на месте",
    visible.filter((label) => label.length > 0).length >= 5 && phoneState.kit,
    `${visible.join(" · ")}`,
  );
  await mobile.close();
}
