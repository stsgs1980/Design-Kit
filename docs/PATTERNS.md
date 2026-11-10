# Паттерны

Приёмы уровня страницы, собранные из компонентов кита. Компонент отвечает на вопрос «как это сделано»,
паттерн — «когда это брать». Семнадцать записей, ни одной новой зависимости.

Последние три — категория «наборы»: не приём из музея, а собранная композиция кита с порядком шагов
(`origin: "concept"`, поэтому ссылки на оригинал нет, а правила читаются как шаги сборки).

## Состав

| id                         | приём                     | категория       | вердикт    | годы        | из чего                                                                               |
| -------------------------- | ------------------------- | --------------- | ---------- | ----------- | ------------------------------------------------------------------------------------- |
| `macro-typography`         | Макро-типографика         | типографика     | на подъёме | 2024        | text-highlighter, noise-texture, dot-pattern                                          |
| `editorial`                | Редакционный стиль        | типографика     | устоялся   | 2022        | marquee, text-highlighter, progressive-blur                                           |
| `glassmorphism`            | Стекло                    | поверхности     | сходит     | 2021        | noise-texture, light-rays, border-beam                                                |
| `glass-clay`               | Стекло и глина            | поверхности     | устоялся   | 2022        | light-rays, noise-texture, border-beam                                                |
| `tactile-minimalism`       | Тактильный минимализм     | поверхности     | устоялся   | 2023        | noise-texture, progressive-blur, shiny-text                                           |
| `aurora-background`        | Полярное сияние           | фоны            | на подъёме | 2024        | light-rays, flickering-grid, noise-texture, progressive-blur                          |
| `dark-glow`                | Тёмное свечение           | фоны            | на подъёме | 2024        | border-beam, dither, glyph-matrix, noise-texture                                      |
| `spotlight-hover`          | Прожектор                 | взаимодействие  | на подъёме | 2025        | magic-card                                                                            |
| `sustainable-web`          | Экономный фон             | подход          | на подъёме | 2023        | dot-pattern, light-rays, noise-texture, world-map                                     |
| `cinematic-scrollytelling` | Кино на прокрутке         | взаимодействие  | на подъёме | 2024        | progressive-blur, animated-grid-pattern, typing-animation                             |
| `living-type`              | Живой текст               | типографика     | на подъёме | 2023        | word-rotate, marquee, shiny-text                                                      |
| `four-layers`              | Четыре линии, четыре слоя | визуальный язык | на подъёме | 2026        | noise-texture, dot-pattern, striped-pattern, flickering-grid, border-beam, light-rays |
| `clean-design-2`           | Умный минимализм          | визуальный язык | устоялся   | 2018 → 2024 | number-ticker, text-highlighter, dot-pattern                                          |
| `neo-brutalism`            | Нео-брутализм             | визуальный язык | на подъёме | 2024        | number-ticker, text-highlighter, striped-pattern                                      |
| `hero-recipe`              | Первый экран              | наборы          | устоялся   | 2026        | dot-pattern, light-rays, noise-texture, shiny-text, number-ticker, border-beam        |
| `social-strip`             | Лента отзывов             | наборы          | устоялся   | 2026        | marquee, glare-hover, progressive-blur, noise-texture                                 |
| `accent-card`              | Карточка с акцентом       | наборы          | устоялся   | 2026        | magic-card, border-beam, text-highlighter, glare-hover                                |

## Что не взяли и почему

- **Bento Grid** — отклонён как каркас страницы (решение пользователя), в экспонаты не возвращаем.
- **Neo-Brutalism, Dopamine, Neo-Skeuomorphism** — требуют своей палитры и шрифтов, это другой кит.
- **Spatial Web, Immersive 3D** — нужен three.js и мегабайты: нарушает правило «лестница стоимости».
  Cinematic Web взят без 3D: прокрутка на CSS `animation-timeline`, без скрипта.
- **Generative & Adaptive UI** — генерация не проверяется демо-сценой, а правило «без примера не берём» остаётся.

## Как устроено

- Манифест: `lib/patterns/entries/*.ts`, агрегат — `lib/patterns/manifest.ts`. Поля: категория, вердикт, годы,
  «когда брать», состав из компонентов кита, правила, грабли, цена, ссылка на музей.
- Сцена: `components/patterns/<id>/<id>.demo.tsx`, реестр — `components/patterns/_shared/registry.ts`.
- Страницы: `/patterns` (фильтры в URL, поэтому серверная) и `/patterns/<id>`.
- Проверка: `npm run verify:patterns` — поля, наличие сцены, запись в реестре, состав только из реальных id кита,
  ссылка на музей, упоминание в этом файле.

## Правило приёма

Паттерн без живого примера не считается: у каждой записи есть сцена, и сцена собирается только из компонентов
кита. Если для приёма нужна новая зависимость, приём ждёт своей фазы, а не тянет её в основной бандл.
