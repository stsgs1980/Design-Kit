import { cn } from "@/lib/utils";
import type { CSSProperties, ReactElement, ReactNode } from "react";

/** Пропсы орбитального спутника. */
export type OrbitingCirclesProps = {
  children: ReactNode;
  /** Радиус орбиты в пикселях от центра контейнера. */
  radius?: number;
  /** Полный оборот в секундах. */
  duration?: number;
  /**
   * Задержка старта в секундах: спутники не стартуют хором. Отрицательная
   * задержка валидна и ставит спутник сразу в середину цикла — иначе все
   * висят в одной точке и сцена выглядит как один спутник.
   */
  delay?: number;
  /** Обратное направление: встречные орбиты читаются как система, а не как карусель. */
  reverse?: boolean;
  /** Рисовать ли окружность орбиты. */
  path?: boolean;
  /** Размер иконки в пикселях. */
  iconSize?: number;
  className?: string;
};

/**
 * OrbitingCircles — иконки-спутники на круговых орбитах вокруг центра.
 *
 * Механика: внешний слой крутится на 360°, внутренний крутится в обратную
 * сторону на ту же величину, поэтому иконка едет по окружности и остаётся
 * ровной. Ноль JS: обе анимации — CSS, длительность и задержка в переменных.
 * Контейнер-родитель должен быть `relative`.
 */
export function OrbitingCircles({
  children,
  radius = 80,
  duration = 20,
  delay = 0,
  reverse = false,
  path = true,
  iconSize = 28,
  className,
}: OrbitingCirclesProps): ReactElement {
  return (
    <>
      {path ? (
        <span
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-border"
          style={{ width: radius * 2, height: radius * 2 }}
        />
      ) : null}

      <span
        className={cn(
          "pointer-events-none absolute top-1/2 left-1/2 size-0",
          reverse ? "kit-orbit-reverse" : "kit-orbit",
          className,
        )}
        style={
          {
            "--orbit-duration": `${duration}s`,
            "--orbit-delay": `${delay}s`,
          } as CSSProperties
        }
      >
        <span className="absolute top-0 left-0" style={{ transform: `translate(-50%, -50%) translateY(-${radius}px)` }}>
          <span
            className={cn("flex items-center justify-center", reverse ? "kit-orbit" : "kit-orbit-reverse")}
            style={
              {
                "--orbit-duration": `${duration}s`,
                "--orbit-delay": `${delay}s`,
                width: iconSize,
                height: iconSize,
              } as CSSProperties
            }
          >
            {children}
          </span>
        </span>
      </span>
    </>
  );
}
