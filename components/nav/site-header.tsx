"use client";

import { Logo } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";
import { kitStats } from "@/lib/kit/manifest";
import { siteConfig } from "@/lib/site";
import Link from "next/link";
import type { ReactElement } from "react";

/**
 * Разделы страницы каталога.
 *
 * Адреса абсолютные (`/#…`), потому что шапка стоит не только на главной: с
 * «стены» кита или паттернов тот же пункт обязан вернуть в каталог, а не искать
 * якорь в чужом документе.
 */
const NAV = [
  { href: "/#catalog", label: "Каталог" },
  { href: "/#where", label: "По месту" },
  { href: "/#c-hero-recipe", label: "Наборы" },
  { href: "/#matrix", label: "Цена" },
  { href: "/#rules", label: "Правила" },
];

/**
 * Шапка справочника: одна на всех страницах.
 *
 * До этого стены кита и паттернов были сиротами: у них не было ни разделов, ни
 * пути назад, кроме крошек. Навигация обязана быть одинаковой везде.
 */
export function SiteHeader(): ReactElement {
  const stats = kitStats();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-[1400px] items-center justify-between gap-4 px-6">
        <a href="/#start" className="flex items-center gap-2.5">
          <Logo className="size-7" />
          <span className="text-sm font-semibold tracking-tight">{siteConfig.name}</span>
          <span className="hidden font-mono text-[10px] tracking-wider text-muted-foreground uppercase sm:block">
            {siteConfig.tagline}
          </span>
        </a>

        <nav aria-label="Основная навигация" className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-1.5 text-[13px] text-muted-foreground transition-colors hover:bg-foreground/[0.05] hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <span className="hidden font-mono text-[11px] text-muted-foreground lg:block">
            {stats.total} · {stats.noJs} без JS
          </span>
          <Link
            href="/patterns"
            className="hidden rounded-full px-3 py-1.5 text-[13px] text-muted-foreground transition-colors hover:bg-foreground/[0.05] hover:text-foreground lg:block"
          >
            Стена паттернов
          </Link>
          <ThemeToggle />
          <a
            href="/#catalog"
            className="inline-flex h-8 items-center rounded-lg px-3 text-xs font-medium text-primary-foreground"
            style={{ backgroundColor: "var(--primary)" }}
          >
            Открыть кит
          </a>
        </div>
      </div>

      {/* Мобильная строка разделов: без неё с паспорта некуда вернуться, кроме прокрутки вверх. */}
      <nav
        aria-label="Разделы"
        className="flex [scrollbar-width:none] items-center gap-1 overflow-x-auto border-t border-border px-4 py-1.5 md:hidden"
      >
        {NAV.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="shrink-0 rounded-full px-2.5 py-1 font-mono text-[11px] whitespace-nowrap text-muted-foreground transition-colors hover:bg-foreground/[0.05] hover:text-foreground"
          >
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
