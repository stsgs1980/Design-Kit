import { GradientText } from "@/components/gradient-text";
import { ExportWallButton } from "@/components/guide/export-wall-button";
import { KitCard } from "@/components/kit/_shared/kit-card";
import { KitFilters } from "@/components/kit/_shared/kit-filters";
import { CrumbNav } from "@/components/nav/crumb-nav";
import { SiteHeader } from "@/components/nav/site-header";
import {
  kitCategories,
  kitCategoryLabels,
  kitEntries,
  kitStats,
  kitSurfaces,
  kitTechs,
  type KitCategory,
  type KitTech,
} from "@/lib/kit/manifest";
import type { Metadata } from "next";
import Link from "next/link";
import type { ReactElement } from "react";

export const metadata: Metadata = {
  title: "Кит — состав и цена компонентов",
  description: "Компоненты Design Kit: живое демо, цена в килобайтах, поверхности и правила сочетания.",
};

type KitPageProps = {
  searchParams: Promise<{ cat?: string; tech?: string; surface?: string }>;
};

/** Индекс кита: фильтры в URL, поэтому страница остаётся серверной и без клиентского JS. */
export default async function KitPage({ searchParams }: KitPageProps): Promise<ReactElement> {
  const { cat, tech, surface } = await searchParams;
  const stats = kitStats();

  const entries = kitEntries.filter((entry) => {
    const byCategory = !cat || entry.category === (cat as KitCategory);
    const byTech = !tech || entry.tech === (tech as KitTech);
    const bySurface = !surface || entry.surfaces.includes(surface);

    return byCategory && byTech && bySurface;
  });

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="mx-auto w-full max-w-[1400px] px-6 pt-10 pb-24">
        <header>
          <CrumbNav
            back={{ href: "/#catalog", label: "в каталог" }}
            items={[{ href: "/patterns", label: "стена паттернов" }]}
            current="стена кита"
          />
          <p className="mt-6 font-mono text-xs text-muted-foreground">kit · phase 1</p>
          <h1 className="mt-2 text-4xl font-medium tracking-tighter text-balance md:text-5xl">
            Кит: <GradientText>что мы берём и сколько это стоит</GradientText>
          </h1>
          <p className="mt-4 max-w-[56ch] leading-relaxed text-pretty text-muted-foreground">
            {stats.total} компонентов из одного дизайн-языка. У каждого — живое демо, честная цена в килобайтах и список
            поверхностей, где он уместен. Фильтры работают через URL, поэтому страница не тянет ни одного килобайта
            клиентского кода.
          </p>
          <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 font-mono text-xs text-muted-foreground">
            <div>
              <dt className="text-[10px] uppercase">записей</dt>
              <dd className="text-base text-foreground">{stats.total}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase">техник</dt>
              <dd className="text-base text-foreground">{Object.keys(stats.byTech).length}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase">поверхностей</dt>
              <dd className="text-base text-foreground">{stats.surfaces}</dd>
            </div>
          </dl>
        </header>

        <KitFilters
          categories={kitCategories}
          techs={kitTechs()}
          surfaces={kitSurfaces()}
          active={{ cat, tech, surface }}
        />

        <div className="mt-6 flex flex-wrap items-center gap-3 font-mono text-[11px] text-muted-foreground">
          <span>
            показано {entries.length} из {kitEntries.length}
            {cat ? ` · категория: ${kitCategoryLabels[cat as KitCategory] ?? cat}` : ""}
          </span>
          <ExportWallButton kitIds={entries.map((entry) => entry.id)} label="Выгрузить стену в MD" />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {entries.map((entry) => (
            <KitCard key={entry.id} entry={entry} />
          ))}
        </div>

        <p className="mt-10 border-t border-border pt-4 font-mono text-[11px]">
          <Link href="/#catalog" className="text-primary-text underline-offset-4 transition-colors hover:underline">
            {"<-"} в каталог на вкладку «кит»
          </Link>
        </p>

        {entries.length === 0 ? (
          <p className="mt-10 rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
            Под этот набор фильтров компонентов нет.{" "}
            <Link href="/kit" className="text-foreground underline underline-offset-4">
              Сбросить
            </Link>
          </p>
        ) : null}
      </main>
    </div>
  );
}
