import { kitEntriesData } from "@/lib/kit/entries/data";
import { kitEntriesMotion } from "@/lib/kit/entries/motion";
import { kitEntriesPattern } from "@/lib/kit/entries/pattern";
import { kitEntriesSurface } from "@/lib/kit/entries/surface";
import { kitEntriesText } from "@/lib/kit/entries/text";
import type { KitCategory, KitEntry, KitTech, KitVerdict } from "@/lib/kit/types";

export type { KitCategory, KitCost, KitEntry, KitProp, KitTech, KitVerdict } from "@/lib/kit/types";

/**
 * Манифест кита: единственный источник правды для /kit, матриц и проверок.
 *
 * Записи разложены по категориям — так фаза добавляет файл, а не режет старый.
 * Демо не хранится в записи: оно всегда `components/kit/<id>/<id>.demo.tsx`.
 */
export const kitEntries: KitEntry[] = [
  ...kitEntriesPattern,
  ...kitEntriesSurface,
  ...kitEntriesMotion,
  ...kitEntriesText,
  ...kitEntriesData,
];

/** Подписи категорий для интерфейса. */
export const kitCategoryLabels: Record<KitCategory, string> = {
  pattern: "Паттерны",
  motion: "Движение",
  surface: "Поверхности",
  data: "Данные",
  text: "Текст",
};

/** Подписи техник: по ним строится второй фильтр. */
export const kitTechLabels: Record<KitTech, string> = {
  css: "CSS",
  svg: "SVG",
  canvas: "Canvas 2D",
  webgl: "WebGL",
  motion: "framer-motion",
};

/** Подписи вердиктов: в интерфейсе кита вердикт показывается человеческим словом. */
export const kitVerdictLabels: Record<KitVerdict, string> = {
  core: "ядро",
  adapted: "адаптирован",
  rejected: "отклонён",
};

/** Все категории в порядке показа. */
export const kitCategories: KitCategory[] = ["pattern", "surface", "motion", "text", "data"];

/** Все поверхности, которые встречаются в записях, в порядке появления. */
export function kitSurfaces(): string[] {
  const seen = new Set<string>();

  for (const entry of kitEntries) {
    for (const surface of entry.surfaces) {
      seen.add(surface);
    }
  }

  return [...seen].sort();
}

/** Все техники, реально используемые в ките. */
export function kitTechs(): KitTech[] {
  return [...new Set(kitEntries.map((entry) => entry.tech))];
}

/** Одна запись по id. */
export function getKitEntry(id: string): KitEntry | undefined {
  return kitEntries.find((entry) => entry.id === id);
}

/** Записи, у которых есть заданная поверхность. */
export function kitBySurface(surface: string): KitEntry[] {
  return kitEntries.filter((entry) => entry.surfaces.includes(surface));
}

/** Сводка для шапки /kit: числа считаются, а не пишутся руками. */
export function kitStats(): {
  total: number;
  noJs: number;
  byTech: Record<KitTech, number>;
  surfaces: number;
} {
  const byTech = {} as Record<KitTech, number>;

  for (const entry of kitEntries) {
    byTech[entry.tech] = (byTech[entry.tech] ?? 0) + 1;
  }

  return {
    total: kitEntries.length,
    noJs: kitEntries.filter((entry) => entry.cost.js === "0").length,
    byTech,
    surfaces: kitSurfaces().length,
  };
}

/** Подписи мест: где компонент уместен. */
export const kitSurfaceLabels: Record<string, string> = {
  hero: "первый экран",
  section: "секция",
  card: "карточка",
  background: "фон",
  nav: "навигация",
  empty: "пустое состояние",
  cta: "призыв к действию",
  social: "соцдоказательство",
  input: "поле ввода",
  code: "код и данные",
};
