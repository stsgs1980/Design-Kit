# Design Kit — справочник по компонентам

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![ESLint](https://img.shields.io/badge/ESLint-9.x-4B32C3.svg)](https://eslint.org/)
[![Prettier](https://img.shields.io/badge/Prettier-3.x-F7B93E.svg)](https://prettier.io/)
[![Node](https://img.shields.io/badge/Node-%3E%3D22.22.2-339933.svg)](https://nodejs.org/)

> **Status**: ACTIVE
> **Last Updated**: 2026-10-26

![Обложка справочника в тёмной теме](screenshots/readme-start.png)

## Overview

Справочник по дизайн-системе из двух слоёв: **кит** — 22 компонента с паспортами, 10 мест
страницы и матрица «техника × цена», и **паттерны** — 17 приёмов уровня страницы, собранных из
тех же компонентов. Задача — не показать картинку, а ответить на три вопроса про каждый компонент:
что он делает, куда его ставить и сколько он стоит в килобайтах и кадрах.

Единый источник правды — манифест (`lib/kit/manifest.ts` и записи в `lib/kit/entries/*.ts`).
Из него считаются числа на страницах, матрицы и проверки, поэтому документация не может разойтись
с кодом незаметно.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Scripts](#scripts)
- [Docs](#docs)
- [Architecture](#architecture)
- [Contributing](#contributing)
- [Conventions](#conventions)
- [License](#license)

## Features

- **22 компонента с паспортами**: живое демо, таблица пропсов, состояния, доступность и места,
  где компонент уже стоит, — одним экраном, без перехода на отдельную страницу.
- **17 приёмов** — паттерны уровня страницы: пример, когда брать, состав из компонентов кита,
  правила, грабли и цена. Паттерн без живого примера не берётся.
- **19 занятых компонентов** в паттернах: новых зависимостей слой не тянет, только CSS и кит.
- **10 мест страницы** (`hero`, `section`, `card`, `background`, `empty`, `nav`, `cta`, `social`,
  `input`, `code`) — обратный разворот каталога: что уместно в этом блоке.
- **13 без JS**: анимация на CSS и SVG, если задача решается композитором; скрипт появляется
  только там, где без него нельзя.
- **Тёмная тема по умолчанию**, выбор человека переживает переход между страницами.
- **Ноль UI-библиотек**: кнопки, бейджи и иконки свои, 4 прод-зависимости.

## Tech Stack

- **Language**: TypeScript 5.9, `strict`, явные типы возврата
- **Framework**: Next.js 16.4 (App Router, Turbopack), React 19.3
- **Styles**: Tailwind CSS v4 (CSS-first `@theme`), токены через `light-dark()`
- **Animation**: framer-motion 14; WebGL 1 без three.js; Canvas 2D и SVG там, где дешевле
- **Linting**: ESLint 9 (flat config), markdownlint, Prettier 3 — из шаблона
  [stsgs1980/webstorm-config](https://github.com/stsgs1980/webstorm-config)
- **Testing**: приёмочные проверки на Playwright 1.64 поверх прод-сборки (`verify:effects`)
- **Hooks**: Husky, lint-staged, Commitlint (Conventional Commits)

## Getting Started

### Prerequisites

- Node.js >= 22.22.2 (в CI и локально — 22.22.2 из `.nvmrc`)
- npm >= 10.8.0

Нижняя граница выбрана по самому требовательному инструменту, а не по фреймворку: Next 16 просит
`>=20.9`, ESLint 10 — `^20.19`, а markdownlint-cli 0.50 и TypeScript 7 требуют `>=22`. Пока нижняя
граница была `20.19.0`, `npm install` на Node 20 печатал `EBADENGINE` — то есть заявленная
поддержка была обещанием, а не фактом.

Pre-commit останавливается на первой ошибке: сначала `lint-staged`, затем проверка длины файлов.
Перед пушем pre-push дополнительно прогоняет `lint`, `typecheck`, `check:docs` и `verify:vendor`.

### Installation

```bash
npm install
npm run dev      # http://localhost:3000
```

Превью запускается в прод-режиме (`npm run build` → `npm run start`): CSS приходит с хешем в имени,
dev-overlay и HMR-смешивание стилей исключены из приёмки.

Порядок приёмки: `npm run build` → **перезапустить** `npm run start` → `npm run verify:all`.
Сборка поверх работающего сервера подменяет `.next` у живого процесса, и браузерные проверки читают
полусобранное приложение — это гонка сборки и сервера, а не регресс.

### CHANGELOG.md

`CHANGELOG.md` ведётся по Conventional Commits и генерируется командой `npm run changelog`
(`conventional-changelog`, профиль angular). Запускать перед пушем в `main`.

### CI

`.github/workflows/ci.yml` гоняет три джобы: `lint` (код, манифесты, доки), `build` и `effects`
(сборка → сервер → `verify:effects` в браузере). Бейдж CI добавляется в шапку этого файла,
когда у репозитория появится remote.

## Scripts

| Команда                     | Описание                                                               |
| --------------------------- | ---------------------------------------------------------------------- |
| `npm run dev`               | Сервер разработки на `0.0.0.0:3000`                                    |
| `npm run build`             | Прод-сборка (Turbopack)                                                |
| `npm run start`             | Прод-сервер на `0.0.0.0:3000`                                          |
| `npm run dev:up`            | Сборка и запуск одной командой (`scripts/dev-up.sh`)                   |
| `npm run lint`              | ESLint (flat config, `--max-warnings=0`)                               |
| `npm run typecheck`         | TypeScript (`tsc --noEmit`)                                            |
| `npm run lint:md`           | markdownlint по всем `.md`                                             |
| `npm run format`            | Prettier (запись)                                                      |
| `npm run format:check`      | Prettier (проверка, как в CI)                                          |
| `npm run check:file-length` | Анти-монолит: не более 250 строк на файл                               |
| `npm run check:docs`        | Сверка доков с конфигами: скрипты, пути, версия Node                   |
| `npm run verify:vendor`     | Чужой код в проекте объявлен и исключён из всех проверок               |
| `npm run verify:code`       | `lint` + `typecheck` + `check:file-length` + `verify:merge`            |
| `npm run verify:kit`        | Манифест кита, демо, поверхности и файлы компонентов                   |
| `npm run verify:patterns`   | Записи паттернов: поля, сцена, реестр, состав из реальных id           |
| `npm run verify:props`      | Паспорта пропсов совпадают с сигнатурами компонентов (TS Compiler API) |
| `npm run verify:merge`      | `cn` схлопывает конфликтующие утилиты Tailwind, не трогая соседние оси |
| `npm run verify:claims`     | Числа в README и подписи в UI сходятся с манифестом                    |
| `npm run verify:readme`     | README по шаблону: разделы, якоря, скрипты, карта документов           |
| `npm run verify:links`      | Живость ссылок «источник»; ходит в сеть, поэтому вне `verify:all`      |
| `npm run verify:effects`    | Браузерная приёмка: консоль, темы, адаптив, reduced-motion, ARIA       |
| `npm run verify:all`        | Всё вышеперечисленное, кроме `verify:links`, включая `verify:effects`  |
| `npm run shots`             | Кадры приёмки: обе темы, стены, узкий экран — в `.cache/shots/`        |
| `npm run mutate`            | Мутационный аудит статических гейтов (каждый обязан покраснеть)        |
| `npm run mutate:live`       | Живые мутации: сборка, сервер на 3100, прогон `verify:effects`         |
| `npm run changelog`         | `CHANGELOG.md` из Conventional Commits                                 |
| `npm run kit:registry`      | Пересборка реестра демо кита                                           |
| `npm run setup:hooks`       | Установка Husky-хуков                                                  |

## Docs

| Документ                                   | На какой вопрос отвечает                                     |
| ------------------------------------------ | ------------------------------------------------------------ |
| [REPORT.md](REPORT.md)                     | Как это сделано, чем измерено и на какие грабли наступили    |
| [docs/KIT.md](docs/KIT.md)                 | Состав и спецификация кита: что взяли, почему, в каких фазах |
| [docs/PATTERNS.md](docs/PATTERNS.md)       | Приёмы: состав, что не взяли, правило приёма                 |
| [docs/CONVENTIONS.md](docs/CONVENTIONS.md) | Правила кода, проверки и осознанные отличия от шаблона       |

Один вопрос — один документ: механика и замеры живут только в `REPORT.md`, состав — только в
`docs/`, правила — только в `docs/CONVENTIONS.md`. README не повторяет ни то, ни другое.

## Architecture

```text
app/                      # маршруты: главная, /kit, /patterns, /guide
components/kit/<id>/      # компонент кита: <id>.tsx + <id>.demo.tsx
components/patterns/<id>/ # сцена паттерна: <id>.demo.tsx
components/guide/         # каталог: вкладки, сайдбар, паспорта, сцены мест
components/nav/           # общая шапка и крошки
lib/kit/entries/*.ts      # записи манифеста кита — источник правды
lib/patterns/entries/*.ts # записи манифеста паттернов
scripts/                  # проверки, скриншоты, мутации
docs/                     # KIT, PATTERNS, CONVENTIONS
```

Серверные компоненты считают всё, что можно посчитать на сервере: карта мира уезжает в HTML
готовыми `<circle>`, ноль клиентского JS. Клиентскими остаются только эффекты, которым нужен
`document`, и они грузятся лениво у вьюпорта.

## Contributing

1. `git checkout -b feat/your-feature`
2. `npm run verify:all` — локально то же, что в CI
3. `git commit -m "feat: add your feature"` (Conventional Commits)
4. `git push origin feat/your-feature`

## Conventions

Стиль кода: 2 пробела, точка с запятой, двойные кавычки, trailing commas, JSDoc для публичного API,
`const`/`let`, не более 250 строк на файл. Юникод-политика: без эмодзи и псевдографики, `[OK]`/`[FAIL]`,
ASCII-стрелки. Язык интерфейса — русский, латиница только для технологий и кода.
Подробности — [docs/CONVENTIONS.md](docs/CONVENTIONS.md).

## License

MIT — см. [LICENSE](LICENSE).
