"use client";

import type { ReactElement } from "react";

import { Moon, Sun } from "@/components/icons";

/**
 * Переключатель темы без единого инлайн-скрипта.
 *
 * Тема живёт в cookie `theme` (её читает серверный layout) — поэтому нужный класс
 * стоит на <html> уже в HTML-ответе: ни вспышки, ни гидрационного рассинхрона.
 * Клик пишет cookie и сразу меняет класс, чтобы не ждать перезагрузки.
 * Если cookie нет — сервер всё равно ставит тёмную тему по умолчанию.
 *
 * Иконки переключаются CSS-правилами из globals.css (.theme-sun / .theme-moon),
 * которые тоже смотрят на color-scheme, а не на состояние React.
 */
const COOKIE = "theme";
const STORAGE = "theme";
const MAX_AGE = 60 * 60 * 24 * 365;

function currentTheme(): "light" | "dark" {
  const root = document.documentElement;
  if (root.classList.contains("dark")) return "dark";
  if (root.classList.contains("light")) return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/**
 * Запомнить выбор в трёх местах: cookie — серверу, localStorage — песочнице
 * превью (там cookie не сохраняется между страницами), класс — текущему DOM.
 *
 * `color-scheme` скриптом не трогаем: он берётся из класса (CSS .light/.dark).
 * Инлайновый style на <html> перебивал бы класс и ломал гидрацию.
 * @param next выбранная тема
 */
function remember(next: "light" | "dark"): void {
  const root = document.documentElement;
  root.classList.toggle("dark", next === "dark");
  root.classList.toggle("light", next === "light");
  document.cookie = `${COOKIE}=${next}; path=/; max-age=${MAX_AGE}; samesite=lax`;

  try {
    localStorage.setItem(STORAGE, next);
  } catch {
    // приватный режим или песочница: остаётся cookie и класс
  }
}

/** Переключатель light/dark через cookie, localStorage и класс на <html>. */
export function ThemeToggle(): ReactElement {
  const toggle = (): void => {
    remember(currentTheme() === "dark" ? "light" : "dark");
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Переключить тему"
      className="relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-border text-primary-text transition-colors hover:bg-accent"
    >
      <Sun className="theme-sun size-4" />
      <Moon className="theme-moon size-4" />
    </button>
  );
}
