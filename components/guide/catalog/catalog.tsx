"use client";

import { CatalogRail, type RailGroup } from "@/components/guide/catalog/catalog-rail";
import { ExportBar } from "@/components/guide/catalog/export-bar";
import { KitPassport } from "@/components/guide/catalog/kit-passport";
import { PatternPassport } from "@/components/guide/catalog/pattern-passport";
import { PlacePassport } from "@/components/guide/catalog/place-passport";
import { PLACES } from "@/components/guide/catalog/places";
import { useCatalogState, type CatalogTab } from "@/components/guide/catalog/use-catalog-state";
import { useExportSelection } from "@/components/guide/catalog/use-export-selection";
import { Matrix } from "@/components/guide/matrix";
import { kitCategories, kitCategoryLabels, kitEntries, kitSurfaceLabels } from "@/lib/kit/manifest";
import {
  patternCategories,
  patternCategoryLabels,
  patternEntries,
  patternVerdictLabels,
} from "@/lib/patterns/manifest";
import Link from "next/link";
import type { ReactElement } from "react";
import { useEffect, useState } from "react";

/** Сайдбар кита: группы по категориям, бейдж — цена в JS. */
const KIT_GROUPS: RailGroup[] = kitCategories
  .filter((category) => kitEntries.some((entry) => entry.category === category))
  .map((category) => ({
    key: category,
    label: kitCategoryLabels[category],
    items: kitEntries
      .filter((entry) => entry.category === category)
      .map((entry) => ({
        id: entry.id,
        label: entry.ru,
        badge: entry.cost.js === "0" ? "0" : "JS",
        tone: entry.cost.js === "0" ? undefined : ("warm" as const),
      })),
  }));

/** Сайдбар паттернов: группы по категориям, бейдж — вердикт. */
const PATTERN_GROUPS: RailGroup[] = patternCategories
  .filter((category) => patternEntries.some((entry) => entry.category === category))
  .map((category) => ({
    key: category,
    label: patternCategoryLabels[category],
    items: patternEntries
      .filter((entry) => entry.category === category)
      .map((entry) => ({
        id: entry.id,
        label: entry.name,
        badge: patternVerdictLabels[entry.verdict],
        tone: entry.verdict === "rising" ? ("warm" as const) : undefined,
      })),
  }));

/** Сайдбар вида «по месту»: пять мест страницы и число компонентов в каждом. */
const PLACE_GROUPS: RailGroup[] = [
  {
    key: "places",
    label: "Места страницы",
    items: PLACES.map((place) => ({
      id: place.id,
      label: kitSurfaceLabels[place.id] ?? place.id,
      badge: String(kitEntries.filter((entry) => entry.surfaces.includes(place.id)).length),
    })),
  },
];

const TABS: { id: CatalogTab; label: string; count: number }[] = [
  { id: "kit", label: "Кит", count: kitEntries.length },
  { id: "patterns", label: "Паттерны", count: patternEntries.length },
];

/**
 * Каталог справочника: вкладки «кит / паттерны», вид «по компонентам / по месту».
 *
 * Вкладки стоят на одном уровне с сайдбаром и переключают содержимое на месте.
 * Вид «по месту» — не отдельный раздел, а обратный разворот того же кита: место
 * это поле `surfaces` в манифесте, поэтому «что куда ставить» живёт здесь, а не
 * отдельной секцией. Внизу — сводка «техника × цена» по всему каталогу.
 */
