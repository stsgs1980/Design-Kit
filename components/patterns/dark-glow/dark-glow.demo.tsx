import { BorderBeam } from "@/components/kit/border-beam/border-beam";
import { NoiseTexture } from "@/components/kit/noise-texture/noise-texture";
import { PatternFrame } from "@/components/patterns/_shared/pattern-frame";
import type { ReactElement } from "react";

/**
 * Сцена паттерна «тёмное свечение».
 *
 * Ореол — размытый слой за карточкой, а не тень: тень не даёт цвета. Свет
 * приходит сверху-слева, рамка горит вместе с ним.
 */
export function DarkGlowDemo(): ReactElement {
  return (
    <PatternFrame data-pattern="glow" tone="dark" className="p-0">
      <div className="relative flex h-full w-full items-center justify-center">
        <NoiseTexture opacity={0.18} />
        <div
          aria-hidden
          className="absolute h-32 w-72 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgb(44 213 255 / 0.75), transparent 68%)" }}
        />
        <div
          aria-hidden
          className="absolute mt-16 h-20 w-40 rounded-full blur-2xl"
          style={{ background: "radial-gradient(circle, rgb(44 48 255 / 0.6), transparent 70%)" }}
        />

        <BorderBeam
          mode="shine"
          style={{ backgroundColor: "rgb(11 15 22 / 0.92)" }}
          className="relative flex w-64 flex-col gap-1 border-white/10 p-4 backdrop-blur-sm"
        >
          <span className="font-mono text-[10px] tracking-[0.16em] text-white/50 uppercase">тёмное свечение</span>
          <span className="text-sm font-medium text-white">Один источник света</span>
          <span className="font-mono text-[10px] text-white/45">фон #0a0d14 · контраст 7:1</span>
        </BorderBeam>
      </div>
    </PatternFrame>
  );
}
