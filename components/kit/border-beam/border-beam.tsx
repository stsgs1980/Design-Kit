import { cn } from "@/lib/utils";
import type { ReactElement, ReactNode } from "react";

/** Пропсы блика по периметру. */
export type BorderBeamProps = {
  /**
   * Режим: "beam" — бегущий блик по кругу, "shine" — статичный градиент по рамке.
   * Два режима вместо двух компонентов: Shine Border и Border Beam — одна задача.
   */
  mode?: "beam" | "shine";
  /** Тон: cold — primary градиент, warm — оранжевый акцент для «на подъёме». */
  tone?: "cold" | "warm";
  /** Длительность оборота в миллисекундах (только для режима beam). */
  duration?: number;
  /** Начало градиента. */
  colorFrom?: string;
  /** Конец градиента. */
  colorTo?: string;
  /** Переопределение фона панели: `bg-card` в базовых классах выигрывает у класса-модификатора. */
  style?: React.CSSProperties;
  className?: string;
  children: ReactNode;
};

/**
 * Градиентная рамка толщиной в один пиксель.
 *
 * Реализация — conic-gradient, обрезанный по content-box: рамка «нарисована»
 * фоном, поэтому не влияет на layout и не требует JS.
 */
export function BorderBeam({
  mode = "beam",
  tone = "cold",
  duration = 8000,
  colorFrom = tone === "warm" ? "var(--warm)" : "var(--gradient-primary)",
  colorTo = tone === "warm" ? "var(--warm)" : "var(--gradient-secondary)",
  style,
  className,
  children,
}: BorderBeamProps): ReactElement {
  return (
    <div
      className={cn("kit-beam relative isolate rounded-xl bg-card", mode === "shine" && "kit-beam-static", className)}
      style={
        {
          "--beam-duration": `${duration}ms`,
          "--beam-from": colorFrom,
          "--beam-to": colorTo,
          ...style,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}
