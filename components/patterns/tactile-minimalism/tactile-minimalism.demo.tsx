import { NoiseTexture } from "@/components/kit/noise-texture/noise-texture";
import { PatternFrame } from "@/components/patterns/_shared/pattern-frame";
import type { CSSProperties, ReactElement } from "react";

/** Тёплая бумага: одна палитра на светлую и тёмную тему через light-dark(). */
const PAPER: CSSProperties = {
  background: "light-dark(#f3ece1, #16120e)",
  color: "light-dark(#2a241d, #efe6d8)",
};

/**
 * Сцена паттерна «тактильный минимализм».
 *
 * Два состояния одной кнопки: покой и нажатие. Отличаются тенью — наружу и
 * внутрь. Цвет в сцене один и только у действия.
 */
export function TactileMinimalismDemo(): ReactElement {
  return (
    <PatternFrame data-pattern="tactile" tone="warm" className="p-0">
      <div className="relative h-full w-full" style={PAPER}>
        <NoiseTexture opacity={0.14} />
        <div className="relative flex h-full flex-col justify-between p-5">
          <p className="font-mono text-[10px] tracking-[0.18em] uppercase opacity-60">тактильный минимализм</p>

          <div className="flex items-center gap-3">
            <span
              className="rounded-lg px-3 py-2 text-[13px] font-medium"
              style={{
                background: "light-dark(#fffdf8, #221c16)",
                boxShadow: "0 1px 0 rgb(0 0 0 / 0.06), 0 2px 6px rgb(0 0 0 / 0.08)",
              }}
            >
              покой
            </span>
            <span
              className="rounded-lg px-3 py-2 text-[13px] font-medium"
              style={{
                background: "light-dark(#efe7da, #1b1610)",
                boxShadow: "inset 0 2px 5px rgb(0 0 0 / 0.18)",
              }}
            >
              нажатие
            </span>
            <span
              className="rounded-lg px-3 py-2 text-[13px] font-medium text-white"
              style={{ background: "var(--gradient-secondary)", boxShadow: "0 2px 8px rgb(44 48 255 / 0.28)" }}
            >
              действие
            </span>
          </div>

          <p className="font-mono text-[10px] opacity-55">тень вместо цвета · зерно вместо белого</p>
        </div>
      </div>
    </PatternFrame>
  );
}
