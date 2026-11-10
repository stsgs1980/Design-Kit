/**
 * Проверки каталога: вкладки, паспорт, превью и старые маршруты.
 *
 * Вынесено из `verify-effects.mjs`: у скрипта лимит в 250 строк, а каталог —
 * самая нагруженная часть справочника, проверок на него становится всё больше.
 */

/**
 * Проверки вида «по месту»: поверхности манифеста, сцена, матрица и места без сцены.
 *
 * @param page страница Playwright, уже открытая на главной
 * @param theme тема прогона (для читаемых имён проверок)
 * @param check функция отчёта из основного скрипта
 */
export async function checkPlaces(page, theme, check) {
  // Вид «по месту»: место — это обратный разворот каталога, а не отдельная секция.
  await page.evaluate(() => {
    window.location.hash = "#where";
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  });
  await page.waitForTimeout(1400);

  // ARIA переключателей: у каждого варианта вида есть состояние, активен ровно
  // один. Без атрибута кнопка неотличима от декоративной — это регрессия.
  const viewAria = await page.evaluate(() => {
    const buttons = [...document.querySelectorAll("#where button")];

    return {
      total: buttons.length,
      withState: buttons.filter((node) => node.hasAttribute("aria-pressed")).length,
      active: buttons.filter((node) => node.getAttribute("aria-pressed") === "true").length,
    };
  });
  check(
    `вид каталога: aria-pressed у всех вариантов (${theme})`,
    viewAria.total >= 2 && viewAria.withState === viewAria.total && viewAria.active === 1,
    `кнопок ${viewAria.total}, с aria ${viewAria.withState}, активно ${viewAria.active}`,
  );

  const railAria = await page.evaluate(() => {
    const buttons = [...document.querySelectorAll("#catalog aside button")];

    return {
      total: buttons.length,
      withState: buttons.filter((node) => node.hasAttribute("aria-pressed")).length,
      active: buttons.filter((node) => node.getAttribute("aria-pressed") === "true").length,
    };
  });
  check(
    `сайдбар: aria-pressed у всех пунктов (${theme})`,
    railAria.total > 0 && railAria.withState === railAria.total && railAria.active === 1,
    `пунктов ${railAria.total}, с aria ${railAria.withState}, активно ${railAria.active}`,
  );

  const scenePaint = await page.evaluate(() => {
    const scene = document.querySelector('[data-scene="hero"]');
    if (!scene) return { found: 0, svg: 0, canvas: 0 };
    return {
      found: 1,
      svg: scene.querySelectorAll("svg").length,
      canvas: scene.querySelectorAll("canvas").length,
    };
  });
  check(
    `сцена места «первый экран» (${theme})`,
    scenePaint.found === 1 && scenePaint.svg >= 1,
    `svg ${scenePaint.svg}, canvas ${scenePaint.canvas}`,
  );

  const placeMatrix = await page.locator("#catalog-pane article table tbody tr").count();
  check(`матрица места «первый экран» (${theme})`, placeMatrix === 4, `${placeMatrix} строк`);

  const placePressed = await page.getAttribute("#catalog aside button", "aria-pressed");
  check(`место выбрано по клику (${theme})`, placePressed === "true", `aria-pressed=${placePressed}`);

  // Каждая поверхность манифеста обязана быть в «по месту», иначе компонент
  // с тегом `social`/`cta` не находится этим видом вовсе.
  const surfaces = ["hero", "section", "card", "background", "empty", "nav", "cta", "social", "input", "code"];
  const placeIds = await page.evaluate(() =>
    [...document.querySelectorAll("#catalog aside button[data-item]")].map((node) => node.dataset.item),
  );
  const missing = surfaces.filter((id) => !placeIds.includes(id));
  check(`все поверхности в «по месту» (${theme})`, missing.length === 0, `нет: ${missing.join(", ") || "ничего"}`);

  // Место без собственной сцены показывает честную подпись, а не пустую рамку.
  await page.evaluate(() => document.querySelector("#catalog aside button[data-item='nav']")?.click());
  await page.waitForTimeout(600);
  const navScene = await page.evaluate(() => ({
    articles: document.querySelectorAll("#catalog-pane article").length,
    note: (document.querySelector("#catalog-pane article")?.textContent ?? "").includes("Отдельной сцены нет"),
    chips: document.querySelectorAll("#catalog-pane article > p > button").length,
  }));
  check(
    `поверхность без сцены объяснена (${theme})`,
    navScene.articles === 1 && navScene.note && navScene.chips === 1,
    `статей ${navScene.articles}, подпись ${navScene.note}, чипов ${navScene.chips}`,
  );
  await page.evaluate(() => document.querySelector("#catalog aside button[data-item='hero']")?.click());
  await page.waitForTimeout(500);

  // Наборы — не отдельная секция, а категория паттернов.
  await page.evaluate(() => {
    document.querySelector("#tab-patterns")?.click();
  });
  await page.waitForTimeout(700);
  const recipeGroup = await page.evaluate(() => {
    const groups = [...document.querySelectorAll("#catalog aside nav > div")];
    const group = groups.find((node) => node.textContent?.includes("Наборы"));

    return { groups: groups.length, items: group ? group.querySelectorAll("button").length : 0 };
  });
  check(`наборы живут в паттернах (${theme})`, recipeGroup.items === 3, `наборов ${recipeGroup.items}`);

  // Возврат в вид «по компонентам» — с него начинаются проверки каталога.
  await page.evaluate(() => {
    window.location.hash = "#catalog";
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  });
  await page.waitForTimeout(500);
}

