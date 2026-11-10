import { cn } from "@/lib/utils";
import type { ReactElement } from "react";

/** Пропсы живой сетки. */
export type AnimatedGridPatternProps = {
  /** Шаг сетки в пикселях. */
  cell?: number;
  /** Сколько ячеек подсвечивается за цикл. */
  squares?: number;
  /** Длительность полного цикла в миллисекундах. */
  duration?: number;
  className?: string;
};

/**
 * Живая сетка: линии рисуются градиентами, подсвеченные ячейки — обычные div
 * с отрицательной задержкой анимации.
 *
 * Ноль JS: всё делает CSS, поэтому компонент остаётся серверным.
 * Шаг задаётся через переменную --kit-cell, одна и та же величина управляет
 * линиями и позициями ячеек — рассинхрона не бывает.
 */
export function AnimatedGridPattern({
  cell = 28,
  squares = 14,
  duration = 6000,
  className,
}: AnimatedGridPatternProps): ReactElement {
  const cells = Array.from({ length: squares }, (_, index) => index);

  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      style={
        {
          "--kit-cell": `${cell}px`,
          "--kit-duration": `${duration}ms`,
          backgroundImage:
            "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
          backgroundSize: "var(--kit-cell) var(--kit-cell)",
          opacity: 0.14,
        } as React.CSSProperties
      }
    >
      {cells.map((index) => {
        const column = (index * 7) % 13;
        const row = (index * 5) % 9;

        return (
          <span
            key={index}
            className="kit-grid-cell absolute bg-[var(--gradient-primary)]"
            style={{
              width: "calc(var(--kit-cell) - 1px)",
              height: "calc(var(--kit-cell) - 1px)",
              left: `calc(var(--kit-cell) * ${column})`,
              top: `calc(var(--kit-cell) * ${row})`,
              animationDelay: `calc(var(--kit-duration) / ${squares} * -${index})`,
            }}
          />
        );
      })}
    </div>
  );
}
