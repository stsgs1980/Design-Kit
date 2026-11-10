export const ladder = [
  {
    step: "1",
    tech: "SVG-паттерн",
    examples: "DotPattern, StripedPattern, NoiseTexture (feTurbulence)",
    cost: "≈0 КБ JS",
    rule: "Сначала проверь: а не решается ли это <pattern> и маской?",
  },
  {
    step: "2",
    tech: "CSS-градиент / conic-gradient",
    examples: "LightRays, радиальные свечения, hairline-сетка",
    cost: "0 КБ JS",
    rule: "Градиент + маска + blur закрывают 80% «свечений».",
  },
  {
    step: "3",
    tech: "Canvas 2D",
    examples: "FlickeringGrid, GlyphMatrix, фликер табов",
    cost: "~2 КБ кода, rAF",
    rule: "Нужна попиксельная случайность или текст по сетке.",
  },
  {
    step: "4",
    tech: "WebGL / шейдер",
    examples: "Dither (FBM + Байер 8×8)",
    cost: "≤ 1 МБ библиотек, ленивый чанк",
    rule: "Только когда нужна математика на пиксель: шум, дизеринг, пост-эффекты.",
  },
];

export const rules = [
  {
    title: "Один фон — один герой",
    text: "На экран приходится максимум два фоновых слоя: большой (свечение, карта) и микро (точки, зерно). Третий слой — это уже шум, который конкурирует с заголовком.",
    bad: "свечение + лучи + сетка + шум одновременно",
    good: "свечение + точки под маской",
  },
  {
    title: "Маска вместо обрезки",
    text: "Любой паттерн подключается с mask-image. Обрезка по краю контейнера даёт «плитку», маска — «дыхание». Это самый дешёвый признак аккуратной работы.",
    bad: "паттерн упирается в border-radius",
    good: "radial-gradient(ellipse, black 55%, transparent 88%)",
  },
  {
    title: "Контраст: фон — не текст",
    text: "Фон всегда ≥ 3× тише контента. Проверка простая: прищурься — если первым читается паттерн, а не заголовок, убавляй.",
    bad: "opacity 0.6+ на точках под заголовком",
    good: "opacity 0.2–0.35, плюс маска под текстом",
  },
  {
    title: "Движение — одно на секцию",
    text: "Один живой элемент на блок. Лента + мерцающая сетка + орбита в одном экране — это уже «казино», глаз не знает, куда смотреть.",
    bad: "три независимые анимации в одном вьюпорте",
    good: "лента едет, всё остальное статично",
  },
  {
    title: "Цвет — из токена",
    text: "currentColor или var(--primary). Тогда дарк-режим работает бесплатно, а палитра не расползается на 10 оттенков серого.",
    bad: 'color="#6B7280" в пяти компонентах',
    good: 'className="text-muted-foreground"',
  },
  {
    title: "Честная цена",
    text: "Считай не «красиво», а «сколько это стоит»: КБ, кадры, батарея. Всё, что дороже 3 КБ и не несёт смысла — в бандл не едет.",
    bad: "шейдер ради 40-пиксельной полосы",
    good: "SVG-стрелки в той же роли",
  },
];

export const table = [
  { effect: "DotPattern", tech: "SVG pattern", place: "hero, пустые состояния", cost: "0 JS", motion: "нет" },
  { effect: "StripedPattern", tech: "SVG pattern", place: "тонкие разделители", cost: "0 JS", motion: "нет" },
  {
    effect: "NoiseTexture",
    tech: "SVG feTurbulence",
    place: "поверх градиентов, дарк-тема",
    cost: "0 JS",
    motion: "нет",
  },
  { effect: "LightRays", tech: "conic-gradient ×2", place: "CTA, «прожектор»", cost: "0 JS", motion: "opacity" },
  { effect: "Marquee", tech: "CSS keyframes", place: "отзывы, логотипы", cost: "0 JS", motion: "transform" },
  {
    effect: "WorldMap",
    tech: "SVG + Меркатор",
    place: "coverage, «мы везде»",
    cost: "0 JS (15 КБ данных)",
    motion: "нет",
  },
  { effect: "FlickeringGrid", tech: "Canvas 2D", place: "активный таб, карточка", cost: "~2 КБ", motion: "rAF" },
  {
    effect: "GlyphMatrix",
    tech: "Canvas 2D + текст",
    place: "терминал, «живой код»",
    cost: "~3 КБ",
    motion: "setInterval",
  },
  {
    effect: "RadialOrbit",
    tech: "framer-motion + polar",
    place: "интеграции, экосистема",
    cost: "в составе motion",
    motion: "spring",
  },
  {
    effect: "Dither",
    tech: "WebGL, 2 прохода",
    place: "акцентная полоса, hero-финал",
    cost: "ленивый чанк",
    motion: "rAF",
  },
];
