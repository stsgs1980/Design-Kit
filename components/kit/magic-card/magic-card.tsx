"use client";

import { cn } from "@/lib/utils";
import type { PointerEvent, ReactElement, ReactNode } from "react";
import { useRef } from "react";

/** Пропсы карточки с прожектором. */
export type MagicCardProps = {
  /** Тон пятна: cold — primary, warm — оранжевый. */
  tone?: "cold" | "warm";
  /** Цвет пятна: по умолчанию первый акцент палитры. */
  gradient?: string;
  /** Радиус пятна в пикселях. */
  radius?: number;
  /** Стартовая позиция пятна: `--mx` / `--my`, чтобы карточка не была пустой до наведения. */
  style?: React.CSSProperties;
  /**
   * Пятно видно всегда, а не только под курсором. Нужно в плитке каталога: без
   * наведения сцена неотличима от обычной карточки с рамкой.
   */
  always?: boolean;
  className?: string;
  children: ReactNode;
};

/**
 * Карточка, которая подсвечивает область под курсором.
 *
 * Координаты пишутся в CSS-переменные --mx/--my прямо на элементе: React
 * не перерисовывается, поэтому пятно не дёргается на каждом кадре.
 *
 * Слоёв два, как в референсе Cruip: `::before` подсвечивает рамку (тонкое
 * кольцо по маске), `::after` — само пятно над контентом. Карточка в сетке
 * может получать координаты от `MagicCardGroup`: тогда рамки соседей тоже
 * загораются.
 */
export function MagicCard({
  tone = "cold",
  gradient = tone === "warm" ? "var(--warm)" : "var(--gradient-primary)",
  radius = 240,
  style,
  always = false,
  className,
  children,
}: MagicCardProps): ReactElement {
  const ref = useRef<HTMLDivElement>(null);

  const onPointerMove = (event: PointerEvent<HTMLDivElement>): void => {
    const node = ref.current;

    if (!node || event.pointerType === "touch") {
      return;
    }

    const rect = node.getBoundingClientRect();
    node.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    node.style.setProperty("--my", `${event.clientY - rect.top}px`);
  };

  return (
    <div
      ref={ref}
      data-magic=""
      data-magic-always={always ? "" : undefined}
      onPointerMove={onPointerMove}
      className={cn(
        "kit-magic relative overflow-hidden rounded-xl border border-border bg-card",
        always && "kit-magic-always",
        "transition-colors duration-200 hover:border-border/80",
        className,
      )}
      style={
        {
          "--kit-spot": gradient,
          "--kit-radius": `${radius}px`,
          ...style,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}
