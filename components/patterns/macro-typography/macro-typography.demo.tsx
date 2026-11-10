import { TextHighlighter } from "@/components/kit/text-highlighter/text-highlighter";
import { PatternFrame } from "@/components/patterns/_shared/pattern-frame";
import type { ReactElement } from "react";

/**
 * Сцена паттерна «макро-типографика».
 *
 * Показывает сам приём и его цифры: кегль, ведущая и трекинг подписаны теми
 * значениями, которые реально применены в разметке сцены, а не «примерно».
 */
export function MacroTypographyDemo(): ReactElement {
  return (
    <PatternFrame data-pattern="macro" className="px-5 py-4">
      <div className="w-full">
        <p className="flex items-center justify-between font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
          <span>макро-типографика</span>
          <span>2024</span>
        </p>

        <p className="mt-3 text-[34px] leading-[0.88] font-medium tracking-[-0.045em] text-balance">
          Кит держит{" "}
          <span className="whitespace-nowrap">
            <TextHighlighter>страницу</TextHighlighter>,
          </span>{" "}
          а не наоборот
        </p>

        <dl className="mt-4 flex gap-5 border-t border-border pt-2 font-mono text-[10px]">
          <div>
            <dt className="tracking-[0.14em] text-muted-foreground uppercase">кегль</dt>
            <dd className="text-foreground">34 px</dd>
          </div>
          <div>
            <dt className="tracking-[0.14em] text-muted-foreground uppercase">ведущая</dt>
            <dd className="text-foreground">0.86</dd>
          </div>
          <div>
            <dt className="tracking-[0.14em] text-muted-foreground uppercase">трекинг</dt>
            <dd className="text-foreground">-0.045em</dd>
          </div>
          <div>
            <dt className="tracking-[0.14em] text-muted-foreground uppercase">акцент</dt>
            <dd className="text-foreground">1 на экран</dd>
          </div>
        </dl>
      </div>
    </PatternFrame>
  );
}
