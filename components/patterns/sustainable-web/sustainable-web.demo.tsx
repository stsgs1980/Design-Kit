import { DotPattern } from "@/components/kit/dot-pattern/dot-pattern";
import { LightRays } from "@/components/kit/light-rays/light-rays";
import { PatternFrame } from "@/components/patterns/_shared/pattern-frame";
import type { ReactElement } from "react";

/**
 * Сцена паттерна «экономный фон».
 *
 * Сравнение в одном кадре: слева то, что обычно приезжает медиафайлом (файл,
 * декодер, батарея), справа — SVG и CSS без единого килобайта медиа.
 */
export function SustainableWebDemo(): ReactElement {
  return (
    <PatternFrame data-pattern="sustainable" className="gap-3 p-4">
      <div className="relative h-full flex-1 overflow-hidden rounded-lg border border-border bg-[#101319]">
        <div aria-hidden className="pattern-video absolute inset-0" />
        <div className="relative flex h-full flex-col justify-end p-3">
          <span className="font-mono text-[10px] tracking-[0.16em] text-white/60 uppercase">медиа-фон</span>
          <span className="mt-0.5 text-[12px] text-white/80">файл · декодер · батарея</span>
        </div>
      </div>

      <div className="relative h-full flex-1 overflow-hidden rounded-lg border border-border bg-[#080c12]">
        <LightRays rays={8} color="rgb(44 213 255 / 0.34)" className="inset-0" />
        <DotPattern width={18} height={18} cr={1.1} className="text-white/25" />
        <div className="relative flex h-full flex-col justify-end p-3">
          <span className="font-mono text-[10px] tracking-[0.16em] text-white/60 uppercase">SVG и CSS</span>
          <span className="mt-0.5 text-[12px] text-white/90">0 КБ медиа · ни одного запроса</span>
        </div>
      </div>
    </PatternFrame>
  );
}
