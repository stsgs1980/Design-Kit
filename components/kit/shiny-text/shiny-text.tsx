import { cn } from "@/lib/utils";
import type { ReactElement, ReactNode } from "react";

/** Пропсы бегущего блика по тексту. */
export type ShinyTextProps = {
  children: ReactNode;
  /** Длительность прохода блика в секундах. */
  duration?: number;
  /** Цвет «основы» и «света»: по умолчанию muted-foreground и foreground. */
  color?: string;
  shine?: string;
  className?: string;
};

/**
 * ShinyText — по тексту проезжает светлая полоса.
 *
 * Ноль JS: градиент лежит фоном, `background-clip: text` оставляет его только
 * в буквах, а анимация двигает `background-position`. Ни `filter`, ни `opacity`
 * не трогаем, поэтому слой остаётся на композиторе.
 */
export function ShinyText({
  children,
  duration = 4,
  color = "var(--muted-foreground)",
  shine = "var(--foreground)",
  className,
}: ShinyTextProps): ReactElement {
  return (
    <span
      className={cn("kit-shiny inline-block bg-clip-text text-transparent", className)}
      style={
        {
          "--shine-duration": `${duration}s`,
          "--shine-color": color,
          "--shine-highlight": shine,
        } as React.CSSProperties
      }
    >
      {children}
    </span>
  );
}
