import { kitEntries, kitTechLabels, type KitEntry } from "@/lib/kit/manifest";
import type { ReactElement } from "react";

/** Техники в порядке «дешевле → дороже». */
const TECHS = ["css", "svg", "canvas", "webgl", "motion"] as const;

/** Корзина цены: ноль JS, до двух килобайт, ленивый чанк. */
function bucketOf(entry: KitEntry): "zero" | "small" | "chunk" {
  if (entry.cost.js === "0") return "zero";
  if (entry.cost.js.includes("чанк")) return "chunk";
  return "small";
}

/**
 * Матрица «техника × цена»: чем рисуется компонент и сколько это стоит.
 *
 * Читается по строке: техника → сколько компонентов бесплатны, сколько стоят
 * до 2 КБ и что требует ленивого чанка. Ответ на вопрос бюджета до вёрстки:
 * если техника в строке WebGL, рядом всегда одна позиция, а не пять.
 */
export function Matrix(): ReactElement {
  return (
    <section id="matrix" className="mx-auto w-full max-w-[1400px] px-6 py-16 md:py-20">
      <div className="flex flex-col gap-3">
        <p className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground uppercase">матрица</p>
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Техника × цена</h2>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Лестница стоимости: сначала CSS и SVG, потом Canvas 2D, и только если без этого никак — WebGL отдельным
          ленивым чанком. В клетке — сколько компонентов этой техники стоят столько.
        </p>
      </div>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[620px] border-collapse text-sm">
          <thead>
            <tr className="text-[11px] tracking-wide text-muted-foreground uppercase">
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
            {TECHS.map((tech) => {
              const list = kitEntries.filter((entry) => entry.tech === tech);
              const count = (kind: "zero" | "small" | "chunk"): number =>
                list.filter((entry) => bucketOf(entry) === kind).length;

              return (
                <tr key={tech} className="border-t border-border">
                  <th scope="row" className="py-3 pr-4 text-left font-normal whitespace-nowrap text-foreground">
                    {kitTechLabels[tech]}
                  </th>
                  <td className="px-3 py-3 text-center text-muted-foreground">{count("zero") || "—"}</td>
                  <td className="px-3 py-3 text-center text-muted-foreground">{count("small") || "—"}</td>
                  <td className="px-3 py-3 text-center text-muted-foreground">{count("chunk") || "—"}</td>
                  <td className="py-3 pl-4 font-mono text-[11px] leading-relaxed text-muted-foreground">
                    {list.map((entry) => entry.id).join(", ")}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
