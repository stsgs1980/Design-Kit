/**
 * Проверки сцен кита: демо обязано показывать то, что обещает подпись.
 *
 * Вынесено из `verify-effects.mjs` отдельным модулем: у скрипта жёсткий лимит в
 * 250 строк, а каждая новая сцена добавляет свою проверку.
 */

/** Все двадцать сцен должны быть размечены: иначе проверка молча пропускает плитку. */
const SCENES = [
  "grid",
  "dots",
  "flicker",
  "rays",
  "stripes",
  "beam",
  "dither",
  "glare",
  "magic",
  "noise",
  "blur",
  "glyph",
  "marquee",
  "orbit",
  "shiny",
  "rotate",
  "highlight",
  "typing",
  "ticker",
  "map",
];

/**
 * Прогоняет проверки сцен на странице `/kit`.
 *
 * @param browser инстанс Playwright
 * @param base адрес приложения
 * @param check функция отчёта из основного скрипта
 */
export async function checkKitScenes(browser, base, check) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.goto(`${base}/kit`, { waitUntil: "load" });
  await page.waitForTimeout(1800);

  const scenes = await page.$$eval("[data-scene]", (nodes) => nodes.map((node) => node.dataset.scene ?? ""));
  const missing = SCENES.filter((scene) => !scenes.includes(scene));
  check("сцены кита размечены", missing.length === 0, `${scenes.length}/20, нет: ${missing.join(", ") || "—"}`);

  const dark = await page.evaluate(() => {
    const scene = document.querySelector('[data-scene="glyph"]');
    return scene ? getComputedStyle(scene).backgroundColor : "нет сцены";
  });
  check("тёмная подложка у сцены символов", dark === "rgb(8, 12, 18)", dark);

  const blurRows = await page.locator('[data-scene="blur"] li').count();
  check("размытие: список продолжается", blurRows === 8, `${blurRows} строк`);

  const marqueeRows = await page.locator('[data-scene="marquee"] .group').count();
  check("лента: две встречные полосы", marqueeRows === 2, `${marqueeRows} лент`);

  const noiseHalves = await page.locator('[data-scene="noise"] > div > div').count();
  check("зерно: сравнение в одном кадре", noiseHalves === 2, `${noiseHalves} половины`);

  const highlightBlocks = await page.locator('[data-scene="highlight"] .kit-highlight').count();
  check("маркер на месте", highlightBlocks === 1, `${highlightBlocks}`);

  const glareAnimated = await page.evaluate(() => {
    const scene = document.querySelector('[data-scene="glare"] .kit-glare-auto');
    if (!scene) return "нет сцены";
    return getComputedStyle(scene, "::after").animationName;
  });
  check("блик проходит без курсора", glareAnimated === "kit-glare-sweep", glareAnimated);

  const gridCaption = await page.evaluate(() => {
    const scene = document.querySelector('[data-scene="grid"]');
    return scene ? scene.textContent.trim() : "нет сцены";
  });
  check("в сцене сетки нет пояснительной подписи", gridCaption === "", gridCaption || "пусто");

  await ctx.close();
}
