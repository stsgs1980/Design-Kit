import { getKitEntry, kitEntries, kitStats } from "@/lib/kit/manifest";
import type { KitEntry } from "@/lib/kit/types";
import { getPatternEntry, patternEntries } from "@/lib/patterns/manifest";
import type { PatternEntry } from "@/lib/patterns/types";

/**
 * Набор id для выгрузки: пустой список значит пустой файл, а не «всё».
 */
export type ExportIds = {
  kit: string[];
  patterns: string[];
};

/**
 * Разбирает сырой список id из `?export=` на две корзины.
 * @param raw список id через запятую
 * @returns {ExportIds} разложенные id
 */
export function parseExportIds(raw: string[]): ExportIds {
  const kit: string[] = [];
  const patterns: string[] = [];

  for (const id of raw) {
    if (getKitEntry(id)) kit.push(id);
    else if (getPatternEntry(id)) patterns.push(id);
  }

  return { kit, patterns };
}

/**
 * Строит markdown-выгрузку из выбранных записей.
 * @param ids набор id кита и паттернов
 * @param date дата сборки для шапки
 * @returns {string} готовый markdown
 */
export function buildExportMd(ids: ExportIds, date = new Date().toISOString().slice(0, 10)): string {
  const stats = kitStats();
  const lines: string[] = [];

  lines.push(`# Кит — выгрузка`);
  lines.push(
    `> ${stats.total} компонента · ${stats.noJs} без JS · ${stats.surfaces} мест · ${patternEntries.length} приёмов · Design Kit ${date}`,
  );
  lines.push(``);

  if (ids.kit.length === 0 && ids.patterns.length === 0) {
    lines.push(`_Ничего не выбрано._ Добавьте \`?export=id1,id2\` или выберите в каталоге.`);
    return lines.join("\n");
  }

  if (ids.kit.length > 0) {
    lines.push(`## Компоненты`);
    lines.push(``);

    for (const id of ids.kit) {
      const entry = getKitEntry(id);
      if (!entry) continue;
      lines.push(...kitEntryMd(entry));
    }
  }

  if (ids.patterns.length > 0) {
    lines.push(`## Приёмы`);
    lines.push(``);

    for (const id of ids.patterns) {
      const entry = getPatternEntry(id);
      if (!entry) continue;
      lines.push(...patternEntryMd(entry));
    }
  }

  return lines.join("\n");
}

/**
 * Markdown одного компонента кита.
 * @param entry запись кита
 * @returns {string[]} строки блока
 */
function kitEntryMd(entry: KitEntry): string[] {
  const out: string[] = [];
  out.push(`### ${entry.ru} — ${entry.name}`);
  out.push(`- **Что:** ${entry.what}`);
  out.push(`- **Куда:** ${entry.surfaces.join(" · ")}`);
  out.push(`- **Техника:** ${entry.tech} · **Цена:** ${entry.cost.js} · движение: ${entry.cost.motion}`);
  out.push(`- **Файл:** \`${entry.file}\``);
  out.push(`- **Использование:** \`${entry.usage}\``);
  if (entry.source) out.push(`- **Источник:** ${entry.source}`);

  if (entry.props && entry.props.length > 0) {
    out.push(`- **Пропсы:**`);
    for (const prop of entry.props) {
      const def = prop.defaultValue ? ` = ${prop.defaultValue}` : "";
      const note = prop.note ? ` — ${prop.note}` : "";
      out.push(`  - \`${prop.name}: ${prop.type}${def}\`${note}`);
    }
  }

  if (entry.where && entry.where.length > 0) {
    out.push(`- **Где:** ${entry.where.join("; ")}`);
  }

  out.push(``);
  return out;
}

/**
 * Markdown одного приёма.
 * @param entry запись паттерна
 * @returns {string[]} строки блока
 */
function patternEntryMd(entry: PatternEntry): string[] {
  const out: string[] = [];
  out.push(`### ${entry.name} — ${entry.latin}`);
  out.push(`- **Что:** ${entry.summary}`);
  out.push(`- **Когда:** ${entry.when}`);
  out.push(`- **Категория:** ${entry.category} · ${entry.verdict} · ${entry.from}`);
  out.push(`- **Цена:** ${entry.cost}`);
  if (entry.source) out.push(`- **Источник:** ${entry.source}`);

  if (entry.composition && entry.composition.length > 0) {
    out.push(`- **Из чего:**`);
    for (const item of entry.composition) {
      const kit = getKitEntry(item.kit);
      const label = kit ? `${kit.ru} (${kit.name})` : item.kit;
      out.push(`  - \`${item.kit}\` — ${label}: ${item.role}`);
    }
  }

  if (entry.rules && entry.rules.length > 0) {
    out.push(`- **Правила:**`);
    for (const rule of entry.rules) out.push(`  - ${rule}`);
  }

  if (entry.where && entry.where.length > 0) {
    out.push(`- **Где:** ${entry.where.join("; ")}`);
  }

  out.push(``);
  return out;
}

/**
 * Все id для быстрой выгрузки стены.
 * @returns {ExportIds} все записи
 */
export function allExportIds(): ExportIds {
  return {
    kit: kitEntries.map((entry) => entry.id),
    patterns: patternEntries.map((entry) => entry.id),
  };
}
