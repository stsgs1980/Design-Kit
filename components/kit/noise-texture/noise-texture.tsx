import { cn } from "@/lib/utils";
import type { ReactElement } from "react";
import { useId } from "react";

/**
 * NoiseTexture — зерно (grain) на SVG-фильтре.
 *
 * Ноль JS: feTurbulence генерирует шум прямо в браузере, feColorMatrix
 * переводит его в альфу. Это самый дешёвый способ добавить «плёнку» —
 * дешевле canvas и несравнимо дешевле шейдера.
 *
 * Зачем в дизайн-системе: зерно убирает «пластиковость» больших градиентов
 * (banding) и делает тёмную тему бархатной, а не плоской.
 *
 * Замер (DPR 2, градиент 300×180): baseFrequency 0.3 — крупная «плёнка»,
 * 0.5–0.7 — мелкое зерно, ≥0.9 — на экране уже не читается. Поэтому дефолт 0.65.
 */
export function NoiseTexture({
  baseFrequency = 0.65,
  numOctaves = 3,
  opacity = 0.35,
  className,
}: {
  baseFrequency?: number;
  numOctaves?: number;
  opacity?: number;
  className?: string;
}): ReactElement {
  const id = useId().replace(/[:]/g, "");

  return (
    <svg
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
      style={{ opacity }}
    >
      <filter id={id}>
        <feTurbulence type="fractalNoise" baseFrequency={baseFrequency} numOctaves={numOctaves} stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
        <feComponentTransfer>
          <feFuncA type="linear" slope={1} />
        </feComponentTransfer>
      </filter>
      <rect width="100%" height="100%" filter={`url(#${id})`} />
    </svg>
  );
}
