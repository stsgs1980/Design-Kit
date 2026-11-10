import { LightRays } from "@/components/kit/light-rays/light-rays";
import { NoiseTexture } from "@/components/kit/noise-texture/noise-texture";
import { PatternFrame } from "@/components/patterns/_shared/pattern-frame";
import type { ReactElement } from "react";

/**
 * Сцена паттерна «стекло и глина».
 *
 * Кадр разделён по зонам, а не смешан: слева цветная подложка со стеклянной
 * панелью, справа тёплая глина с мягкой тенью. Правило приёма — «две эстетики
 * не живут в одном элементе» — видно прямо в композиции.
 */
export function GlassClayDemo(): ReactElement {
  return (
    <PatternFrame data-pattern="clay" tone="dark" className="p-0">
      <div className="grid h-full w-full grid-cols-2">
        <div className="relative flex items-center justify-center overflow-hidden border-r border-white/10 p-4">
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(135deg, rgb(99 102 241 / 0.85), rgb(217 70 239 / 0.7) 55%, rgb(56 189 248 / 0.85))",
            }}
          />
          <LightRays rays={7} color="rgb(255 255 255 / 0.28)" />

          <div className="relative w-full max-w-[168px] overflow-hidden rounded-xl border border-white/30 bg-white/15 p-3 backdrop-blur-md">
            <NoiseTexture opacity={0.08} />
            <p className="relative text-[12.5px] font-medium text-white">стекло</p>
            <p className="relative mt-0.5 text-[10.5px] text-white/75">blur 12 px · кромка +15%</p>
          </div>
        </div>

        <div className="relative flex flex-col items-center justify-center gap-2.5 overflow-hidden bg-[#fff0f0] p-4">
          <NoiseTexture opacity={0.12} className="mix-blend-multiply" />
          <span
            className="relative rounded-2xl bg-gradient-to-br from-white to-rose-100 px-4 py-2 text-[12px] font-bold text-rose-700"
            style={{
              boxShadow:
                "8px 8px 20px rgb(194 154 168 / 0.35), -7px -7px 16px rgb(255 255 255 / 0.85), inset 0 2px 0 rgb(255 255 255 / 0.7)",
            }}
          >
            глина
          </span>
          <span
            className="relative rounded-2xl bg-[#ffd9dd] px-4 py-2 text-[12px] font-bold text-rose-800"
            style={{
              boxShadow:
                "6px 6px 18px rgb(194 154 168 / 0.4), -6px -6px 14px rgb(255 255 255 / 0.8), inset 0 -2px 4px rgb(194 154 168 / 0.25)",
            }}
          >
            нажатие
          </span>
          <span className="relative font-mono text-[9px] tracking-[0.14em] text-rose-900/45 uppercase">
            тень от 16 px
          </span>
        </div>
      </div>
    </PatternFrame>
  );
}
