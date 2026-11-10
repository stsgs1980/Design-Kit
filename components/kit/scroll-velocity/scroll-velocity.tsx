"use client";

import { cn } from "@/lib/utils";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";
import type { ReactElement, ReactNode } from "react";
import { useRef } from "react";

/** Пропсы ленты, ускоряющейся от прокрутки. */
export type ScrollVelocityProps = {
  children: ReactNode;
  /** Базовая скорость в процентах за секунду: знак задаёт направление. */
  baseVelocity?: number;
  /** Класс для строки: высота, размер шрифта, отступы. */
  className?: string;
};

/** Зацикливает значение в диапазоне: лента не «убегает» за границу. */
function wrap(min: number, max: number, value: number): number {
  const range = max - min;

  return ((((value - min) % range) + range) % range) + min;
}

/**
 * ScrollVelocity — лента, скорость которой задаёт прокрутка страницы.
 *
 * Смысл приёма: движение реагирует на действие человека, а не живёт само.
 * Крутишь вниз — лента едет вперёд, крутишь вверх — разворачивается. Скорость
 * сглажена пружиной, поэтому рывки колеса не превращаются в рывки ленты.
 *
 * При `prefers-reduced-motion` лента стоит на месте: движение здесь декоративное.
 */
export function ScrollVelocity({ children, baseVelocity = 100, className }: ScrollVelocityProps): ReactElement {
  const reduced = useReducedMotion();
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smooth = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  const factor = useTransform(smooth, [0, 1000], [0, 4], { clamp: false });
  const x = useTransform(baseX, (value) => `${wrap(-20, -45, value)}%`);
  const direction = useRef(1);

  useAnimationFrame((_, delta) => {
    if (reduced) return;

    let moveBy = direction.current * baseVelocity * (delta / 1000);
    const raw = factor.get();

    if (raw < 0) direction.current = -1;
    else if (raw > 0) direction.current = 1;

    moveBy += direction.current * moveBy * Math.abs(raw);
    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <motion.div className="flex flex-nowrap whitespace-nowrap" style={{ x }}>
        {[0, 1, 2, 3].map((copy) => (
          <span key={copy} className="flex shrink-0 items-center" aria-hidden={copy > 0}>
            {children}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
