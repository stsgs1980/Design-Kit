import { NumberTicker } from "@/components/kit/number-ticker/number-ticker";
import { StripedPattern } from "@/components/kit/striped-pattern/striped-pattern";
import { TextHighlighter } from "@/components/kit/text-highlighter/text-highlighter";
import { PatternFrame } from "@/components/patterns/_shared/pattern-frame";
import type { ReactElement } from "react";

/**
 * Сцена паттерна «нео-брутализм».
 *
 * Рамка 3 px, тень без размытия, плоская палитра. Нажатие «вдавливает» блок:
 * тень снимается, сдвиг равен её величине — это и есть главное правило приёма.
 */
export function NeoBrutalismDemo(): ReactElement {
  return (
    <PatternFrame data-pattern="brutal" tone="warm" align="center" className="justify-center p-4">
      <div className="relative h-full w-full" style={{ background: "light-dark(#fde68a, #2a1f07)" }}>
        <StripedPattern width={12} height={12} className="text-black/10" />

        <div className="relative flex h-full items-center justify-center p-4">
          <div className="pattern-brutal w-full max-w-[280px] rounded-lg border-[3px] border-black bg-[#bef264] p-3 shadow-[6px_6px_0_#000]">
            <p className="text-[15px] leading-tight font-extrabold tracking-tight text-black">
              Рамка, тень, <TextHighlighter color="rgb(232 121 249 / 0.85)">ноль</TextHighlighter> размытия
            </p>

            <div className="mt-2 flex items-center gap-2">
              <span className="pattern-brutal rounded border-2 border-black bg-[#e879f9] px-2.5 py-1 text-[11px] font-bold text-black shadow-[3px_3px_0_#000]">
                основная
              </span>
              <span className="pattern-brutal rounded border-2 border-black bg-white px-2.5 py-1 text-[11px] font-bold text-black shadow-[3px_3px_0_#000]">
                вторая
              </span>
              <span className="ml-auto text-[15px] leading-none font-extrabold text-black">
                <NumberTicker value={3} />
                <span className="ml-1 font-mono text-[9px] font-bold tracking-[0.1em] uppercase">px</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </PatternFrame>
  );
}
