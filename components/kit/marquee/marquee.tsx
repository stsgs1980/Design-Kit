import { cn } from "@/lib/utils";
import type { ReactElement, ReactNode } from "react";

/**
 * Marquee — бесконечная лента на чистом CSS.
 *
 * Ключевые детали (все три обязательны):
 *   1. трек дублируется дважды (`aria-hidden` на копии) — иначе на стыке будет «дырка»;
 *   2. анимация на translate3d(-100%), на паузу — group-hover:[animation-play-state:paused];
 *   3. длительность — через CSS-переменную `--duration`, чтобы один компонент
 *      работал и для медленных отзывов, и для быстрых логотипов;
 *   4. копий по умолчанию три, а не две: при сдвиге на одну копию лента остаётся
 *      непрерывной, если ширина копии ≥ (W − gap) / (repeat − 1). На двух копиях это
 *      требует копии не уже экрана, и на мониторах 1600+ в ленте появлялась дыра.
 *
 * Ноль JS: даже пауза при наведении — CSS.
 */
export function Marquee({
  children,
  className,
  reverse = false,
  repeat = 3,
  duration = 40,
  pauseOnHover = true,
  vertical = false,
  fade = true,
}: {
  children: ReactNode;
  className?: string;
  reverse?: boolean;
  repeat?: number;
  duration?: number;
  pauseOnHover?: boolean;
  vertical?: boolean;
  fade?: boolean;
}): ReactElement {
  const copies = Array.from({ length: repeat });

  return (
    <div
      className={cn(
        "group relative flex overflow-hidden",
        vertical ? "flex-col" : "flex-row",
        fade && (vertical ? "mask-y" : "mask-x"),
        className,
      )}
      style={
        {
          "--duration": `${duration}s`,
          "--gap": "1rem",
        } as React.CSSProperties
      }
    >
      {copies.map((_, copyIndex) => (
        <div
          key={copyIndex}
          aria-hidden={copyIndex > 0}
          className={cn(
            "flex shrink-0 justify-around gap-[var(--gap)]",
            vertical ? "flex-col" : "flex-row",
            vertical ? "animate-marquee-vertical" : "animate-marquee",
            reverse && "[animation-direction:reverse]",
            pauseOnHover && "group-hover:[animation-play-state:paused]",
          )}
        >
          {children}
        </div>
      ))}
    </div>
  );
}
