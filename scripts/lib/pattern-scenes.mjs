/**
 * Проверки сцен паттернов: пример обязан показывать приём, а не иллюстрировать подпись.
 *
 * Вынесено из `verify-effects.mjs` отдельным модулем по той же причине, что и
 * проверки кита: у скрипта лимит 250 строк.
 */

/** id страниц паттернов: каждая обязана отвечать 200. */
const SCENE_PAGES = [
  "macro-typography",
  "editorial",
  "glassmorphism",
  "tactile-minimalism",
  "aurora-background",
  "dark-glow",
  "spotlight-hover",
  "sustainable-web",
  "cinematic-scrollytelling",
  "living-type",
  "four-layers",
  "glass-clay",
  "clean-design-2",
  "neo-brutalism",
  "hero-recipe",
  "social-strip",
  "accent-card",
];

/**
 * Метки сцен: по одной на каждый паттерн манифеста.
 *
 * Список сверяется с `SCENE_PAGES` — у них одна длина. Раньше массивы разъехались
 * молча: сцены добавились в страницы, а проверка размеченности продолжала видеть
 * восемь и проходила, ничего не проверив.
 */
const SCENES = [
  "macro",
  "editorial",
  "glass",
  "tactile",
  "clay",
  "aurora",
  "glow",
  "spotlight",
  "sustainable",
  "scrolly",
  "living-type",
  "clean",
  "four-layers",
  "brutal",
  "hero-recipe",
  "social-strip",
  "accent-card",
];

import { checkPatternDetails } from "./pattern-asserts.mjs";

/**
 * Прогоняет проверки сцен паттернов на `/patterns`.
 *
 * @param browser инстанс Playwright
 * @param base адрес приложения
 * @param check функция отчёта из основного скрипта
 */
export async function checkPatternScenes(browser, base, check) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(message.text());
    }
  });

  await page.goto(`${base}/patterns`, { waitUntil: "load" });
  await page.waitForTimeout(1600);

  const scenes = await page.$$eval("[data-pattern]", (nodes) => nodes.map((node) => node.dataset.pattern ?? ""));
  const missing = SCENES.filter((scene) => !scenes.includes(scene));
  check(
    "сцены паттернов размечены",
    missing.length === 0 && scenes.length === SCENES.length,
    `${scenes.length}/${SCENES.length}, нет: ${missing.join(", ") || "—"}`,
  );
  check(
    "списки проверки не разъехались",
    SCENES.length === SCENE_PAGES.length,
    `сцен ${SCENES.length}, страниц ${SCENE_PAGES.length}`,
  );

  const clipped = await page.$$eval("[data-pattern]", (nodes) =>
    nodes
      .filter((node) => node.scrollWidth > node.clientWidth + 1)
      .map((node) => `${node.dataset.pattern}: ${node.scrollWidth} > ${node.clientWidth}`),
  );
  check("сцены паттернов не переполнены", clipped.length === 0, clipped.join(" | "));

  await checkPatternDetails(page, base, check);

  check("консоль /patterns", errors.length === 0, errors.slice(0, 2).join(" | "));

  // Старые маршруты `/patterns/<id>` ведут в каталог: паспорт паттерна живёт там,
  // поэтому проверяем не код ответа, а приземление в нужный паспорт.
  const landings = [];
  for (const id of SCENE_PAGES) {
    await page.goto(`${base}/patterns/${id}`, { waitUntil: "load" });
    await page.waitForTimeout(700);
    const state = await page.evaluate(() => ({
      hash: location.hash,
      heading: document.querySelector("#catalog-pane article h2")?.textContent?.trim() ?? "",
      scene: document.querySelector("#catalog-pane [data-pattern]")?.dataset.pattern ?? "",
    }));
    landings.push({ id, ...state });
  }
  const lost = landings.filter((item) => item.hash !== `#c-${item.id}` || item.heading.length === 0 || !item.scene);
  check(
    "старые страницы паттернов ведут в каталог",
    lost.length === 0,
    lost.length > 0
      ? lost.map((item) => `${item.id} -> ${item.hash || "пусто"}`).join(", ")
      : `${landings.length} из ${SCENE_PAGES.length}`,
  );

  await ctx.close();

  const mobile = await browser.newContext({ viewport: { width: 390, height: 900 } });
  const phone = await mobile.newPage();
  const wide = [];
  for (const url of ["/patterns", ...SCENE_PAGES.map((id) => `/#c-${id}`)]) {
    await phone.goto(`${base}${url}`, { waitUntil: "load" });
    await phone.waitForTimeout(400);
    const overflow = await phone.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (overflow > 16) {
      wide.push(`${url}: +${overflow}px`);
    }
  }
  check("паттерны не дают скролла @390", wide.length === 0, wide.join(" | ") || "0 px");
  await mobile.close();
}
