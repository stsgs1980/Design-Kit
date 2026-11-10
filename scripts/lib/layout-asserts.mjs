/**
 * Проверки каркаса страницы: одинаковые разделы и отсутствие горизонтального
 * скролла на всём диапазоне ширин.
 *
 * Живут отдельно от `nav-asserts`: у каждого файла лимит в 250 строк, а промахи
 * «страница шире экрана» и «со стены нет шапки» — про каркас, а не про клики.
 */

/**
 * Ширины и страницы, на которых проверяем горизонтальный скролл.
 *
 * Промах «паспорт шире экрана» случился ровно между проверенными 390 и 1440:
 * колонка каталога не имела `min-w-0`, и на 1024-1920 страница уезжала вбок на
 * 390 px. Проверка стоит здесь, а не в `shots`, потому что `verify:all` должен
 * ловить это сам.
 */
const WIDTHS = [390, 768, 1024, 1440, 1680, 1920];
const ROUTES = ["/", "/kit", "/patterns"];

/**
 * Горизонтальный скролл: страница не должна быть шире окна ни на одной ширине.
 * @param browser инстанс Playwright
 * @param base адрес приложения
 * @param check функция отчёта
 * @returns {Promise<void>} ничего
 */
async function checkOverflow(browser, base, check) {
  const broken = [];

  for (const width of WIDTHS) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await ctx.newPage();

    for (const route of ROUTES) {
      await page.goto(`${base}${route === "/" ? "/#catalog" : route}`, { waitUntil: "load" });
      await page.waitForTimeout(700);
      const extra = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);

      if (extra > 0) {
        broken.push(`${route} @ ${width}: +${extra} px`);
      }
    }

    await ctx.close();
  }

  check(
    `горизонтального скролла нет на ${WIDTHS.length} ширинах`,
    broken.length === 0,
    broken.join(", ") || `${ROUTES.join(" ")} на ${WIDTHS.join("/")} px`,
  );
}

/**
 * Одинаковая шапка на всех страницах: без неё со стены нет разделов.
 * @param browser инстанс Playwright
 * @param base адрес приложения
 * @param check функция отчёта
 * @returns {Promise<void>} ничего
 */
async function checkSharedHeader(browser, base, check) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const report = [];

  for (const route of ["/", "/kit", "/patterns"]) {
    await page.goto(`${base}${route}`, { waitUntil: "load" });
    await page.waitForTimeout(700);
    const state = await page.evaluate(() => ({
      labels: [...document.querySelectorAll("header nav a")]
        .filter((link) => link.getClientRects().length > 0)
        .map((link) => link.textContent?.trim() ?? ""),
      brand: Boolean(document.querySelector('header a[href="/#start"]')),
    }));

    report.push({ route, ...state });
  }

  const bad = report.filter((row) => row.labels.length < 5 || !row.brand);
  check(
    "шапка с разделами на всех страницах",
    bad.length === 0,
    bad.map((row) => `${row.route}: ${row.labels.join("/") || "нет ссылок"}`).join(" | ") ||
      "главная, стена кита, стена паттернов",
  );

  await ctx.close();
}

/**
 * Тема: по умолчанию тёмная, и выбор не сбрасывается при переходе.
 *
 * Промах, из-за которого проверка появилась: без cookie сервер не ставил класс,
 * `light-dark()` брал тему системы, и переход с главной на стену перекрашивал
 * тёмную страницу в светлую.
 * @param browser инстанс Playwright
 * @param base адрес приложения
 * @param check функция отчёта
 * @returns {Promise<void>} ничего
 */
async function checkTheme(browser, base, check) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "light" });
  const page = await ctx.newPage();

  await page.goto(`${base}/`, { waitUntil: "load" });
  await page.waitForTimeout(600);
  const initial = await page.evaluate(() => ({
    dark: document.documentElement.classList.contains("dark"),
    bg: getComputedStyle(document.body).backgroundColor,
  }));

  await page.goto(`${base}/kit`, { waitUntil: "load" });
  await page.waitForTimeout(600);
  const wallDark = await page.evaluate(() => document.documentElement.classList.contains("dark"));
  check(
    "тема по умолчанию тёмная на главной и на стене",
    initial.dark && wallDark,
    `главная ${initial.bg}, стена ${wallDark ? "тёмная" : "светлая"}`,
  );

  await page.goto(`${base}/`, { waitUntil: "load" });
  await page.waitForTimeout(500);
  await page.locator('header button[aria-label="Переключить тему"]').click();
  await page.evaluate(() => {
    document.cookie = "theme=; path=/; max-age=0";
  });
  await page.goto(`${base}/patterns`, { waitUntil: "load" });
  await page.waitForTimeout(600);
  const kept = await page.evaluate(() => document.documentElement.classList.contains("light"));
  check(
    "выбранная тема переживает переход между страницами",
    kept,
    kept ? "light осталась на стене паттернов" : "сбросилась на тёмную",
  );

  await ctx.close();
}

