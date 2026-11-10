"use client";

import type { ReactElement } from "react";

import { cn } from "@/lib/utils";

/** Пропсы лучей света. */
export type LightRaysProps = {
  /** Сколько лучей видно: шаг пучка считается от этого числа. */
  rays?: number;
  /** Цвет лучей: с альфой, иначе пучок пережигает фон. */
  color?: string;
  className?: string;
  /** Дыхание пучка: только opacity и transform, композитор не напрягается. */
  animated?: boolean;
};

/**
 * LightRays — «объёмный» пучок света из верхней точки.
 *
 * В Magic UI это WebGL-шейдер; здесь — три дешёвых CSS-слоя, которых хватает для
 * ambient-свечения в первом экране:
 *   1. полосы: repeating-conic-gradient из верхней точки, шаг считается от `rays`;
 *   2. ядро: радиальный градиент у кромки — иначе полосы висят в пустоте;
 *   3. маска: гасит лучи к низу и по краям, чтобы они не спорили с текстом.
 *
 * Пучок намеренно полосатый: сплошное пятно читается как «градиент», а не как
 * свет. Размытие blur(5px) убирает ступеньки, но оставляет лучи различимыми.
 */
export function LightRays({
  rays = 12,
  color = "rgb(44 213 255 / 0.5)",
  className,
  animated = true,
}: LightRaysProps): ReactElement {
  // период пучка: один луч на `rays` градусов, полоса занимает 40% периода.
  // Тонкая полоса (как в первоначальном варианте) на blur(5px) исчезала целиком.
  const period = 360 / Math.max(3, rays);
  const stripes = [
    "repeating-conic-gradient(from 184deg at 50% -30%",
    "transparent 0deg",
    `transparent ${(period * 0.15).toFixed(2)}deg`,
    `${color} ${(period * 0.3).toFixed(2)}deg`,
    `${color} ${(period * 0.55).toFixed(2)}deg`,
    `transparent ${(period * 0.7).toFixed(2)}deg`,
    `transparent ${period.toFixed(2)}deg)`,
  ].join(", ");

  const fade = "radial-gradient(ellipse 85% 115% at 50% -12%, black 6%, rgba(0,0,0,0.5) 50%, transparent 82%)";

  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <div
        className={cn("absolute inset-0", animated && "animate-[light-rays_9s_ease-in-out_infinite]")}
        style={{
          backgroundImage: stripes,
          maskImage: fade,
          WebkitMaskImage: fade,
          filter: "blur(4px)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(ellipse 45% 26% at 50% 0%, rgb(0 165 239 / 0.55), transparent 70%)",
          mixBlendMode: "screen",
        }}
      />
      <style>{`
        @keyframes light-rays {
          0%, 100% { opacity: 0.75; transform: scaleY(1) rotate(0deg); }
          50%      { opacity: 1;    transform: scaleY(1.04) rotate(0.6deg); }
        }
      `}</style>
    </div>
  );
}
