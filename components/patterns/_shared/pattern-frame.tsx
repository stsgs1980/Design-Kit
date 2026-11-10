import { cn } from "@/lib/utils";
import type { ReactElement, ReactNode } from "react";

/** Пропсы рамки сцены паттерна. */
export type PatternFrameProps = {
  children: ReactNode;
  className?: string;
  /** Метка сцены для сквозных проверок: попадает в `data-pattern`. */
  "data-pattern"?: string;
  /** Тон подложки: тёмный для светящихся приёмов, тёплый для тактильного. */
  tone?: "default" | "dark" | "warm";
  /**
   * Выравнивание содержимого по вертикали. Отдельный проп, а не класс в
   * `className`: `cn` не сливает конфликтующие утилиты, и `items-center` в
   * демо проигрывал базовому `items-start` — сцена молча уезжала вверх.
   */
  align?: "start" | "center";
};

const TONE: Record<NonNullable<PatternFrameProps["tone"]>, string> = {
  default: "bg-background",
  dark: "bg-[#0a0d14]",
  warm: "bg-[#f3ece1]",
};

/**
 * Рамка сцены паттерна: та же сетка, что у кита, но выше и без центрирования.
 *
 * Паттерн — композиция, а не элемент: сцене нужна высота под заголовок и текст,
 * поэтому содержимое выравнивается по верху, а не по центру.
 */
export function PatternFrame({
  children,
  className,
  "data-pattern": pattern,
  tone = "default",
  align = "start",
}: PatternFrameProps): ReactElement {
  return (
    <div
      data-pattern={pattern}
      className={cn(
        "relative flex h-60 w-full overflow-hidden rounded-xl border border-border",
        align === "center" ? "items-center" : "items-start",
        TONE[tone],
        className,
      )}
    >
      {children}
    </div>
  );
}