/**
 * Одна сетка на всех страницах: левый край заголовка совпадает с логотипом.
 *
 * Нашлось на 1440: главная и гид жили на 1240 px, стена кита — на 1152, стена
 * паттернов — на 1024. При переходе контент прыгал вправо на 52 и 116 px
 * относительно шапки, и страница читалась как другая вёрстка.
 * @param browser инстанс Playwright
 * @param base адрес приложения
 * @param check функция отчёта
 * @returns {Promise<void>} ничего
 */
async function checkGrid(browser, base, check) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const rows = [];

  for (const route of ["/", "/kit", "/patterns"]) {
    await page.goto(`${base}${route}`, { waitUntil: "load" });
    await page.waitForTimeout(800);
    const edges = await page.evaluate(() => {
      const left = (selector) => {
        const node = document.querySelector(selector);
        return node === null ? null : Math.round(node.getBoundingClientRect().x);
      };

      return { logo: left("header a"), title: left("main h1") };
    });

    rows.push({ route, ...edges });
  }

  const broken = rows.filter((row) => row.title === null || Math.abs((row.logo ?? 0) - row.title) > 2);
  check(
    "левый край заголовка совпадает с логотипом на всех страницах",
    broken.length === 0,
    broken.map((row) => `${row.route}: логотип ${row.logo}, заголовок ${row.title}`).join(" | ") ||
      rows.map((row) => `${row.route} ${row.title}`).join(", "),
  );

  await ctx.close();
}

/**
 * Эталонные ширины: контейнер и число колонок.
 *
 * Зафиксировано решением: контейнер 1400 px, от 1280 сайдбар каталога 300 px,
 * от 1680 стена кита встаёт в четыре колонки. Без этой проверки правка
 * брейкпоинта проходит молча — так `min-[1440px]` однажды оказался в CSS
 * раньше `lg:` и не работал вовсе.
 * @param browser инстанс Playwright
 * @param base адрес приложения
 * @param check функция отчёта
 * @returns {Promise<void>} ничего
 */
async function checkScale(browser, base, check) {
  const cases = [
    { width: 1440, container: 1400, sidebar: 300, columns: 3 },
    { width: 1920, container: 1400, sidebar: 300, columns: 4 },
  ];
  const rows = [];

  for (const item of cases) {
    const ctx = await browser.newContext({ viewport: { width: item.width, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(`${base}/#catalog`, { waitUntil: "load" });
    await page.waitForTimeout(900);
    const home = await page.evaluate(() => ({
      container: Math.round(document.querySelector("header > div").getBoundingClientRect().width),
      sidebar: Math.round(document.querySelector("#catalog aside").getBoundingClientRect().width),
    }));

    await page.goto(`${base}/kit`, { waitUntil: "load" });
    await page.waitForTimeout(900);
    const columns = await page.evaluate(() => {
      const cards = [...document.querySelectorAll("main a.group")].slice(0, 8);
      return new Set(cards.map((card) => Math.round(card.getBoundingClientRect().x))).size;
    });

    rows.push({ width: item.width, expected: item, ...home, columns });
    await ctx.close();
  }

  const broken = rows.filter(
    (row) =>
      row.container !== row.expected.container ||
      row.sidebar !== row.expected.sidebar ||
      row.columns !== row.expected.columns,
  );
  check(
    "сетка по ширинам: контейнер, сайдбар, колонки",
    broken.length === 0,
    rows.map((row) => `${row.width}: ${row.container}/${row.sidebar}/${row.columns} колонок`).join(", "),
  );
}

/**
 * Все проверки каркаса.
 * @param browser инстанс Playwright
 * @param base адрес приложения
 * @param check функция отчёта
 * @returns {Promise<void>} ничего
 */
export async function checkLayout(browser, base, check) {
  await checkSharedHeader(browser, base, check);
  await checkOverflow(browser, base, check);
  await checkTheme(browser, base, check);
  await checkGrid(browser, base, check);
  await checkScale(browser, base, check);
}
