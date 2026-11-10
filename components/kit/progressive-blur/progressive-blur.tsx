import { cn } from "@/lib/utils";
import type { ReactElement } from "react";

/** Пропсы постепенного размытия. */
export type ProgressiveBlurProps = {
  /** С какой стороны размывать. */
  direction?: "top" | "bottom";
  /** Сколько слоёв: больше — плавнее переход, дороже композитору. */
  layers?: number;
  /** Максимальное размытие в пикселях. */
  blur?: number;
  className?: string;
};

/**
 * Постепенное размытие края: несколько слоёв backdrop-filter, каждый со своей
 * маской и своим радиусом.
 *
 * Один слой blur(8px) с линейной маской даёт ступеньку: маска гасит слой, но
 * радиус по всей высоте одинаковый. Слои с разными радиусами дают градиент.
 *
 * Направление маски — от читаемого края к размытому: у слоя с большим радиусом
 * маска открывается только у самого края. Если перевернуть (как было в первой
 * версии), нижняя строка списка оставалась резкой, и эффект читался наоборот.
 */
export function ProgressiveBlur({
  direction = "bottom",
  layers = 5,
  blur = 8,
  className,
}: ProgressiveBlurProps): ReactElement {
  const bands = Array.from({ length: layers }, (_, index) => index);

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-x-0 h-24",
        direction === "bottom" ? "bottom-0" : "top-0",
        className,
      )}
    >
      {bands.map((index) => {
        // полоса каждого слоя: чем ближе к краю, тем больше радиус
        const start = (100 / layers) * index;
        const end = (100 / layers) * (index + 1);
        const ramp =
          direction === "bottom"
            ? `linear-gradient(to bottom, transparent ${start}%, black ${end}%)`
            : `linear-gradient(to top, transparent ${start}%, black ${end}%)`;

        return (
          <div
            key={index}
            className="absolute inset-0"
            style={{
              backdropFilter: `blur(${(((index + 1) / layers) * blur).toFixed(2)}px)`,
              WebkitBackdropFilter: `blur(${(((index + 1) / layers) * blur).toFixed(2)}px)`,
              maskImage: ramp,
              WebkitMaskImage: ramp,
            }}
          />
        );
      })}
    </div>
  );
}
