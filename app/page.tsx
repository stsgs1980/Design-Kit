import { Catalog } from "@/components/guide/catalog/catalog";
import { CompositionRules } from "@/components/guide/composition-rules";
import { Hero } from "@/components/guide/hero";
import { SiteHeader } from "@/components/nav/site-header";
import { kitEntries } from "@/lib/kit/manifest";
import type { ReactElement } from "react";

const FREE_JS = kitEntries.filter((entry) => entry.cost.js === "0").length;

/**
 * Справочник по киту.
 *
 * Порядок: стартовый экран с картой → каталог (вкладки «кит / паттерны», вид
 * «по компонентам / по месту», паспорт выбранной записи, сводка цен) → правила.
 * «Что куда» больше не отдельная секция: место — это поле манифеста, поэтому
 * оно живёт видом каталога. Шапка общая для всех страниц — `SiteHeader`.
 */
export default function Page(): ReactElement {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main>
        <Hero />
        <div className="border-b border-border">
          <Catalog />
        </div>
        <CompositionRules />
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col items-start justify-between gap-3 px-6 py-8 text-sm text-muted-foreground md:flex-row md:items-center">
          <p>
            {kitEntries.length} компонентов кита · {FREE_JS} без JS · ноль новых зависимостей
          </p>
          <p className="font-mono text-xs">Next 16 · React 19 · Tailwind 4 · framer-motion + один ленивый WebGL-чанк</p>
        </div>
      </footer>
    </div>
  );
}
