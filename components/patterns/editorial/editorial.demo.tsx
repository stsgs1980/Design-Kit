import { PatternFrame } from "@/components/patterns/_shared/pattern-frame";
import { kitStats } from "@/lib/kit/manifest";
import type { ReactElement } from "react";

/**
 * Сцена паттерна «редакционный стиль».
 *
 * Газетная сетка: шапка с номером правила, буквица, две колонки и врезка на
 * полях. Текст — факты кита, а не выдуманный лендинг.
 */
export function EditorialDemo(): ReactElement {
  return (
    <PatternFrame data-pattern="editorial" className="px-5 py-4">
      <div className="w-full">
        <div className="flex items-baseline justify-between border-b border-border pb-2 font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
          <span>правило 04</span>
          <span>22 компонента</span>
        </div>

        <div className="mt-3 [column-gap:1.75rem] md:columns-2">
          <p className="text-[13px] leading-[1.55] text-pretty first-letter:float-left first-letter:mt-1 first-letter:mr-1.5 first-letter:text-[34px] first-letter:leading-[0.78] first-letter:font-medium">
            {kitStats().total} компонента, {kitStats().noJs} из них без JavaScript. Анимация идёт на CSS, если задача
            решается композитором, и только потом появляется скрипт.
          </p>
          <p className="mt-2 text-[13px] leading-[1.55] text-muted-foreground">
            Тексту нужна мера строки, а не ширина контейнера: шестьдесят с лишним символов — предел, дальше глаз
            возвращается на строку выше и теряет место.
          </p>
        </div>

        <p className="mt-3 border-t border-border pt-2 font-mono text-[10px] text-muted-foreground">
          врезка: буквица одна на страницу, линия только между смыслами
        </p>
      </div>
    </PatternFrame>
  );
}
