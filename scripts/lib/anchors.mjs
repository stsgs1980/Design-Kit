/**
 * Проверки навигации: каждая внутренняя ссылка должна вести в существующую цель.
 *
 * Вынесено из `verify-effects.mjs`: у скрипта лимит 250 строк, а проверок,
 * которые смотрят на разметку, становится больше.
 */

/**
 * Проверяет якоря на главной, вкладки каталога и редирект `/guide`.
 *
 * @param browser инстанс Playwright
 * @param base адрес приложения
 * @param check функция отчёта из основного скрипта
 */
export async function checkAnchors(browser, base, check) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await ctx.newPage();
  await page.goto(`${base}/`, { waitUntil: "load" });
  await page.waitForTimeout(600);

  // Якоря вида `#c-<id>` создаются каталогом по выбору: паспорт рисуется только
  // для активной записи. Поэтому их проверяем поведением ниже, а здесь — статику.
  const dead = await page.evaluate(() => {
    const targets = [...document.querySelectorAll('a[href^="#"]')]
      .map((link) => link.getAttribute("href") ?? "")
      .filter((href) => href.length > 1 && !href.startsWith("#c-"));

    return [...new Set(targets)].filter((href) => !document.querySelector(href));
  });
  check("якоря разделов на главной существуют", dead.length === 0, dead.join(", ") || "все ведут в цель");

  const cardLinks = await page.evaluate(() =>
    [...new Set([...document.querySelectorAll('a[href^="#c-"]')].map((link) => link.getAttribute("href")))].filter(
      Boolean,
    ),
  );

  const broken = [];
  for (const href of cardLinks) {
    await page.evaluate((target) => {
      window.location.hash = target;
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    }, href);
    await page.waitForTimeout(120);
    const opened = await page.evaluate((target) => {
      const node = document.querySelector(target);

      return node ? (node.querySelector("h2")?.textContent ?? "").trim() : "";
    }, href);

    if (opened.length === 0) {
      broken.push(href);
    }
  }
  check(
    "ссылки каталога открывают свой паспорт",
    broken.length === 0,
    broken.length > 0 ? broken.join(", ") : `проверено ${cardLinks.length}`,
  );

  // Вкладки каталога переключаются на месте и меняют сайдбар, а не уводят на страницу.
  const patternsTab = await page.evaluate(() => {
    window.location.hash = "#patterns";
    window.dispatchEvent(new HashChangeEvent("hashchange"));

    return new Promise((resolve) => {
      setTimeout(() => {
        const article = document.querySelector("#catalog-pane article");
        const groups = document.querySelectorAll("#catalog aside nav > div").length;
        const heading = article?.querySelector("h2")?.textContent?.trim() ?? "";

        resolve({ heading, groups, kitSelected: document.querySelector("#tab-kit")?.ariaSelected ?? "" });
      }, 400);
    });
  });
  check(
    "вкладка «паттерны» открывается на месте",
    patternsTab.heading.length > 0 && patternsTab.groups > 0 && patternsTab.kitSelected === "false",
    `паспорт «${patternsTab.heading}», групп ${patternsTab.groups}`,
  );

  const backToKit = await page.evaluate(() => {
    document.querySelector("#tab-kit")?.click();

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(document.querySelector("#catalog-pane article h2")?.textContent?.trim() ?? "");
      }, 350);
    });
  });
  check("вкладка «кит» возвращает паспорт компонента", backToKit.length > 0, backToKit);

  // Уходов из паспорта не осталось: связи открываются превью, а не маршрутом.
  const strayLinks = await page.locator('#catalog-pane a[href^="/kit/"], #catalog-pane a[href^="/patterns/"]').count();
  check("в паспорте нет ссылок-уходов", strayLinks === 0, `ссылок: ${strayLinks}`);

  const response = await page.goto(`${base}/guide`, { waitUntil: "load" });
  const landed = await page.evaluate(() => Boolean(document.querySelector(location.hash)));
  check(
    "редирект /guide приземляется на существующий якорь",
    response !== null && page.url().includes("#start") && landed,
    page.url().replace(base, ""),
  );

  await ctx.close();
}
