"use client";

import type { ReactElement } from "react";
import { useEffect, useState } from "react";

/** Пропсы счётчика. */
export type NumberTickerProps = {
  /** Целевое число. */
  value: number;
  /** Длительность разгона в миллисекундах. */
  duration?: number;
  /** Приписка после числа, например "+". */
  suffix?: string;
  /** Локаль форматирования: ru-RU даёт разряды через пробел. */
  locale?: string;
  className?: string;
};

/**
 * Счётчик: число доезжает до значения по easeOutCubic.
 *
 * При prefers-reduced-motion значение ставится сразу — анимация декоративная,
 * и ждать её ради числа бессмысленно.
 */
export function NumberTicker({
  value,
  duration = 1200,
  suffix = "",
  locale = "ru-RU",
  className,
}: NumberTickerProps): ReactElement {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce) {
      setShown(value);
      return;
    }

    let frame = 0;
    const start = performance.now();

    const tick = (now: number): void => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setShown(Math.round(value * eased));

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  return (
    <span className={className} style={{ fontVariantNumeric: "tabular-nums" }}>
      {new Intl.NumberFormat(locale).format(shown)}
      {suffix}
    </span>
  );
}
