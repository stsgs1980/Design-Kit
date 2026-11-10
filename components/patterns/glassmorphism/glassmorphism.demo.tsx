import { LightRays } from "@/components/kit/light-rays/light-rays";
import { NoiseTexture } from "@/components/kit/noise-texture/noise-texture";
import { PatternFrame } from "@/components/patterns/_shared/pattern-frame";
import type { ReactElement } from "react";

/**
 * Сцена паттерна «стекло».
 *
 * Фон светится сам по себе — иначе размытие нечего показывать. Панель держится
 * на трёх вещах: backdrop-blur, светлая граница и зерно поверх стекла.
 */
export function GlassmorphismDemo(): ReactElement {
  return (
    <PatternFrame data-pattern="glass" tone="dark">
      <LightRays rays={7} color="rgb(44 213 255 / 0.42)" className="inset-0" />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(ellipse 60% 50% at 78% 82%, rgb(44 48 255 / 0.55), transparent 70%)",
        }}
      />

      <div className="absolute top-1/2 left-1/2 w-[68%] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-md">
        <NoiseTexture opacity={0.1} />
        <p className="relative text-sm font-medium text-white">Стекло поверх сцены</p>
        <p className="relative mt-1 font-mono text-[10px] text-white/70">размытие 12 px · граница +15%</p>
      </div>
    </PatternFrame>
  );
}
