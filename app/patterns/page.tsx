import { GradientText } from "@/components/gradient-text";
import { ExportWallButton } from "@/components/guide/export-wall-button";
import { CrumbNav } from "@/components/nav/crumb-nav";
import { SiteHeader } from "@/components/nav/site-header";
import { PatternDemo } from "@/components/patterns/_shared/pattern-demo";
import { kitStats } from "@/lib/kit/manifest";
import {
  patternCategories,
  patternCategoryLabels,
  patternEntries,
  patternStats,
  patternVerdictLabels,
  patternVerdicts,
  patternYears,
  type PatternCategory,
  type PatternVerdict,
} from "@/lib/patterns/manifest";
import type { Metadata } from "next";
import Link from "next/link";
import type { ReactElement } from "react";

export const metadata: Metadata = {
  title: "Паттерны — приёмы и из чего они собраны",
  description: "Восемь приёмов уровня страницы: живой пример, правила, грабли и состав из компонентов кита.",
};

type PatternsPageProps = {
  searchParams: Promise<{ cat?: string; verdict?: string }>;
};

/** Индекс паттернов: фильтры живут в URL, поэтому страница остаётся серверной. */
export default async function PatternsPage({ searchParams }: PatternsPageProps): Promise<ReactElement> {
  const { cat, verdict } = await searchParams;
  const stats = patternStats();

  const entries = patternEntries.filter((entry) => {
    const byCategory = !cat || entry.category === (cat as PatternCategory);
    const byVerdict = !verdict || entry.verdict === (verdict as PatternVerdict);

    return byCategory && byVerdict;
  });

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="mx-auto w-full max-w-[1400px] px-6 pt-10 pb-24">
        <header>
          <CrumbNav
            back={{ href: "/#patterns", label: "в каталог" }}
            items={[{ href: "/kit", label: "стена кита" }]}
            current="стена паттернов"
          />

          <p className="mt-6 font-mono text-xs text-muted-foreground">patterns · шаг 2</p>
          <h1 className="mt-2 text-4xl font-medium tracking-tighter text-balance md:text-5xl">
            Паттерны: <GradientText>приёмы поверх компонентов</GradientText>
          </h1>
          <p className="mt-4 max-w-[56ch] leading-relaxed text-pretty text-muted-foreground">
            Компонент отвечает на вопрос «как это сделано», паттерн — «когда это брать». У каждого приёма: живой пример,
            состав из компонентов кита, правила и грабли. Тяжёлых зависимостей нет: всё собрано из тех же{" "}
            {kitStats().total}.
          </p>

          <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 font-mono text-xs text-muted-foreground">
            <div>
              <dt className="text-[10px] uppercase">паттернов</dt>
              <dd className="text-base text-foreground">{stats.total}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase">на подъёме</dt>
              <dd className="text-base text-foreground">{stats.rising}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase">компонентов занято</dt>
              <dd className="text-base text-foreground">{stats.components}</dd>
            </div>
          </dl>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[10px]">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="mr-1 tracking-[0.16em] text-muted-foreground uppercase">категория</span>
              <Link
                href="/patterns"
                className={`rounded-full border px-2 py-0.5 transition-colors ${
                  cat
                    ? "border-border text-muted-foreground hover:text-foreground"
                    : "border-foreground/30 text-foreground"
                }`}
              >
                все
              </Link>
              {patternCategories
                .filter((category) => patternEntries.some((entry) => entry.category === category))
                .map((category) => (
                  <Link
                    key={category}
                    href={`/patterns?${new URLSearchParams({ ...(cat === category ? {} : { cat: category }), ...(verdict ? { verdict } : {}) }).toString()}`}
                    className={`rounded-full border px-2 py-0.5 transition-colors ${
                      cat === category
                        ? "border-foreground/30 text-foreground"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {patternCategoryLabels[category]}
                  </Link>
                ))}
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="mr-1 tracking-[0.16em] text-muted-foreground uppercase">вердикт</span>
              {patternVerdicts().map((item) => (
                <Link
                  key={item}
                  href={`/patterns?${new URLSearchParams({ ...(cat ? { cat } : {}), ...(verdict === item ? {} : { verdict: item }) }).toString()}`}
                  className={`rounded-full border px-2 py-0.5 transition-colors ${
                    verdict === item
                      ? "border-foreground/30 text-foreground"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {patternVerdictLabels[item]}
                </Link>
              ))}
            </div>

            <span className="text-muted-foreground">
              показано {entries.length} из {stats.total}
            </span>
            <ExportWallButton patternIds={entries.map((entry) => entry.id)} label="Выгрузить стену в MD" />
          </div>
        </header>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {entries.map((entry) => (
            <Link
              key={entry.id}
              href={`/patterns/${entry.id}`}
              className="group flex min-w-0 flex-col gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:border-foreground/25"
            >
              <div className="min-w-0 overflow-hidden rounded-lg">
                <PatternDemo id={entry.id} compact />
              </div>

              <div className="flex items-baseline justify-between gap-3 px-1">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{entry.name}</p>
                  <p className="truncate font-mono text-[11px] text-muted-foreground">{entry.latin}</p>
                </div>
                <span className="shrink-0 rounded-full border border-border px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                  {patternYears(entry)}
                </span>
              </div>

              <p className="line-clamp-2 px-1 text-xs leading-relaxed text-muted-foreground">{entry.summary}</p>

              <p className="flex items-center gap-2 px-1 font-mono text-[10px] text-muted-foreground">
                <span>{patternCategoryLabels[entry.category]}</span>
                <span aria-hidden>/</span>
                <span>{patternVerdictLabels[entry.verdict]}</span>
                <span aria-hidden>/</span>
                <span>состав: {entry.composition.length}</span>
              </p>
            </Link>
          ))}
        </div>

        <p className="mt-10 border-t border-border pt-4 font-mono text-[11px]">
          <Link href="/#patterns" className="text-primary-text underline-offset-4 transition-colors hover:underline">
            {"<-"} в каталог на вкладку «паттерны»
          </Link>
        </p>

        {entries.length === 0 ? (
          <p className="mt-10 text-sm text-muted-foreground">
            Под этот фильтр ничего не подошло.{" "}
            <Link href="/patterns" className="text-foreground underline underline-offset-4">
              Сбросить
            </Link>
          </p>
        ) : null}
      </main>
    </div>
  );
}
