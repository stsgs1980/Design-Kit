import type { KitEntry } from "@/lib/kit/manifest";

/**
 * Короткая подпись цены для чипов и индексов кита.
 *
 * В манифесте цена записана для таблицы («0», «~2 КБ», «в составе motion»),
 * а в чипе нужно два-три слова: иначе подпись ломает строку.
 */
export function kitCostLabel(entry: KitEntry): string {
  const raw = entry.cost.js;
  if (raw === "0") return "0 JS";
  if (raw.includes("в составе")) return "motion";
  if (raw.includes("чанк")) return "ленивый";
  return `${raw} JS`;
}
