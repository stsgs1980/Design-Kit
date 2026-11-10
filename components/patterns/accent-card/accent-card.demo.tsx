import { BorderBeam } from "@/components/kit/border-beam/border-beam";
import { MagicCard } from "@/components/kit/magic-card/magic-card";
import { TextHighlighter } from "@/components/kit/text-highlighter/text-highlighter";
import { PatternFrame } from "@/components/patterns/_shared/pattern-frame";
import type { ReactElement } from "react";

/**
 * Сцена набора «карточка с акцентом».
 *
 * Три слоя на одной карточке и ни одного лишнего: пятно под курсором, статичный
 * градиент по рамке и маркер на одном слове. Hover не двигает layout.
 */
export function AccentCardDemo(): ReactElement {
  return (
    <PatternFrame data-pattern="accent-card" align="center" className="justify-center p-0">
      <BorderBeam mode="shine" tone="warm" className="w-[236px] border border-border">
        <MagicCard always tone="warm" className="rounded-xl p-4">
          <p className="font-mono text-[9.5px] tracking-[0.16em] text-muted-foreground uppercase">карточка</p>
          <p className="mt-2 text-[13.5px] leading-snug font-medium">
            Акцент — это <TextHighlighter>одно</TextHighlighter> слово, а не весь заголовок
          </p>
          <p className="mt-2 text-[10.5px] leading-relaxed text-muted-foreground">
            пятно 240 px · рамка-градиент · маркер
          </p>
        </MagicCard>
      </BorderBeam>
    </PatternFrame>
  );
}
