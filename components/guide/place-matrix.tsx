import { kitEntries, kitTechLabels, type KitEntry, type KitTech } from "@/lib/kit/manifest";
import type { ReactElement } from "react";

/** Техники в порядке «дешевле → дороже»: тот же порядок, что в общей матрице. */
const TECHS: KitTech[] = ["css", "svg", "canvas", "webgl", "motion"];

/** Корзина цены: ноль JS, до двух килобайт, ленивый чанк. */
function bucketOf(entry: KitEntry): "zero" | "small" | "chunk" {
  if (entry.cost.js === "0") return "zero";
  if (entry.cost.js.includes("чанк")) return "chunk";
  return "small";
}

/**
 * Матрица «техника × цена» для одного места страницы.
 *
 * Та же логика, что в общей матрице, но строки и счётчики считаются только по
 * компонентам этого места: видно, во что обойдётся именно первый экран или
 * карточка, а не кит целиком. Строки без компонентов не печатаются — пустых
 * клеток в таблице места быть не должно.
 */
export function PlaceMatrix({ placeId }: { placeId: string }): ReactElement {
  const entries = kitEntries.filter((entry) => entry.surfaces.includes(placeId));
  const rows = TECHS.map((tech) => ({ tech, list: entries.filter((entry) => entry.tech === tech) })).filter(
    (row) => row.list.length > 0,
  );

  const count = (list: KitEntry[], kind: "zero" | "small" | "chunk"): number =>
    list.filter((entry) => bucketOf(entry) === kind).length;

  const free = entries.filter((entry) => bucketOf(entry) === "zero").length;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <p className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">техника × цена места</p>
        <p className="text-[12px] text-muted-foreground">
          {entries.length} компонентов · {free} без JS · {entries.length - free} с JS
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr className="text-[10px] tracking-wide text-muted-foreground uppercase">
              <th scope="col" className="py-2 pr-4 text-left font-normal">
                техника
              </th>
              <th scope="col" className="px-3 py-2 text-center font-normal">
                0 JS
              </th>
              <th scope="col" className="px-3 py-2 text-center font-normal">
                до 2 КБ
              </th>
              <th scope="col" className="px-3 py-2 text-center font-normal">
                ленивый чанк
              </th>
              <th scope="col" className="py-2 pl-4 text-left font-normal">
                компоненты
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.tech} className="border-t border-border">
                <th scope="row" className="py-2.5 pr-4 text-left text-[13px] font-normal whitespace-nowrap">
                  {kitTechLabels[row.tech]}
                </th>
                <td className="px-3 py-2.5 text-center text-[13px] text-muted-foreground">
                  {count(row.list, "zero") || "—"}
                </td>
                <td className="px-3 py-2.5 text-center text-[13px] text-muted-foreground">
                  {count(row.list, "small") || "—"}
                </td>
                <td className="px-3 py-2.5 text-center text-[13px] text-muted-foreground">
                  {count(row.list, "chunk") || "—"}
                </td>
                <td className="py-2.5 pl-4 font-mono text-[11px] leading-relaxed text-muted-foreground">
                  {row.list.map((entry) => entry.id).join(", ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
