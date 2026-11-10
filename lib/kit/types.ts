/** Категории кита: по ним строятся фильтры на /kit. */
export type KitCategory = "pattern" | "motion" | "surface" | "data" | "text";

/** Судьба компонента: ядро, адаптация под дизайн-язык или отказ. */
export type KitVerdict = "core" | "adapted" | "rejected";

/** Техника исполнения: чем компонент рисуется. */
export type KitTech = "css" | "svg" | "canvas" | "webgl" | "motion";

/** Цена: что уезжает в браузер и чем анимируется. */
export type KitCost = {
  /** Прибавка к JS-бандлу: "0", "~2 КБ", "ленивый чанк". */
  js: string;
  /** Драйвер анимации: "нет", "css", "rAF", "motion". */
  motion: string;
};

/** Описание пропса для таблицы на странице компонента. */
export type KitProp = {
  name: string;
  type: string;
  defaultValue?: string;
  note?: string;
};

/** Запись манифеста: единственный источник правды для доков и матриц. */
export type KitEntry = {
  /** Стабильный id: совпадает с именем файла компонента. */
  id: string;
  /** Имя компонента в коде. */
  name: string;
  /** Русское название для интерфейса. */
  ru: string;
  /** Что даёт компонент: одна строка человеческим языком, без терминов. */
  what: string;
  category: KitCategory;
  verdict: KitVerdict;
  tech: KitTech;
  cost: KitCost;
  /** Где компонент уместен: hero, card, empty, background, nav, section. */
  surfaces: string[];
  /** Ссылка на оригинал. */
  source: string;
  /** Файл реализации: components/kit/<id>/<id>.tsx. */
  file: string;
  /** Одна строка использования для страницы компонента. */
  usage: string;
  /** С чем компонент сочетается. */
  uses: string[];
  props: KitProp[];
  /** Состояния: idle, hover, active, reduced-motion. */
  states: string[];
  /** Требования доступности. */
  a11y: string[];
  /** Реальные места в репозитории. */
  where: string[];
};
