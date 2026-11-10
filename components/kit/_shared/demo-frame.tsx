import { cn } from "@/lib/utils";
import type { ReactElement, ReactNode } from "react";

/** Пропсы рамки демо-сцены. */
export type DemoFrameProps = {
  children: ReactNode;
  /** Дополнительные классы: например, повышенная высота для больших сцен. */
  className?: string;
  /** Метка сцены для сквозных проверок: попадает в `data-scene`. */
  "data-scene"?: string;
  /**
   * Тон подложки. Тёмный нужен сценам, которые сами светятся (лучи, матрица
   * символов, дизеринг): класс `bg-[#…]` в className конфликтовал с
   * `bg-background` и проигрывал каскаду, поэтому тон задаётся пропом.
   */
  tone?: "default" | "dark";
};

/**
 * Рамка демо-сцены: одна высота, один фон, одна сетка отступов.
 *
 * Нужна, чтобы сцены в индексе кита и на странице компонента выглядели
 * одинаково и не «прыгали» при переходах. `data-scene` — единственный побочный
 * атрибут: по нему приёмочный прогон находит сцену, не привязываясь к классам.
 */
export function DemoFrame({
  children,
  className,
  "data-scene": scene,
  tone = "default",
}: DemoFrameProps): ReactElement {
  return (
    <div
      data-scene={scene}
      className={cn(
        "relative flex h-44 w-full items-center justify-center overflow-hidden rounded-lg border border-border",
        tone === "dark" ? "bg-[#080c12]" : "bg-background",
        className,
      )}
    >
      {children}
    </div>
  );
}
