import { LightRays } from "@/components/kit/light-rays/light-rays";
import { NoiseTexture } from "@/components/kit/noise-texture/noise-texture";
import { ProgressiveBlur } from "@/components/kit/progressive-blur/progressive-blur";
import { PatternFrame } from "@/components/patterns/_shared/pattern-frame";
import type { ReactElement } from "react";

/**
 * Сцена паттерна «полярное сияние».
 *
 * Два пятна разного цвета и разной скорости дрейфа, пучок света сверху, зерно
 * против полос и размытие у нижнего края. Движение — только transform.
 */
export function AuroraBackgroundDemo(): ReactElement {
  return (
    <PatternFrame data-pattern="aurora" tone="dark" className="pattern-aurora">
      <LightRays rays={9} color="rgb(120 200 255 / 0.3)" className="inset-0" />

      <div aria-hidden className="pattern-aurora-blob pattern-aurora-blob-a" />
      <div aria-hidden className="pattern-aurora-blob pattern-aurora-blob-b" />
      <NoiseTexture opacity={0.22} />
      <ProgressiveBlur direction="bottom" layers={6} blur={9} className="h-16" />

      <div className="relative px-5 py-4">
        <p className="font-mono text-[10px] tracking-[0.18em] text-white/60 uppercase">полярное сияние</p>
        <p className="mt-1 max-w-[18ch] text-lg leading-tight font-medium text-white">
          Фон живёт сам, текст его не замечает
        </p>
      </div>
    </PatternFrame>
  );
}
