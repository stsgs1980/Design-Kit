import { DotPattern } from "@/components/kit/dot-pattern/dot-pattern";
import { NumberTicker } from "@/components/kit/number-ticker/number-ticker";
import { TextHighlighter } from "@/components/kit/text-highlighter/text-highlighter";
import { PatternFrame } from "@/components/patterns/_shared/pattern-frame";
import type { ReactElement } from "react";

/**
 * Сцена паттерна «умный минимализм».
 *
 * Воздух, волосяные линии, одна цифра и один акцент. Подложка на точках почти
 * невидима — исключительно чтобы фон не был плоским, как и требует приём.
 */
export function CleanDesign2Demo(): ReactElement {
  return (
    <PatternFrame data-pattern="clean" className="p-0">
      <DotPattern
        width={26}
        height={26}
        cr={0.8}
        className="[mask-image:radial-gradient(70%_90%_at_85%_10%,black,transparent_72%)] text-foreground/25"
      />

      <div className="relative flex h-full w-full flex-col justify-between p-5">
        <div>
          <nav className="flex items-center gap-4 border-b border-border pb-2 font-mono text-[9.5px] tracking-[0.14em] text-muted-foreground uppercase">
            <span className="text-foreground">обзор</span>
            <span>тарифы</span>
            <span>доки</span>
            <span className="ml-auto rounded-full border border-border px-2 py-0.5">по запросу</span>
          </nav>

          <p className="mt-4 text-[22px] leading-[1.1] font-medium tracking-[-0.03em] text-balance">
            Строгость без <TextHighlighter>пустоты</TextHighlighter>
          </p>
          <p className="mt-1.5 max-w-[34ch] text-[11.5px] leading-relaxed text-muted-foreground">
            Один акцент, остальное — нейтралы. Второстепенное скрыто, но не удалено.
          </p>
        </div>

        <div className="flex items-end justify-between border-t border-border pt-2">
          <div>
            <p className="font-mono text-[9px] tracking-[0.14em] text-muted-foreground uppercase">акцентов</p>
            <p className="text-lg leading-none font-medium">
              <NumberTicker value={1} />
            </p>
          </div>
          <p className="font-mono text-[9px] tracking-[0.14em] text-muted-foreground uppercase">переходы 200–300 мс</p>
        </div>
      </div>
    </PatternFrame>
  );
}
