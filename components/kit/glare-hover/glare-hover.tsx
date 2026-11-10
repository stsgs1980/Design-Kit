import { cn } from "@/lib/utils";
import type { ReactElement, ReactNode } from "react";

/** Пропсы блика при наведении. */
export type GlareHoverProps = {
  /** Угол наклона блика в градусах. */
  angle?: number;
  /** Длительность прохода в миллисекундах. */
  duration?: number;
  /**
   * Блик проходит сам по кругу, без курсора. Нужен в плитках каталога, где
   * иначе карточка выглядит пустой: hover там никто не наводит.
   */
  auto?: boolean;
  className?: string;
  children: ReactNode;
};

/**
 * Блик, который проходит по карточке при наведении.
 *
 * Ноль JS: псевдоэлемент с линейным градиентом уезжает transform-ом.
 * На touch-устройствах блика нет — там нет и hover.
 */
export function GlareHover({
  angle = 120,
  duration = 700,
  auto = false,
  className,
  children,
}: GlareHoverProps): ReactElement {
  return (
    <div
      className={cn(
        "kit-glare relative overflow-hidden rounded-xl border border-border bg-card",
        auto && "kit-glare-auto",
        className,
      )}
      style={
        {
          "--glare-angle": `${angle}deg`,
          "--glare-duration": `${duration}ms`,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}
