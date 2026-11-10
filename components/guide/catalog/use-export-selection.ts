"use client";

import { useCallback, useEffect, useState } from "react";

import { parseExportIds } from "@/lib/export/build-md";

/**
 * Выбор для выгрузки в MD: хранится в `?export=` и шарится ссылкой.
 * Hash каталога (`#c-...`) не трогаем — пишем только search.
 */
export type ExportSelection = {
  selected: string[];
  toggle: (id: string) => void;
  clear: () => void;
  has: (id: string) => boolean;
  kit: string[];
  patterns: string[];
};

const PARAM = "export";

/**
 * Читает текущий список из search.
 * @returns {string[]} id
 */
function readSearch(): string[] {
  const raw = new URLSearchParams(window.location.search).get(PARAM);
  if (!raw) return [];
  return raw
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

/**
 * Пишет список в search, сохраняя hash.
 * @param ids список id
 * @returns {void}
 */
function writeSearch(ids: string[]): void {
  const url = new URL(window.location.href);
  if (ids.length === 0) url.searchParams.delete(PARAM);
  else url.searchParams.set(PARAM, ids.join(","));
  window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
}

/**
 * Хук выбора для выгрузки.
 * @returns {ExportSelection} состояние и методы
 */
export function useExportSelection(): ExportSelection {
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    setSelected(readSearch());
    const onPop = (): void => setSelected(readSearch());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      writeSearch(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setSelected([]);
    writeSearch([]);
  }, []);

  const has = useCallback((id: string) => selected.includes(id), [selected]);

  const parsed = parseExportIds(selected);

  return { selected, toggle, clear, has, kit: parsed.kit, patterns: parsed.patterns };
}
