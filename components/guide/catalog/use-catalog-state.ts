"use client";

import { getPlace, PLACES, type Place } from "@/components/guide/catalog/places";
import { getKitEntry, kitEntries, type KitEntry } from "@/lib/kit/manifest";
import { getPatternEntry, patternEntries, type PatternEntry } from "@/lib/patterns/manifest";
import { useCallback, useEffect, useRef, useState } from "react";

/** Вкладка каталога: компонент кита или приём уровня страницы. */
export type CatalogTab = "kit" | "patterns";

/** Вид вкладки кита: по компонентам или обратным разворотом по местам страницы. */
export type CatalogView = "components" | "places";

/** Состояние каталога: что открыто и как это переключить. */
export type CatalogState = {
  tab: CatalogTab;
  view: CatalogView;
  activeKit: KitEntry;
  activePattern: PatternEntry;
  activePlace: Place;
  sectionRef: React.RefObject<HTMLElement | null>;
  selectTab: (tab: CatalogTab) => void;
  selectView: (view: CatalogView) => void;
  selectKit: (id: string) => void;
  selectPattern: (id: string) => void;
  selectPlace: (id: string) => void;
};

/** Hash каждого состояния: по нему вкладку и вид можно открыть ссылкой. */
const TAB_HASH: Record<CatalogTab, string> = { kit: "#catalog", patterns: "#patterns" };

/**
 * Разбирает адресный hash в состояние каталога.
 *
 * `#c-<id>` открывает паспорт: id ищется сначала среди компонентов кита, потом
 * среди паттернов. `#where` открывает вид «по месту», `#p-<место>` — конкретное
 * место. Паспорта живут на одной странице, поэтому адрес у них общий.
 */
function resolveHash(hash: string): { tab: CatalogTab; view?: CatalogView; id?: string; place?: string } | null {
  if (hash === TAB_HASH.kit) return { tab: "kit", view: "components" };
  if (hash === TAB_HASH.patterns) return { tab: "patterns" };
  if (hash === "#where") return { tab: "kit", view: "places" };
  if (hash.startsWith("#p-") && getPlace(hash.slice(3))) return { tab: "kit", view: "places", place: hash.slice(3) };
  if (!hash.startsWith("#c-")) return null;

  const id = hash.slice(3);
  if (getKitEntry(id)) return { tab: "kit", view: "components", id };
  if (getPatternEntry(id)) return { tab: "patterns", id };

  return null;
}

/**
 * Держит вкладку, вид и выбранную запись каталога.
 *
 * Состояний три, потому что правила у них разные: вкладка меняет набор в
 * сайдбаре, вид переключает разворот (по компонентам / по местам), выбор меняет
 * только паспорт. Адрес страницы повторяет состояние: ссылку можно послать.
 */
export function useCatalogState(): CatalogState {
  const [tab, setTab] = useState<CatalogTab>("kit");
  const [view, setView] = useState<CatalogView>("components");
  const [kitId, setKitId] = useState(kitEntries[0]?.id ?? "");
  const [patternId, setPatternId] = useState(patternEntries[0]?.id ?? "");
  const [placeId, setPlaceId] = useState(PLACES[0]?.id ?? "hero");
  const sectionRef = useRef<HTMLElement>(null);

  const applyHash = useCallback((scroll: boolean) => {
    const next = resolveHash(window.location.hash);
    if (!next) return;

    setTab(next.tab);
    if (next.view) setView(next.view);
    if (next.place) setPlaceId(next.place);
    if (next.id) {
      if (next.tab === "kit") setKitId(next.id);
      else setPatternId(next.id);
    }
    if (scroll) sectionRef.current?.scrollIntoView({ block: "start" });
  }, []);

  useEffect(() => {
    applyHash(true);
    const onHash = (): void => applyHash(true);
    window.addEventListener("hashchange", onHash);

    return () => window.removeEventListener("hashchange", onHash);
  }, [applyHash]);

  const pushHash = useCallback((hash: string) => {
    const url = new URL(window.location.href);
    url.hash = hash;
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }, []);

  const selectTab = useCallback(
    (next: CatalogTab) => {
      setTab(next);
      pushHash(TAB_HASH[next]);
    },
    [pushHash],
  );

  const selectView = useCallback(
    (next: CatalogView) => {
      setView(next);
      pushHash(next === "places" ? "#where" : TAB_HASH.kit);
    },
    [pushHash],
  );

  const selectKit = useCallback(
    (id: string) => {
      setTab("kit");
      setView("components");
      setKitId(id);
      pushHash(`#c-${id}`);
    },
    [pushHash],
  );

  const selectPattern = useCallback(
    (id: string) => {
      setTab("patterns");
      setPatternId(id);
      pushHash(`#c-${id}`);
    },
    [pushHash],
  );

  const selectPlace = useCallback(
    (id: string) => {
      setTab("kit");
      setView("places");
      setPlaceId(id);
      pushHash(`#p-${id}`);
    },
    [pushHash],
  );

  return {
    tab,
    view,
    activeKit: getKitEntry(kitId) ?? kitEntries[0],
    activePattern: getPatternEntry(patternId) ?? patternEntries[0],
    activePlace: getPlace(placeId) ?? PLACES[0],
    sectionRef,
    selectTab,
    selectView,
    selectKit,
    selectPattern,
    selectPlace,
  };
}