/**
 * Прогоняет поведенческие проверки каталога на главной.
 *
 * @param page страница Playwright, уже открытая на главной
 * @param base адрес приложения
 * @param theme тема прогона (для читаемых имён проверок)
 * @param check функция отчёта из основного скрипта
 */
export async function checkCatalog(page, base, theme, check) {
  // «С чем сочетать» больше не уводит со страницы: чип открывает превью рядом,
  // паспорт под ним остаётся тем же. Переход в паспорт — отдельная кнопка.
  await page.evaluate(() => {
    document.querySelector("#catalog aside button")?.click();
  });
  await page.waitForTimeout(500);

  const passportName = await page.locator("#catalog-pane article h2").textContent();
  await page.locator('#catalog-pane article dl button[aria-haspopup="dialog"]').first().click();
  await page.waitForTimeout(400);

  const preview = await page.evaluate(() => {
    const dialog = document.querySelector('[role="dialog"][aria-label^="Превью"]');
    const heading = document.querySelector("#catalog-pane article h2")?.textContent ?? "";
    const demo = dialog?.querySelector("div > div") !== null;

    return { open: dialog !== null, heading, demo, hash: location.hash };
  });
  check(
    `«с чем сочетать» открывает превью без ухода со страницы (${theme})`,
    preview.open && preview.demo && preview.heading === passportName,
    `паспорт ${passportName}, hash ${preview.hash || "пусто"}`,
  );

  await page.keyboard.press("Escape");
  await page.waitForTimeout(250);
  const afterEscape = await page.evaluate(() => ({
    dialogs: document.querySelectorAll('[role="dialog"][aria-label^="Превью"]').length,
    focused: document.activeElement?.getAttribute("aria-haspopup") === "dialog",
  }));
  check(
    `превью закрывается по Esc и возвращает фокус (${theme})`,
    afterEscape.dialogs === 0 && afterEscape.focused,
    `открытых ${afterEscape.dialogs}, фокус на чипе ${afterEscape.focused}`,
  );

  await page.locator('#catalog-pane article dl button[aria-haspopup="dialog"]').first().click();
  await page.waitForTimeout(300);
  await page.locator('[role="dialog"] button:has-text("открыть паспорт")').click();
  await page.waitForTimeout(700);
  const afterSwitch = await page.locator("#catalog-pane article h2").textContent();
  check(
    `кнопка в превью переключает паспорт (${theme})`,
    Boolean(afterSwitch) && afterSwitch !== passportName,
    `${passportName} -> ${afterSwitch}`,
  );

  // Пропсы стоят в паспорте: отдельной страницы «демо и пропсы» больше нет.
  const propsInline = await page.locator("#catalog-pane article table").count();
  const strayLinks = await page.locator('#catalog-pane a[href^="/kit/"]').count();
  check(
    `пропсы в паспорте, без перехода (${theme})`,
    propsInline >= 1 && strayLinks === 0,
    `${propsInline} таблиц, ссылок на /kit/<id>: ${strayLinks}`,
  );

  // Старые маршруты не ломаются: /kit/<id> приземляется в тот же паспорт каталога.
  await page.goto(`${base}/kit/animated-grid-pattern`, { waitUntil: "load" });
  await page.waitForTimeout(900);
  const landedName = await page.locator("#catalog-pane article h2").textContent();
  check(
    `возврат из кита в каталог (${theme})`,
    page.url().includes("#c-animated-grid-pattern") && Boolean(landedName),
    `${page.url().replace(base, "")} — ${landedName}`,
  );
}
