import { cn } from "@/lib/utils";
import type { ReactElement } from "react";
import { useId } from "react";

/**
 * DotPattern — точечная сетка на SVG-паттерне.
 *
 * Полностью серверный компонент: нулевой JS, ноль layout-thrash.
 * Цвет наследуется через currentColor, поэтому работает и в тёмной теме.
 * Маску задаёт потребитель (`className`), как в оригинале:
 *   [mask-image:radial-gradient(300px_circle_at_center,white,transparent)]
 */
export function DotPattern({
  width = 16,
  height = 16,
  cx = 1,
  cy = 1,
  cr = 1,
  className,
  ...props
}: React.SVGProps<SVGSVGElement> & {
  width?: number;
  height?: number;
  cx?: number;
  cy?: number;
  cr?: number;
}): ReactElement {
  const id = useId().replace(/[:]/g, "");

  return (
    <svg
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full fill-neutral-400/80 text-neutral-400",
        className,
      )}
      {...props}
    >
      <defs>
        <pattern
          id={id}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          patternContentUnits="userSpaceOnUse"
        >
          <circle id="pattern-circle" cx={cx} cy={cy} r={cr} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${id})`} />
    </svg>
  );
}
