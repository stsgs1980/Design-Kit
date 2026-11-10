/**
 * Проверки темы на `<html>`: класс — единственный источник, инлайнового style
 * быть не должно.
 *
 * Промах, из-за которого проверка появилась: загрузочный скрипт в layout писал
 * `documentElement.style.colorScheme`. До гидрации это добавляло на `<html>`
 * атрибут `style`, которого нет в разметке React, — и React 19 рапортовал
 * рассинхрон: «A tree hydrated but some attributes of the server rendered HTML
 * didn't match the client properties». Теперь `color-scheme` берётся из класса
 * (CSS `.light` / `.dark` в `app/globals.css`), а `suppressHydrationWarning` на
 * `<html>` оставляет победу DOM, когда localStorage и cookie разошлись.
 *
 * Проверка работает и на проде: в продакшене React рассинхрон не логирует,
 * поэтому здесь мы смотрим на сам DOM — инлайновый style и неверный класс
 * видны всегда.
 */

/**
 * Состояние `<html>`: класс, инлайновый style и вычисленный color-scheme.
 * @param {import("playwright").Page} page страница Playwright
 * @returns {Promise<{className: string, style: string | null, colorScheme: string}>} состояние
 */
async function readTheme(page) {
  return page.evaluate(() => ({
    className: document.documentElement.className,
    style: document.documentElement.getAttribute("style"),
    colorScheme: getComputedStyle(document.documentElement).colorScheme,
  }));
}

/**
 * Тема из localStorage без cookie — случай песочницы превью.
 *
 * Сервер тогда отдаёт тёмную тему по умолчанию, а скрипт ставит светлую ещё
 * до гидрации. Если бы React после гидрации вернул серверный класс, выбор
 * человека потерялся бы — поэтому проверяем класс и после гидрации.
 * @param {import("playwright").Browser} browser инстанс Playwright
 * @param {string} base адрес приложения
 * @param {Function} check функция отчёта
 * @returns {Promise<void>} ничего
 */
export async function checkThemeState(browser, base, check) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  // Cookie намеренно нет: так повторяется песочница превью.
  await ctx.addInitScript(() => {
    try {
      localStorage.setItem("theme", "light");
    } catch {
      // приватный режим: остаётся тема сервера
    }
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text().slice(0, 160));
  });

  await page.goto(`${base}/`, { waitUntil: "load" });
  await page.waitForTimeout(1200);

  const state = await readTheme(page);
  check(
    "тема на <html> — это класс, без инлайнового style",
    state.className === "light" && state.style === null && state.colorScheme === "light",
    `class="${state.className}" style=${JSON.stringify(state.style)} color-scheme=${state.colorScheme}`,
  );
  check("гидрация темы без ошибок в консоли", errors.length === 0, errors.slice(0, 2).join(" | ") || "консоль чистая");

  await page.locator('header button[aria-label="Переключить тему"]').click();
  await page.waitForTimeout(400);
  const after = await readTheme(page);
  const cookie = await page.evaluate(() => document.cookie);
  check(
    "тумблер меняет тему и не оставляет инлайновый style",
    after.className === "dark" && after.style === null && after.colorScheme === "dark" && cookie.includes("theme=dark"),
    `class="${after.className}" style=${JSON.stringify(after.style)} color-scheme=${after.colorScheme} cookie="${cookie}"`,
  );

  await ctx.close();
}
