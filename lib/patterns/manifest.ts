import { patternEntriesBackgrounds } from "@/lib/patterns/entries/backgrounds";
import { patternEntriesInteractions } from "@/lib/patterns/entries/interactions";
import { patternEntriesMotion } from "@/lib/patterns/entries/motion";
import { patternEntriesRecipes } from "@/lib/patterns/entries/recipes";
import { patternEntriesSurfaces } from "@/lib/patterns/entries/surfaces";
import { patternEntriesTypography } from "@/lib/patterns/entries/typography";
import { patternEntriesVisual } from "@/lib/patterns/entries/visual";
import type { PatternCategory, PatternEntry, PatternVerdict } from "@/lib/patterns/types";

export type { PatternCategory, PatternEntry, PatternPart, PatternVerdict } from "@/lib/patterns/types";

/**
 * Манифест паттернов: приёмы уровня страницы, собранные из компонентов кита.
 *
 * Отличие от кита: у компонента есть пропсы, у паттерна — правила и грабли.
 * Поэтому записи живут отдельно, а связь с китом держится на `composition`.
 */
export const patternEntries: PatternEntry[] = [
  ...patternEntriesTypography,
  ...patternEntriesSurfaces,
  ...patternEntriesBackgrounds,
  ...patternEntriesInteractions,
  ...patternEntriesMotion,
  ...patternEntriesVisual,
  ...patternEntriesRecipes,
];

/** Подписи категорий для интерфейса. */
export const patternCategoryLabels: Record<PatternCategory, string> = {
  typography: "Типографика",
  surfaces: "Поверхности",
  backgrounds: "Фоны",
  interactions: "Взаимодействие",
  visual: "Визуальный язык",
  conceptual: "Подход",
  recipes: "Наборы",
};

/** Подписи вердиктов: человеческим словом, а не статусом из музея. */
export const patternVerdictLabels: Record<PatternVerdict, string> = {
  stable: "устоялся",
  rising: "на подъёме",
  fading: "сходит",
};

/** Все категории в порядке показа. */
export const patternCategories: PatternCategory[] = [
  "typography",
  "surfaces",
  "backgrounds",
  "interactions",
  "visual",
  "conceptual",
  "recipes",
];

/** Все вердикты, которые реально встречаются: фильтр не показывает пустых кнопок. */
export function patternVerdicts(): PatternVerdict[] {
  return [...new Set(patternEntries.map((entry) => entry.verdict))];
}

/** Годы записи в человеческом виде: `2024 → 2026` или `2021`. */
export function patternYears(entry: PatternEntry): string {
  return entry.to ? `${entry.from} → ${entry.to}` : `${entry.from}`;
}

/** Приём из музея или собственный концепт кита. */
export function patternOrigin(entry: PatternEntry): "museum" | "concept" {
  return entry.origin ?? (entry.source ? "museum" : "concept");
}

/** Одна запись по id. */
export function getPatternEntry(id: string): PatternEntry | undefined {
  return patternEntries.find((entry) => entry.id === id);
}

/** Сводка для шапки `/patterns`: числа считаются, а не пишутся руками. */
export function patternStats(): { total: number; rising: number; components: number } {
  const components = new Set(patternEntries.flatMap((entry) => entry.composition.map((part) => part.kit)));

  return {
    total: patternEntries.length,
    rising: patternEntries.filter((entry) => entry.verdict === "rising").length,
    components: components.size,
  };
}