export function Catalog(): ReactElement {
  const {
    tab,
    view,
    activeKit,
    activePattern,
    activePlace,
    sectionRef,
    selectTab,
    selectView,
    selectKit,
    selectPattern,
    selectPlace,
  } = useCatalogState();
  const exportSelection = useExportSelection();
  const [exportMode, setExportMode] = useState(false);

  useEffect(() => {
    if (exportSelection.selected.length > 0) setExportMode(true);
  }, [exportSelection.selected.length]);

  const groups = tab === "patterns" ? PATTERN_GROUPS : view === "places" ? PLACE_GROUPS : KIT_GROUPS;
  const activeId = tab === "patterns" ? activePattern.id : view === "places" ? activePlace.id : activeKit.id;
  const onSelect = tab === "patterns" ? selectPattern : view === "places" ? selectPlace : selectKit;
  const exportSelected = new Set(exportSelection.selected);
  const canExport = view !== "places" && exportMode;

  const onTabKey = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    selectTab(tab === "kit" ? "patterns" : "kit");
  };

  return (
    <section
      ref={sectionRef}
      id="catalog"
      aria-label="Каталог"
      className="mx-auto w-full max-w-[1400px] scroll-mt-6 px-6 py-16 md:py-20"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-3">
          <p className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground uppercase">каталог</p>

          <div
            id="patterns"
            role="tablist"
            aria-label="Разделы каталога"
            onKeyDown={onTabKey}
            className="inline-flex w-fit items-center gap-0.5 rounded-full border border-border bg-card p-1"
          >
            {TABS.map((item) => {
              const active = item.id === tab;

              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  id={`tab-${item.id}`}
                  aria-selected={active}
                  aria-controls="catalog-pane"
                  tabIndex={active ? 0 : -1}
                  onClick={() => selectTab(item.id)}
                  className={
                    active
                      ? "inline-flex items-center gap-2 rounded-full bg-foreground px-3.5 py-1.5 text-[13px] font-medium text-background"
                      : "inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
                  }
                >
                  {item.label}
                  <span className={active ? "font-mono text-[10px] opacity-70" : "font-mono text-[10px]"}>
                    {item.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {tab === "kit" ? (
            <div id="where" className="inline-flex scroll-mt-24 items-center gap-1 font-mono text-[11px]">
              <span className="mr-1 text-muted-foreground">вид:</span>
              {(
                [
                  ["components", "по компонентам"],
                  ["places", "по месту"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={view === id}
                  onClick={() => selectView(id)}
                  className={
                    view === id
                      ? "rounded-full border border-primary bg-primary px-2.5 py-0.5 font-medium text-primary-foreground"
                      : "rounded-full border border-border px-2.5 py-0.5 text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
                  }
                >
                  {label}
                </button>
              ))}
            </div>
          ) : null}

          {canExport || exportMode ? null : (
            <button
              type="button"
              onClick={() => setExportMode(true)}
              className="rounded-full border border-border bg-card px-3 py-1.5 font-mono text-[11px] text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
            >
              Выбрать для MD
            </button>
          )}
          {exportMode ? (
            <button
              type="button"
              onClick={() => setExportMode(false)}
              className="rounded-full bg-foreground px-3 py-1.5 font-mono text-[11px] font-medium text-background"
            >
              Готово {exportSelection.selected.length > 0 ? `· ${exportSelection.selected.length}` : ""}
            </button>
          ) : null}
          <Link
            href={tab === "kit" ? "/kit" : "/patterns"}
            className="font-mono text-[11px] text-muted-foreground underline-offset-4 transition-colors hover:text-primary-text hover:underline"
          >
            вся стена <span aria-hidden>-&gt;</span>
          </Link>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr] xl:grid-cols-[300px_1fr]">
        <CatalogRail
          groups={groups}
          activeId={activeId}
          onSelect={onSelect}
          exportSelected={canExport ? exportSelected : undefined}
          onToggleExport={canExport ? exportSelection.toggle : undefined}
        />

        <div
          id="catalog-pane"
          role="tabpanel"
          aria-labelledby={`tab-${tab}`}
          className="min-w-0 border-t border-border pt-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8"
        >
          {tab === "patterns" ? (
            <PatternPassport entry={activePattern} onOpenKit={selectKit} />
          ) : view === "places" ? (
            <PlacePassport place={activePlace} onOpenKit={selectKit} />
          ) : (
            <KitPassport entry={activeKit} onOpen={selectKit} />
          )}
        </div>
      </div>

      <Matrix />
      {exportMode && exportSelection.selected.length > 0 ? <div className="h-20" aria-hidden /> : null}

      {exportMode ? <ExportBar selection={exportSelection} /> : null}
    </section>
  );
}
