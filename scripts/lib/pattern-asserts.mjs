/**
 * Смысловые проверки сцен паттернов: демо доказывает подпись, а не только существует.
 *
 * Вынесено из `pattern-scenes.mjs`: у проверок жёсткий лимит 250 строк, а каждая
 * новая сцена добавляет своё утверждение. Здесь — только «что видно», навигация
 * и списки остаются в `pattern-scenes.mjs`.
 */

/**
 * Прогоняет утверждения по каждой сцене на `/patterns`.
 *
 * @param page страница Playwright, уже открытая на `/patterns`
 * @param base адрес приложения: песочница слоёв проверяется на своей странице
 * @param check функция отчёта из основного скрипта
 * @returns {Promise<void>} ничего
 */
export async function checkPatternDetails(page, base, check) {
  const macro = await page.evaluate(() => {
    const scene = document.querySelector('[data-pattern="macro"] p:nth-of-type(2)');
    if (!scene) {
      return null;
    }
    const style = getComputedStyle(scene);
    return {
      size: Number.parseFloat(style.fontSize),
      leading: Number.parseFloat(style.lineHeight) / Number.parseFloat(style.fontSize),
      tracking: style.letterSpacing,
    };
  });
  check(
    "макро: крупный кегль и сжатая ведущая",
    macro !== null && macro.size >= 30 && macro.leading < 1 && macro.tracking.startsWith("-"),
    macro ? `${macro.size}px, ведущая ${macro.leading.toFixed(2)}, трекинг ${macro.tracking}` : "сцены нет",
  );

  const columns = await page.evaluate(() => {
    const scene = document.querySelector('[data-pattern="editorial"] [class*="columns-2"]');
    return scene ? getComputedStyle(scene).columnCount : "нет";
  });
  check("редакционный: две колонки", columns === "2", columns);

  const glass = await page.evaluate(() => {
    const panel = document.querySelector('[data-pattern="glass"] .backdrop-blur-md');
    return panel ? getComputedStyle(panel).backdropFilter : "нет панели";
  });
  check("стекло: размытие фона включено", glass.includes("blur("), glass);

  const aurora = await page.evaluate(() => {
    const blob = document.querySelector('[data-pattern="aurora"] .pattern-aurora-blob-a');
    return blob ? getComputedStyle(blob).animationName : "нет пятна";
  });
  check("сияние: пятно дрейфует", aurora === "pattern-drift-a", aurora);

  const spotlight = await page.evaluate(() => {
    const card = document.querySelector('[data-pattern="spotlight"] .kit-magic-always');
    if (!card) return null;

    const spot = getComputedStyle(card, "::after");
    const ring = getComputedStyle(card, "::before");

    return {
      spot: spot.opacity,
      spotImage: spot.backgroundImage.slice(0, 24),
      ring: ring.opacity,
      ringImage: ring.backgroundImage.slice(0, 24),
      // Chrome разносит ключевое слово content-box в mask-origin/mask-clip,
      // поэтому проверяем не строку шортката, а число слоёв и композицию xor/exclude.
      ringMask: ring.maskImage.split("linear-gradient").length - 1 === 2 && ring.maskComposite.includes("exclude"),
    };
  });
  // Фон сцены пустой: сетка под карточками конкурирует со светом и превращает
  // прожектор в подсветку клетки. В сцене не должно быть ни одного svg-паттерна.
  const spotlightNoise = await page.evaluate(() => {
    const scene = document.querySelector('[data-pattern="spotlight"]');
    return scene ? scene.querySelectorAll("svg").length : -1;
  });
  check("прожектор: фон сцены пустой, сетки нет", spotlightNoise === 0, `svg в сцене: ${spotlightNoise}`);

  check(
    "прожектор: пятно и кольцо рамки — два слоя",
    spotlight !== null &&
      Number.parseFloat(spotlight.spot) > 0.1 &&
      spotlight.spotImage.includes("radial-gradient") &&
      Number.parseFloat(spotlight.ring) > 0.5 &&
      spotlight.ringImage.includes("radial-gradient") &&
      spotlight.ringMask,
    spotlight ? `пятно ${spotlight.spot}, кольцо ${spotlight.ring}, маска ${spotlight.ringMask}` : "нет карточки",
  );

  // Координаты считает контейнер: после движения курсора их получают все карточки,
  // иначе кольца соседей не загораются (это и есть поведение референса).
  // Курсор ведём по карточке из группы, а не по `always`: у неё своя стартовая
  // позиция, и проверка иначе ловила бы её собственный pointermove.
  const card = page.locator('[data-pattern="spotlight"] [data-magic]:not([data-magic-always])').first();
  await card.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  const box = await card.boundingBox();
  if (box) {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.waitForTimeout(250);
  }
  const vars = await page.$$eval('[data-pattern="spotlight"] [data-magic]', (nodes) =>
    nodes.map((node) => ({
      mx: node.style.getPropertyValue("--mx"),
      always: node.hasAttribute("data-magic-always"),
    })),
  );
  // Карточка с `always` держит свою стартовую позицию в процентах: контейнер её
  // не переписывает, иначе в статике гасло кольцо рамки.
  check(
    "прожектор: контейнер раздаёт координаты всем карточкам, кроме always",
    vars.length === 3 &&
      vars.filter((item) => !item.always).every((item) => item.mx.endsWith("px")) &&
      vars.filter((item) => item.always).every((item) => item.mx.endsWith("%")),
    vars.map((item) => `${item.always ? "always" : "группа"}:${item.mx || "пусто"}`).join(", "),
  );

  const glow = await page.evaluate(() => {
    const beam = document.querySelector('[data-pattern="glow"] .kit-beam');
    return beam ? getComputedStyle(beam, "::before").backgroundImage : "нет рамки";
  });
  check("тёмное свечение: рамка горит", glow.includes("gradient"), glow.slice(0, 60));

  const timeline = await page.evaluate(() => {
    const title = document.querySelector('[data-pattern="scrolly"] .scrolly-title');
    return title ? getComputedStyle(title).animationTimeline : "нет заголовка";
  });
  check("кино на прокрутке: анимация привязана к прокрутке", timeline.includes("view"), timeline);

  const scrollScene = await page.evaluate(() => {
    const scene = document.querySelector('[data-pattern="scrolly"] .scrolly-scene');
    return scene ? scene.scrollHeight > scene.clientHeight : false;
  });
  check("кино на прокрутке: сцена прокручивается внутри", scrollScene === true, String(scrollScene));

  const livingBand = await page.evaluate(() => {
    const scene = document.querySelector('[data-pattern="living-type"]');
    if (!scene) {
      return "нет сцены";
    }
    const moving = [...scene.querySelectorAll("div")].find((el) => getComputedStyle(el).animationName !== "none");

    return moving ? getComputedStyle(moving).animationName : "лента стоит";
  });
  const livingWords = await page.evaluate(() => {
    const scene = document.querySelector('[data-pattern="living-type"]');
    return scene ? scene.textContent.includes("Текст оживает") : false;
  });
  check("живой текст: лента едет, ротация на месте", livingBand !== "none" && livingWords, `${livingBand}`);

  const fourLayers = await page.evaluate(() => {
    const scene = document.querySelector('[data-pattern="four-layers"]');
    if (!scene) {
      return null;
    }

    return {
      layers: scene.querySelectorAll(".four-layer").length,
      dots: scene.querySelectorAll("svg").length,
      canvas: scene.querySelectorAll("canvas").length,
    };
  });
  check(
    "четыре линии: четыре слоя и три техники",
    fourLayers !== null && fourLayers.layers === 4 && fourLayers.canvas >= 1 && fourLayers.dots >= 2,
    fourLayers ? `слоёв ${fourLayers.layers}, svg ${fourLayers.dots}, canvas ${fourLayers.canvas}` : "нет сцены",
  );

  // пульт живёт в паспорте паттерна, а не в плитке стены: в плитке кнопки были бы
  // внутри ссылки и вместо слоя уводили на другую страницу
  await page.goto(`${base}/#c-four-layers`, { waitUntil: "load" });
  await page.waitForTimeout(900);
  await page.click('[data-pattern="four-layers"] button:has-text("01")');
  await page.waitForTimeout(400);
  const isolated = await page.evaluate(() => {
    const stage = document.querySelector(".four-layers-stage");
    const dimmed = [...document.querySelectorAll(".four-layers-stage .four-layer")].filter(
      (layer) => Number.parseFloat(getComputedStyle(layer).opacity) < 0.2,
    );

    return { focus: stage?.dataset.focus ?? "", dimmed: dimmed.length };
  });
  check("четыре линии: слой изолируется", isolated.focus === "1" && isolated.dimmed === 3, JSON.stringify(isolated));

  await page.click('[data-pattern="four-layers"] button:has-text("пиксель")');
  await page.waitForTimeout(400);
  const hidden = await page.evaluate(() => {
    const zone = document.querySelector('[data-pattern="four-layers"] [data-layer="2"]')?.children[2];

    return zone ? getComputedStyle(zone).opacity : "нет зоны";
  });
  check("четыре линии: линия снимается", Number.parseFloat(hidden) < 0.2, String(hidden));

  await page.goto(`${base}/patterns`, { waitUntil: "load" });
  await page.waitForTimeout(900);

  const clay = await page.evaluate(() => {
    const scene = document.querySelector('[data-pattern="clay"]');
    if (!scene) {
      return null;
    }
    const glass = scene.querySelector(".backdrop-blur-md");
    const clayHalf = scene.querySelector('[style*="194 154 168"]');

    return {
      split: scene.querySelectorAll(":scope > div > div").length,
      glass: glass ? getComputedStyle(glass).backdropFilter : "нет стекла",
      clay: clayHalf ? getComputedStyle(clayHalf).boxShadow.includes("20px") : false,
    };
  });
  check(
    "стекло и глина: две зоны, размытие и мягкая тень",
    clay !== null && clay.glass.includes("blur(") && clay.clay,
    clay ? `${clay.glass}` : "нет сцены",
  );

  const clean = await page.evaluate(() => {
    const scene = document.querySelector('[data-pattern="clean"]');
    const headings = scene?.querySelectorAll("p").length ?? 0;
    const accent = scene?.querySelectorAll(".kit-highlight").length ?? 0;

    return { headings, accent };
  });
  check("умный минимализм: один акцент", clean.accent === 1, `акцентов ${clean.accent}`);

  const brutal = await page.evaluate(() => {
    const card = document.querySelector('[data-pattern="brutal"] .pattern-brutal');
    if (!card) {
      return null;
    }
    const style = getComputedStyle(card);

    return { shadow: style.boxShadow, border: style.borderTopWidth };
  });
  check(
    "нео-брутализм: рамка и тень без размытия",
    brutal !== null && brutal.border === "3px" && brutal.shadow.includes("rgb(0, 0, 0) 6px 6px 0px 0px"),
    brutal ? `${brutal.border}, ${brutal.shadow}` : "нет карточки",
  );

  const halfs = await page.locator('[data-pattern="sustainable"] > div').count();
  const vectors = await page.locator('[data-pattern="sustainable"] svg').count();
  check("экономный фон: сравнение и SVG вместо медиа", halfs === 2 && vectors > 0, `${halfs} половины, ${vectors} SVG`);
}
