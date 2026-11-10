# Design Kit — состав библиотеки и спецификация реализации

Документ отвечает на два вопроса: **что именно берём из Magic UI (77 компонентов)** и **что из этого
строим**, чтобы получить не «набор демок», а рабочий кит с доками, матрицами и проверками.

Изучены: полный список [magicui.design/docs/components](https://magicui.design/docs/components) (77 позиций),
а также три присланных гайда — `code-1.html` (теория + аннотированный макет + матрицы),
`design-system-lab.html` (глоссарий 26 терминов «термин → живое демо»),
`Dribbble-level.html` (каталог 20 эффектов «источник → как выглядит → чем делается → с чем компоновать»).
Плюс наш собственный репро `codeforge-repro` и его дизайн-язык (см. `REPORT.md` §3).

---

## 0. Резюме решения

1. Из 77 компонентов Magic UI: **27 берём** (10 из них уже реализованы), **19 адаптируем** под наш
   язык, **31 не берём** — с причинами, а не «на вкус».
2. Ценное, что строим: **`/kit` — документация собственного кита** в формате Magic UI
   (живой пример → код → пропсы → где живёт) + **матрицы совместимости** + **глоссарий**,
   всё генерируется из **одного манифеста**, поэтому доки не расходятся с кодом.
3. Кит строится четырьмя фазами; каждая фаза заканчивается скриншотами light/dark и прогоном
   `npm run verify:kit`. Общий бюджет: **0 новых зависимостей, +≤ 12 КБ JS, +≤ 8 КБ CSS**.
4. Репро (`/`, `/guide`) остаётся витриной; `/kit` — справочником. Это разделение — главное
   архитектурное решение документа.

---

## 1. Что забираем из трёх гайдов

Гайды хороши как методология, но в них смешаны «правила» и «библиотеки под конкретный стек».
Ниже — только то, что переносим, и чем это проверяется у нас.

| Принцип (источник)                                                                  | Как реализуем                                                                           | Чем проверяем                                                                             |
| ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| **8px grid** (code-1)                                                               | шкала отступов 8/16/24/32/48/64, паддинги карточек 24, межсекционные 64+                | визуально + `p-6`/`p-8`/`md:p-24` в компонентах; отклонения — только с комментарием       |
| **60/30/10** (code-1)                                                               | 60% фон, 30% поверхность (`--card`), 10% акцент (`--primary`)                           | один акцентный элемент на экран; в матрице «эффект × поверхность» акцент запрещён на фоне |
| **Иерархия «3 секунды»** (code-1)                                                   | заголовок → приглушённый текст → одна кнопка                                            | проверка «прищурился»: фон ≥ 3× тише текста                                               |
| **Анимация 150–400 мс, ease-out, только transform/opacity, respect reduced-motion** | все переходы в ките по этим числам                                                      | `prefers-reduced-motion` в `verify:effects`; длительности вынесены в константы            |
| **Один signature-moment на страницу** (code-1)                                      | в репро — дизеринг-полоса; в ките — dock/beam; одновременно не включаем                 | ручное ревью + чеклист §10                                                                |
| **Карта z-index явная** (code-1)                                                    | 0 фон · 5 декор · 50 sticky-навигация · 100 модалки · 999 зерно (`pointer-events:none`) | таблица §5.4, ревизия при каждом новом слое                                               |
| **Глоссарий «термин → показать»** (design-system-lab)                               | `/kit/glossary`: 26+ терминов, каждый ведёт на живое демо в ките                        | каждый термин обязан ссылаться на id компонента из манифеста                              |
| **BOM / спецификация** (design-system-lab)                                          | манифест кита = ведомость: техника, цена, состояния, пропсы, a11y                       | `verify:kit` сверяет манифест с кодом                                                     |
| **Формат docs Magic UI** (design-system-lab, Dribbble-level)                        | `/kit/[id]`: демо → код → пропсы → анатомия → где живёт                                 | шаблон страницы, единый для всех записей                                                  |
| **Матрицы совместимости** (code-1, Dribbble-level)                                  | `/kit/matrix`: эффект × поверхность, техника × цена, анимация × задача                  | матрица генерится из манифеста, не руками                                                 |
| **«Источник → как выглядит → чем делается → с чем компоновать»** (Dribbble-level)   | поля `source`, `tech`, `uses` в манифесте                                               | каждое демо в `/kit` показывает эту четвёрку                                              |

Чего из гайдов **не берём**: Lenis (конфликт со `position: sticky` и лишний вес), Spline / three.js,
tsParticles, react-spring рядом с framer-motion, Tremor, React Flow, Storybook как отдельный сервер —
у нас Next-приложение, доки живут в нём же.

---

## 2. Полная инвентаризация Magic UI (77 компонентов)

Легенда: **[OK] берём** · **[ADAPT] адаптируем** (нужна переделка под хайрлайн-язык) · **[NO] нет**.
Колонка «Цена» — то, что реально едет в бандл: `0 JS` — только разметка/CSS.

### 2.1 Components (16)

| Компонент         | Техника                    | Цена         | Вердикт | Решение и место                                                                                            |
| ----------------- | -------------------------- | ------------ | ------- | ---------------------------------------------------------------------------------------------------------- |
| Marquee           | CSS keyframes, 3 копии     | 0 JS         | [OK]    | **уже есть**, `components/kit/marquee/marquee.tsx`                                                         |
| Terminal          | мок окна + таймлайн        | motion       | [OK]    | вытащить наш `workflow/terminal-demo` в публичный `<Terminal command output status>`                       |
| Hero Video Dialog | `<dialog>` + видео         | 1–5 МБ       | [NO]    | нужен ролик; для превью хватает Safari-мока                                                                |
| Bento Grid        | CSS grid, без «магии»      | 0 JS         | [ADAPT] | раскладка секции «фичи»: 2+1+1, `divide`-хайрлайны вместо рамок                                            |
| Animated List     | motion + `AnimatePresence` | ~1 КБ        | [ADAPT] | только changelog в `/kit`, максимум один на страницу                                                       |
| Dock              | spring + `scale`           | ~1.5 КБ      | [ADAPT] | навигация демо-страниц кита, только desktop                                                                |
| Globe             | three / canvas-сфера       | [NO] тяжёлый | [NO]    | задачу «мы везде» уже закрывает `WorldMap`                                                                 |
| Tweet Card        | данные Twitter + скриншот  | —            | [NO]    | внешние данные, юридически мутно                                                                           |
| Orbiting Circles  | два вложенных CSS-вращения | 0 JS         | [OK]    | **добавлен** `OrbitingCircles` (`orbiting-circles`): непрерывное вращение; `RadialOrbit` — статичная схема |
| Avatar Circles    | стопка аватаров + «+N»     | 0 JS         | [OK]    | соц. доказательство под hero отзывами                                                                      |
| Icon Cloud        | three-сфера                | [NO]         | [NO]    | —                                                                                                          |
| Lens              | лупа над изображением      | ~1 КБ        | [NO]    | не наш кейс (нет фото-контента)                                                                            |
| Pointer           | указатель для тура         | ~0.5 КБ      | [ADAPT] | опция guided tour в `/kit/intro`                                                                           |
| Smooth Cursor     | кастомный курсор           | ~2 КБ        | [NO]    | ломает мобильные и a11y                                                                                    |
| Progressive Blur  | слои `backdrop-blur`       | 0 JS         | [OK]    | edge-fade для скролл-контейнеров и длинных лент                                                            |
| Dotted Map        | GeoJSON → точки            | 0 JS         | [OK]    | **уже есть** как `WorldMap`                                                                                |

### 2.2 Special Effects (9)

| Компонент              | Техника                                | Цена        | Вердикт | Решение и место                                                       |
| ---------------------- | -------------------------------------- | ----------- | ------- | --------------------------------------------------------------------- |
| Animated Beam          | SVG `<path>` + `stroke-dashoffset`     | ~1 КБ       | [OK]    | связи в `RadialOrbit` и на схеме пайплайна                            |
| Border Beam            | `conic-gradient` + `@property` + маска | 0 JS        | [OK]    | активная карточка, CTA, таб                                           |
| Shine Border           | конус-градиент по периметру            | 0 JS        | [ADAPT] | **объединить с Border Beam**: один компонент, режимы `beam` / `shine` |
| Magic Card             | mousemove → CSS-переменные → radial    | ~0.5 КБ     | [OK]    | как Spotlight Hover: карточки списков, без библиотек                  |
| Glare Hover            | диагональный блик по `::after`         | 0 JS        | [OK]    | hover карточек отзывов/бенто                                          |
| Meteors                | абсолютные `span` + keyframes          | 0 JS        | [ADAPT] | опция фона hero, ≤ 8 штрихов, только `opacity`                        |
| Confetti               | canvas-частицы                         | ~2 КБ       | [NO]    | не для B2B-лендинга                                                   |
| Particles              | tsParticles / canvas                   | [NO] 40+ КБ | [NO]    | `DotPattern` + `Meteors` закрывают задачу                             |
| Animated Theme Toggler | view-transition / SVG-маска            | ~1 КБ       | [NO]    | наш CSS-тумблер на `color-scheme` объективно лучше                    |

### 2.3 Animations (1)

| Компонент | Техника                             | Цена    | Вердикт | Решение                                                               |
| --------- | ----------------------------------- | ------- | ------- | --------------------------------------------------------------------- |
| Blur Fade | `useInView` + `opacity`/`translate` | ~0.5 КБ | [OK]    | единственный разрешённый scroll-reveal; те же числа для `Text Reveal` |

### 2.4 Text Animations (18)

| Компонент              | Техника                               | Цена    | Вердикт | Решение                                                                                          |
| ---------------------- | ------------------------------------- | ------- | ------- | ------------------------------------------------------------------------------------------------ |
| Text Animate           | по словам/символам + motion           | ~2 КБ   | [ADAPT] | один компонент с режимами `fade/slide/blur`, вместо четырёх                                      |
| Typing Animation       | `setInterval` по символам             | ~0.5 КБ | [OK]    | вынести из терминала как атом (для бейджа hero и доков)                                          |
| Line Shadow Text       | 3D-тень строкой                       | 0 JS    | [NO]    | специфичный шрифтовой трюк, не наш язык                                                          |
| Aurora Text            | размытые градиентные пятна за текстом | 0 JS    | [ADAPT] | опция для тёмной темы, только hero                                                               |
| Video Text             | текст-маска из видео                  | [NO]    | [NO]    | вес видео                                                                                        |
| Number Ticker          | rAF + easeOutCubic                    | ~1 КБ   | [OK]    | цифры покрытия (130 / 4.2k / 0 / 15 КБ)                                                          |
| Animated Shiny Text    | маска + бегущий градиент              | 0 JS    | [OK]    | бейдж «новое» в шапке                                                                            |
| Animated Gradient Text | `background-size: 200%` + animation   | 0 JS    | [ADAPT] | режим `animated` у нашего `GradientText`                                                         |
| Text Reveal            | по строкам/словам                     | ~1 КБ   | [ADAPT] | свести к `Blur Fade` с `as="words"`                                                              |
| Dia Text Reveal        | blur-шейдер по тексту                 | ~3 КБ   | [NO]    | дорого ради 0.3 с                                                                                |
| Hyper Text             | «расшифровка» букв                    | ~1 КБ   | [ADAPT] | опция для заголовка терминала                                                                    |
| Word Rotate            | смена слов по таймеру                 | ~0.5 КБ | [OK]    | подзаголовок hero: «пишет / ревьюит / рефакторит»                                                |
| Scroll Based Velocity  | скорость по скроллу на rAF            | ~1.5 КБ | [OK]    | **добавлен** `ScrollVelocity` (`scroll-velocity`): скорость задаёт человек, сглаживание пружиной |
| Sparkles Text          | SVG-звёздочки вокруг букв             | 0 JS    | [NO]    | мультяшность                                                                                     |
| Morphing Text          | SVG-фильтры (`feTurbulence` + blur)   | ~3 КБ   | [NO]    | дорого по GPU                                                                                    |
| Spinning Text          | текст по кругу                        | 0 JS    | [NO]    | не наш язык                                                                                      |
| Text Highlighter       | SVG/`background` маркер               | 0 JS    | [OK]    | ключевые слова в описаниях и в гайде                                                             |
| Text 3D Flip           | 3D-переворот                          | ~1 КБ   | [NO]    | —                                                                                                |

### 2.5 Device Mocks (3)

| Компонент | Техника    | Цена | Вердикт | Решение                                              |
| --------- | ---------- | ---- | ------- | ---------------------------------------------------- |
| Safari    | рамка окна | 0 JS | [ADAPT] | только в `/kit` как обёртка превью, низкий приоритет |
| iPhone    | рамка      | 0 JS | [NO]    | не наш кейс                                          |
| Android   | рамка      | 0 JS | [NO]    | не наш кейс                                          |

### 2.6 Buttons (3)

| Компонент      | Техника                       | Цена    | Вердикт | Решение                                               |
| -------------- | ----------------------------- | ------- | ------- | ----------------------------------------------------- |
| Rainbow Button | анимированный conic по кнопке | 0 JS    | [NO]    | ломает 60/30/10: два акцента на экран                 |
| Shimmer Button | одна бегущая полоса по CTA    | 0 JS    | [OK]    | главный CTA, режим `shimmer` у нашего `PrimaryButton` |
| Ripple Button  | волна от точки клика          | ~0.5 КБ | [ADAPT] | объединить с `Ripple`: одна CSS-волна на CTA          |

### 2.7 Backgrounds (12)

| Компонент                | Техника                                           | Цена    | Вердикт | Решение                                                |
| ------------------------ | ------------------------------------------------- | ------- | ------- | ------------------------------------------------------ |
| Flickering Grid          | Canvas 2D + `dt`                                  | ~2 КБ   | [OK]    | **уже есть**                                           |
| Animated Grid Pattern    | SVG `<pattern>` + CSS-задержки                    | 0 JS    | [OK]    | **фаза 1**: пустые состояния, фон карточек доков       |
| Retro Grid               | перспектива + `repeating-linear-gradient` + маска | 0 JS    | [ADAPT] | только футер/CTA, CSS-версия (без canvas)              |
| Ripple                   | расходящиеся круги                                | 0 JS    | [ADAPT] | одна секция максимум, иначе «казино»                   |
| Dot Pattern              | SVG `<pattern>`                                   | 0 JS    | [OK]    | **уже есть**                                           |
| Grid Pattern             | SVG-линии                                         | 0 JS    | [NO]    | третья геометрия рядом с точками/полосками — запрещено |
| Hexagon Pattern          | SVG-гексагоны                                     | 0 JS    | [NO]    | то же (отбракован ранее, подтверждаем)                 |
| Striped Pattern          | SVG-штрихи                                        | 0 JS    | [OK]    | **уже есть**                                           |
| Interactive Grid Pattern | подсветка клетки под курсором                     | ~0.5 КБ | [ADAPT] | опция `/kit`, не на главной                            |
| Light Rays               | `conic-gradient` ×2                               | 0 JS    | [OK]    | **уже есть**                                           |
| Noise Texture            | `feTurbulence`                                    | 0 JS    | [OK]    | **уже есть**                                           |
| Floating 3D Particles    | three.js                                          | [NO]    | [NO]    | единственный WebGL у нас — `Dither`                    |

### 2.8 Community (15)

| Компонент                      | Техника                     | Цена    | Вердикт | Решение                                          |
| ------------------------------ | --------------------------- | ------- | ------- | ------------------------------------------------ |
| Shiny Button                   | блик по тексту кнопки       | 0 JS    | [NO]    | дубль `Shimmer Button`                           |
| File Tree                      | список файлов + иконки      | 0 JS    | [OK]    | `/kit` — структура проекта, «где что лежит»      |
| Code Comparison                | два кода + слайдер          | ~1 КБ   | [ADAPT] | режим `split` у `<CodeBlock>`: до/после          |
| Scroll Progress                | полоска прогресса           | 0 JS*   | [OK]    | шапка кита (`*` `scroll-timeline`, фолбэк — rAF) |
| Neon Gradient Card             | неоновые тени               | 0 JS    | [NO]    | неон не в палитре                                |
| Comic Text                     | обводка + тени              | 0 JS    | [NO]    | другой жанр                                      |
| Kinetic Text                   | бегущие строки по скроллу   | ~2 КБ   | [NO]    | тяжело и шумно                                   |
| Cool Mode                      | частицы на клик             | ~3 КБ   | [NO]    | игрушка                                          |
| Pixel Image                    | пикселизация изображения    | canvas  | [NO]    | нет фото-контента                                |
| Pulsating Button               | пульс                       | 0 JS    | [ADAPT] | только как «live»-индикатор статуса, не кнопка   |
| Warp Background                | canvas-искажение            | ~2 КБ   | [NO]    | искажает текст позади                            |
| Interactive Hover Button       | текст раскрывается по hover | ~0.5 КБ | [ADAPT] | вторичный CTA в hero                             |
| Animated Circular Progress Bar | SVG `stroke-dashoffset`     | ~0.5 КБ | [OK]    | метрики в `/kit` и в «Coverage»                  |
| Backlight                      | свет сверху карточки        | 0 JS    | [OK]    | карточки бенто                                   |
| Glyph Matrix                   | Canvas 2D, `Uint16Array`    | ~3 КБ   | [OK]    | **уже есть**                                     |

### 2.9 Сводка вердиктов

| Вердикт            | Кол-во | Из них уже в репро                                                                                                            |
| ------------------ | ------ | ----------------------------------------------------------------------------------------------------------------------------- |
| [OK] берём         | 27     | 10 (DotPattern, StripedPattern, FlickeringGrid, LightRays, NoiseTexture, Marquee, WorldMap, GlyphMatrix, RadialOrbit, Dither) |
| [ADAPT] адаптируем | 19     | —                                                                                                                             |
| [NO] не берём      | 31     | —                                                                                                                             |
| **Итого**          | **77** | 10                                                                                                                            |

Причины отказов сгруппированы в четыре класса — это важнее самих списков:

1. **Дублирование** (Globe, Orbiting Circles, Icon Cloud, Shiny Button, Shine/Border Beam, Grid Pattern) —
   задача уже решена нашим компонентом или сводится к нему одним режимом.
2. **Тяжёлый рантайм** (Particles, Floating 3D, Morphing Text, Dia Text Reveal, Video Text, Globe,
   Icon Cloud) — WebGL/шейдеры ради эффекта, который не несёт смысла.
3. **Ломает дизайн-язык** (Rainbow Button, Neon Gradient Card, Comic Text, Sparkles, Hexagon Pattern,
   Grid Pattern, Spinning Text, Smooth Cursor) — второй акцент, третья геометрия, чужой жанр.
4. **Внешние данные / не наш кейс** (Tweet Card, Hero Video Dialog, iPhone/Android, Lens, Pixel Image,
   Confetti, Cool Mode).

---

## 3. Итоговый состав кита

### 3.1 Ядро (обязательное)

| Группа    | Компоненты                                                                                  | Зачем в ките                      |
| --------- | ------------------------------------------------------------------------------------------- | --------------------------------- |
| Фоны      | DotPattern, StripedPattern, AnimatedGridPattern, LightRays, NoiseTexture                    | «материальность» без картинок     |
| Живое     | FlickeringGrid, GlyphMatrix, Dither (WebGL), Meteors (опция)                                | один signature-moment на страницу |
| Данные    | DottedMap, NumberTicker, AnimatedCircularProgressBar                                        | цифры и география                 |
| Текст     | GradientText (+`animated`), AnimatedShinyText, WordRotate, TextHighlighter, TypingAnimation | заголовки и бейджи                |
| Обводки   | BorderBeam/ShineBorder (один), ShimmerButton, GlareHover, MagicCard, Backlight              | «активный элемент» без цвета      |
| Раскладка | Marquee, BentoGrid, ProgressiveBlur, ScrollProgress, FileTree, BlurFade                     | структура и навигация             |
| Связи     | AnimatedBeam, RadialOrbit, AvatarCircles                                                    | «экосистема»                      |

### 3.2 Фазы (каждая заканчивается прогоном проверок)

| Фаза                | Что делаем                                                                                    | Результат                             | Критерий приёмки                                       |
| ------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------- | ------------------------------------------------------ |
| **1. Ядро визуала** | NumberTicker, AnimatedGridPattern, BorderBeam(+shine), MagicCard, GlareHover, ProgressiveBlur | 6 компонентов + 6 страниц `/kit/[id]` | `verify:kit` зелёный, скриншоты light/dark, JS +≤ 4 КБ |
| **2. Текст**        | AnimatedShinyText, WordRotate, TextHighlighter, TypingAnimation, `animated` у GradientText    | подзаголовки hero и бейджи            | нет layout shift при смене слов (CLS 0)                |
| **3. Композиция**   | BentoGrid, AnimatedBeam, AvatarCircles, FileTree, ScrollProgress                              | секция «фичи» + навигация доков       | обе темы, 390 px без overflow                          |
| **4. Доки**         | `/kit` (индекс), `/kit/[id]`, `/kit/matrix`, `/kit/glossary`, `/kit/intro`                    | справочник кита                       | каждая запись: демо → код → пропсы → где живёт         |

После каждой фазы: `tsc --noEmit` → `next build` → `npm run verify:effects` → кадры
приёмки — `npm run shots` (набор `.cache/shots/v20-*`, обе темы) → разбор в `REPORT.md` §4.6

---

## 4. Матрицы

### 4.1 Эффект × поверхность (что куда можно ставить)

| Эффект                       | Фон страницы | Hero     | Карточка   | Модалка | Input   | Футер      |
| ---------------------------- | ------------ | -------- | ---------- | ------- | ------- | ---------- |
| DotPattern / StripedPattern  | ●            | ●        | ◐ тонко    | x       | x       | ◐          |
| AnimatedGridPattern          | ●            | ◐        | ◐          | x       | x       | ●          |
| LightRays                    | x            | ●        | x          | x       | x       | ◐          |
| NoiseTexture                 | ●            | ●        | ◐          | x       | x       | ●          |
| FlickeringGrid / GlyphMatrix | x            | ◐        | ● активная | x       | x       | x          |
| Dither (WebGL)               | x            | ● полоса | x          | x       | x       | x          |
| BorderBeam / Shimmer         | x            | ● CTA    | ● активная | ◐       | ● focus | x          |
| MagicCard (spotlight)        | x            | x        | ●          | x       | x       | x          |
| GlareHover / Backlight       | x            | x        | ●          | ◐       | x       | x          |
| Meteors / Ripple             | x            | ◐        | x          | x       | x       | ◐ один раз |

● можно · ◐ с оговоркой · x нельзя. Правило-предохранитель: **на одном экране не больше двух
эффектов из этой таблицы**, и только один из них — «живой» (движется).

### 4.2 Техника × цена

| Ступень      | Техники                                                   | Что должно быть правдой                                 |
| ------------ | --------------------------------------------------------- | ------------------------------------------------------- |
| 1. SVG       | `<pattern>`, `feTurbulence`, `<path>`                     | 0 JS, цвет `currentColor`, есть маска                   |
| 2. CSS       | gradient, `conic-gradient`, `@property`, маски, keyframes | анимируются только `opacity`/`transform`                |
| 3. Canvas 2D | `FlickeringGrid`, `GlyphMatrix`, `NumberTicker`           | DPR ≤ 2, `IntersectionObserver`, пауза вне вьюпорта     |
| 4. WebGL     | только `Dither`                                           | ленивый чанк, `prefers-reduced-motion` = статичный кадр |

### 4.3 Анимация × задача (числа, а не ощущения)

| Задача                  | Инструмент                    | Длительность / кривая              |
| ----------------------- | ----------------------------- | ---------------------------------- |
| Появление секции        | `BlurFade` (`useInView`)      | 300–400 мс, `ease-out`, `y: 8 → 0` |
| Смена статуса в демо    | `AnimatePresence mode="wait"` | 250 мс                             |
| Hover карточки          | CSS `transition`              | 150 мс (`opacity`, `transform`)    |
| Клик по CTA             | волна/ripple                  | 400 мс, без задержки               |
| Счётчик                 | `NumberTicker`                | ~1 с, `easeOutCubic`               |
| Лента                   | CSS keyframes                 | 52–64 с на цикл, пауза по hover    |
| Бегущая точка по связи  | `AnimatedBeam`                | 3–5 с loop                         |
| Появление цифры/графика | `stroke-dashoffset`           | 600 мс                             |

Все значения — константы в `lib/kit-motion.ts` [plan], чтобы их нельзя было «подкрутить на глаз» в одном
компоненте и забыть в остальных.

### 4.4 Карта z-index (из `code-1`, адаптирована)

| Слой             | z-index | Чем занят                             |
| ---------------- | ------- | ------------------------------------- |
| Зерно/оверлеи    | 999     | `NoiseTexture`, `pointer-events-none` |
| Модалки/поповеры | 100     | `dialog`, `AnimatePresence`           |
| Sticky-навигация | 50      | `SiteNav`, `ScrollProgress`           |
| Декор секции     | 5       | лучи, ленты, орбиты                   |
| Контент          | 10      | текст, карточки                       |
| Фон              | 0       | паттерны, градиенты                   |

---

## 5. Архитектура кита: один манифест → доки, матрицы, проверки

### 5.1 Зачем манифест

В `design-system-lab` глоссарий и демо связаны вручную — и это первое, что расходится. У нас связь
механическая: **одна запись = страница доков + карточка в индексе + строка в матрицах + проверка**.

### 5.2 Схема записи

```ts
// lib/kit/manifest.ts
export type KitSurface = "page" | "hero" | "card" | "modal" | "input" | "footer";
export type KitVerdict = "core" | "optional" | "adapt";

export type KitEntry = {
  id: string; // "number-ticker"
  name: string; // "Number Ticker"
  ru: string; // «Бегущие цифры»
  category: "bg" | "text" | "outline" | "layout" | "data" | "live";
  verdict: KitVerdict;
  tech: "svg" | "css" | "canvas" | "webgl" | "motion";
  cost: { js: "0" | string; motion: "none" | "css" | "raf" | "spring" };
  surfaces: KitSurface[];
  source?: string; // ссылка на Magic UI
  uses: string[]; // с чем комбинируется (id)
  props: { name: string; type: string; default?: string }[];
  states: string[]; // idle/hover/active/loading/empty
  a11y: string[]; // role/aria/reduced-motion
  where: string[]; // реальные места в репро
};
```

### 5.3 Пример записи

```ts
const borderBeam: KitEntry = {
  id: "border-beam",
  name: "Border Beam",
  ru: "Блик по периметру",
  category: "outline",
  verdict: "core",
  tech: "css",
  cost: { js: "0", motion: "css" },
  surfaces: ["hero", "card", "input"],
  source: "https://magicui.design/docs/components/border-beam",
  uses: ["shimmer-button", "magic-card"],
  props: [
    { name: "size", type: "number", default: "180" },
    { name: "duration", type: "number", default: "8" },
    { name: "delay", type: "number", default: "0" },
    { name: "colorFrom", type: "CSSColor", default: "var(--gradient-primary)" },
    { name: "colorTo", type: "CSSColor", default: "var(--gradient-secondary)" },
  ],
  states: ["idle", "active", "reduced-motion"],
  a11y: ["декоративный: aria-hidden", "не единственный индикатор активного состояния"],
  where: ["/kit", "карточка тарифа (план)"],
};

export const kitEntries: KitEntry[] = [borderBeam];
```

### 5.4 Правила, которые держат доки честными

1. Компонент без записи в манифесте **не появляется** ни в `/kit`, ни в матрицах.
2. Запись без файла `components/kit/<id>/<id>.demo.tsx` валит `verify:kit` — «документировать то, чего нет» нельзя.
3. `surfaces` и матрица §4.1 — один источник: матрица рендерится из записей.
4. Цена в записи обязана совпадать с замером (JS-чанк и наличие rAF), иначе `verify:kit` предупреждает.
5. Скриншоты снимаются скриптом `npm run shots` (Playwright, обе темы, 1440 и 390 px).

### 5.5 Страницы

| Маршрут         | Что показывает                                                                          | Источник                     |
| --------------- | --------------------------------------------------------------------------------------- | ---------------------------- |
| `/kit`          | индекс: фильтры по категории/технике/поверхности, карточки с живым превью               | манифест                     |
| `/kit/[id]`     | демо → код (сворачиваемый) → пропсы (таблица) → состояния → где живёт → чем компоновать | манифест + компонент         |
| `/kit/matrix`   | три матрицы §4 + подсветка запрещённых комбинаций                                       | манифест                     |
| `/kit/glossary` | термины из `design-system-lab` (26+) со ссылкой «показать»                              | `lib/kit-glossary.ts` [plan] |
| `/kit/intro`    | методология: лестница стоимости, правила, чеклист (перенос `/guide`)                    | статический MD               |

Репро `/` остаётся витриной; `/guide` уступает место `/kit/intro` и редиректит туда, чтобы не было
двух источников правды.

---

## 6. Структура репозитория

```text
components/kit/
  <id>/
    <id>.tsx          # компонент, <= 200 строк
    <id>.demo.tsx     # демо-сцена рядом с компонентом, <= 120 строк
  dither/
    dither.tsx · shaders.ts · webgl.ts · lazy-dither.tsx
  _shared/
    demo-frame.tsx    # рамка демо-сцены
    kit-card.tsx      # карточка индекса
    kit-filters.tsx   # фильтры (состояние в URL)
    registry.ts       # СГЕНЕРИРОВАН: id -> демо
    kit-stamp.tsx     # чипы «из кита» под секциями главной
    kit-cost.ts       # короткая подпись цены для чипов
    kit-demo.tsx      # <KitDemo id />

components/guide/     # справочник на главной
  hero.tsx            # стартовый экран: макро-заголовок, карта справа, четыре числа
  catalog/            # каталог: вкладки «кит / паттерны» и паспорт выбранной записи
    catalog.tsx       # вкладки, сайдбар, панель паспорта (клиентский)
    catalog-rail.tsx  # сайдбар на десктопе, лента чипов на узком экране
    kit-passport.tsx  # паспорт компонента: демо, факты, пропсы, код, контекст
    pattern-passport.tsx # паспорт паттерна: пример, состав, правила, грабли
    kit-preview.tsx   # чип «с чем сочетать» -> превью рядом, без ухода
    use-catalog-state.ts # вкладка, выбор и синхронизация с hash
  place-matrix.tsx    # матрица «техника x цена» для одного места
  catalog/places.ts   # места страницы: пять сцен + пять поверхностей-тегов
  matrix.tsx          # техника x цена
  composition-rules.tsx # шесть правил «так / не так»

lib/kit/
  types.ts            # KitEntry, KitProp, KitCost
  entries/
    pattern.ts · surface.ts · motion.ts · text.ts · data.ts
  manifest.ts         # сборка, подписи, фильтры, статистика

app/kit/
  page.tsx            # стена: индекс с фильтрами
  [id]/page.tsx       # редирект в каталог на #c-<id>
  [id]/page.tsx       # страница компонента
  matrix/page.tsx     # фаза 4
  glossary/page.tsx   # фаза 4

scripts/
  build-kit-registry.mjs  # генерирует _shared/registry.ts из папок
  verify-kit.mjs          # папки <-> демо <-> манифест <-> доки
```

Четыре правила структуры:

1. **id = имя папки = имя файла = id в манифесте.** Расхождение ловит `verify:kit`, а не ревью.
2. **Демо лежит рядом с компонентом**, а не в общем файле: один `demos.tsx` на 40 сцен упёрся бы в
   лимит 250 строк, и резать его пришлось бы задним числом.
3. **Реестр демо генерируется** (`npm run kit:registry`) обходом папок и проверяется на свежесть:
   ручного списка из 40 демо не существует.
4. **Записи разложены по категориям**, поэтому новая фаза добавляет файл, а не режет старый.
5. **Ячейка главной подписывается из манифеста** — в шапке ячейки стоят имена компонентов и цена
   в JS; связь «блок главной -> компонент кита» видна в интерфейсе, а не только в коде.

---

## 7. Риски и анти-паттерны

| Риск                               | Как снимаем                                                                                      |
| ---------------------------------- | ------------------------------------------------------------------------------------------------ |
| «Кит» превращается в свалку демок  | вердикты §2 обязательны; [NO] не обсуждается без нового аргумента                                |
| Доки расходятся с кодом            | манифест как единственный источник + `verify:kit` в CI                                           |
| Три анимации на экран              | правило «один живой эффект на секцию» + матрица §4.1                                             |
| Рост бандла                        | бюджет фазы: +≤ 4 КБ JS; `Dither` остаётся единственным WebGL                                    |
| Копирование кода Magic UI как есть | адаптация под токены/маски/хайрлайны; код переписывается, не вставляется                         |
| Слепое доверие гайдам              | из трёх файлов взяты принципы и формат подачи, но не стек (Lenis, Spline, tsParticles отклонены) |

---

## 8. Чеклист перед мержем (обновлён)

1. Фон ≥ 3 порядка тише текста; прищурился — читается заголовок.
2. У каждого паттерна маска, а не обрезка бордером.
3. **Один живой эффект на секцию**, суммарно ≤ 2 эффекта на экран.
4. Цвет только из токена; дарк-тема проверена скриншотом.
5. `prefers-reduced-motion` выключает движение (проверяется автоматически).
6. Запись в манифесте есть; `/kit/[id]` открывается; матрицы содержат компонент.
7. Тяжёлое — в ленивом чанке; JS-бюджет фазы не превышен.
8. На 390 px нет горизонтального скролла и обрезанного текста.
9. `tsc --noEmit`, `next build`, `verify:effects`, `verify:kit` — зелёные.
10. Ни одной библиотеки, которую нельзя объяснить одной строкой.

---

## 9. Фаза 1: сделано

Манифест, шесть новых компонентов и страницы кита реализованы. Раскладка — папка на компонент
(§6), всего 20 компонентов:

```text
lib/kit/
  types.ts               # типы KitEntry, KitProp, KitCost
  entries/pattern.ts     # 5: паттерны
  entries/surface.ts     # 6: поверхности (border-beam, magic-card, glare-hover, ...)
  entries/motion.ts      # 5: движение (glyph-matrix, marquee, radial-orbit, orbiting-circles, scroll-velocity)
  entries/text.ts        # 5: текст (number-ticker, shiny-text, word-rotate, text-highlighter, typing-animation)
  entries/data.ts        # 1: данные (world-map)
  manifest.ts            # сборка, подписи, фильтры, статистика, getKitEntry

components/kit/<id>/
  <id>.tsx               # компонент, <= 200 строк
  <id>.demo.tsx          # демо-сцена рядом
  dither/ + lazy-dither.tsx + shaders.ts + webgl.ts   # WebGL-часть
components/kit/_shared/
  demo-frame.tsx         # рамка демо-сцены
  kit-card.tsx           # карточка индекса
  kit-filters.tsx        # фильтры через URL
  registry.ts            # СГЕНЕРИРОВАН обходом папок
  kit-demo.tsx           # <KitDemo id />
app/kit/
  page.tsx               # индекс: статистика, три фильтра, сетка карточек
  [id]/page.tsx          # демо -> код -> пропсы -> состояния -> a11y -> где -> с чем
scripts/
  build-kit-registry.mjs # генератор _shared/registry.ts, режим --check
  verify-kit.mjs         # папки <-> демо <-> манифест <-> доки
```

Что проверяет `npm run verify:kit` (20 записей, 20 папок, 20 демо):

1. у каждой записи есть все обязательные поля;
2. `components/kit/<id>/<id>.tsx` и `components/kit/<id>/<id>.demo.tsx` существуют;
3. `file` в записи совпадает с папкой;
4. каждый компонент в `components/kit` есть в манифесте (обратная проверка тоже);
5. `uses` ссылается только на существующие id;
6. имя компонента упомянуто в этом документе;
7. в манифесте нет эмодзи;
8. `_shared/registry.ts` совпадает с обходом папок (`build-kit-registry.mjs --check`).

Отдельно `npm run verify:effects` проверяет живой сайт: консоль на `/`, `/guide`, `/kit` и трёх
страницах компонентов, темы, точки карты, копии ленты, переполнения на 390/768/1440 и
reduced-motion. Обе проверки входят в `npm run verify:all`.

Главная — витрина кита: первый экран на карте мира, сразу под ним каталог всех двадцати
компонентов (одна сетка, живые демо), затем полоса дизеринга, процесс, ленты отзывов и призыв.
Имена и цена в JS берутся из манифеста, поэтому новый компонент появляется в каталоге без правок
разметки.

Скриншоты фазы 1 снимались вручную и удалены при переходе на поколения
(`v20-*`): набор восстанавливается командой `npm run shots`, старая россыпь
файлов весила больше сотни мегабайт и мешала снапшоту воркспейса.

### Фаза 2: текст

Сделано: `ShinyText` (бывший AnimatedShinyText), `WordRotate`, `TextHighlighter`, `TypingAnimation`
и режим `animated` у `GradientText`. Всего в ките **20 компонентов**, из них 12 без JS.

| Компонент               | Техника                   | Где живёт            | Решение                                                  |
| ----------------------- | ------------------------- | -------------------- | -------------------------------------------------------- |
| ShinyText               | CSS `background-position` | бейдж в hero         | блик не мешает чтению, гаснет при reduced-motion         |
| WordRotate              | framer-motion             | лид в hero           | слот по самому длинному слову, центрирование делит запас |
| TextHighlighter         | CSS `scaleX`              | заголовок блока кита | заливка под текстом, переносы строк не ломаются          |
| TypingAnimation         | `setTimeout`              | блок кода в showcase | старт по IntersectionObserver, каретка `aria-hidden`     |
| GradientText `animated` | CSS `background-position` | призыв               | тот же ключевой кадр, что у ShinyText                    |

### Что дальше

Главная — справочник, а не лендинг. Порядок и назначение разделов:

| Раздел     | Что внутри                                                                                         |
| ---------- | -------------------------------------------------------------------------------------------------- |
| `#start`   | стартовый экран: макро-заголовок (до 132 px), карта справа, четыре числа, вход в каталог           |
| `#catalog` | сайдбар из 20 компонентов и паспорт выбранного: демо, что делает, куда, с чем, цена, код, источник |
| `#where`   | вид каталога «по месту»: все поверхности из `surfaces`, сцена (если есть) и матрица места          |
| `#rules`   | законы дизайн-системы: шесть инвариантов, у каждого — ссылка на живой паттерн-пример               |
| `#matrix`  | техника x цена                                                                                     |
| `#rules`   | шесть правил композиции                                                                            |

Разделы отделены волосяными линиями (`border-b` на обёртке), шапка липкая и повторяет тот же
порядок. Паспорт переключается кликом в сайдбаре; ссылки `#c-<id>` из блока «что куда» открывают
нужный компонент через `hashchange`. До `lg` вертикальный список из двадцати строк отодвигал бы
паспорт на два экрана вниз, поэтому на узком экране он сжимается в горизонтальную ленту чипов, а
паспорт идёт сразу под ней.

Связи в паспорте кликабельны: «с чем сочетать» переключает паспорт на связанный компонент, «источник»
ведёт на оригинал, а со страницы кита возвращает ссылка «назад в каталог» на `/#c-<id>` — человек
попадает в каталог с открытым паспортом, а не в начало документа.

Место в «что куда» — не строка текста, а разворот: `components/guide/scenes/` держит пять собранных
сцен (`hero-scene`, `section-scene`, `card-scene`, `background-scene`, `empty-scene`), каждая — из
компонентов своего места; под сценой `components/guide/place-matrix.tsx` печатает матрицу
«техника × цена», посчитанную только по этим компонентам. Адрес `#p-<место>` открывает нужный
разворот сразу.

Удалено вместе с вымышленным продуктом: маркетинговые секции, отзывы, интеграции, демо-терминал и
дифф, а также неиспользуемые оболочки навигации и декоративные биты. Задача страницы — держать под
рукой список и правила, а не продавать продукт.

Стартовый экран набран макро-типографикой: заголовок до 132 px, ведущая 0.88, трекинг −0.055em,
иерархию держат размер и вес, а не подписи. Слой статичен — ни бегущих бликов, ни счётчиков: числа
на старте напечатаны как текст, потому что обещание «12 компонентов без JS» должно подтверждаться
прямо здесь. Единственная графика — карта из точек, посчитанная на сервере и прижатая к правому
краю с линейной маской, чтобы точки не спорили с буквами.

Сцены демо переписаны по правилу «демо доказывает подпись»:

| Компонент                         | Что было не так                                                          | Что показывает сцена теперь                                                             |
| --------------------------------- | ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| `progressive-blur`                | размывалось всё, включая первую строку — читалось как «контент кончился» | восемь строк, размытие нарастает от 44% к низу пятью слоями                             |
| `marquee`                         | одна полоса в пустой плите                                               | две встречные ленты, крупные чипы, пауза по наведению останавливает обе                 |
| `noise-texture`                   | зерно на весь кадр, сравнить не с чем                                    | две половины: слева чистый градиент, справа он же с зерном 0.55                         |
| `glyph-matrix`                    | сетка символов без движения читалась как текстура                        | падающие колонки с затухающим хвостом на тёмной подложке                                |
| `flickering-grid`                 | плотный голубой шум на всю плитку                                        | редкие вспышки с хвостом: ~10% квадратов подсвечены                                     |
| `light-rays`                      | один мутный блик от `blur(18px)`                                         | пучок различимых полос из верхней точки                                                 |
| `text-highlighter`                | фраза ломалась на три строки, маркер терялся                             | одна строка с маркером; `isolate` на обёртке — без него заливка уходила за фон карточки |
| `number-ticker`                   | подпись «1400 компонентов» противоречила манифесту                       | подпись «точек на карте мира»                                                           |
| `word-rotate`, `typing-animation` | тексты про вымышленный продукт                                           | словарь страницы: «интерфейс для каталога», «20 компонентов · 12 без JS»                |

Второй проход закрыл остальные десять сцен: `glare-hover` и `magic-card` теперь видны без
курсора (проп `auto` у блика и `always` у прожектора — в каталоге hover никто не наводит),
`striped-pattern` и `dot-pattern` получили маски и крупнее шаг, `world-map` — 2200 точек вместо
3800, `radial-orbit` — три разные метки вместо трёх плюсов, `border-beam` — русские подписи,
`dither` — метку «WebGL · ленивый чанк», `animated-grid-pattern` — сцену без пояснительной
подписи. `verify:effects` проверяет, что размечены все двадцать две сцены (`data-scene`), а не десять.

Рамка сцены получила проп `tone: "dark"`: класс `bg-[#…]` в `className` проигрывал
`bg-background` по каскаду, поэтому сцены, которые сами светятся, раньше стояли на светлом фоне.
Метка `data-scene` на рамке — единственный побочный атрибут: по ней `verify:effects` находит
сцену и проверяет, что разметка, подложка и число элементов совпадают с подписью.
