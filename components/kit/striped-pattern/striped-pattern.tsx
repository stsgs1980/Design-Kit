import { cn } from "@/lib/utils";
import type { ReactElement } from "react";
import { useId } from "react";

/**
 * StripedPattern — диагональные волосяные полосы.
 *
 * Дешёвая альтернатива dither-полосе для тонких разделителей (h-8…h-14):
 * SVG-паттерн, zero JS, currentColor, полностью управляется маской из класса.
 * Ширину полосы и зазор можно менять пропсами — в отличие от CSS
 * repeating-linear-gradient, здесь нет проблем с «мылом» на дробном DPR.
 */
export function StripedPattern({
  width = 8,
  height = 8,
  className,
  ...props
}: React.SVGProps<SVGSVGElement> & { width?: number; height?: number }): ReactElement {
  const id = useId().replace(/[:]/g, "");

  return (
    <svg
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 h-full w-full text-neutral-400/70", className)}
      {...props}
    >
      <defs>
        <pattern id={id} width={width} height={height} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2={height} stroke="currentColor" strokeWidth={1} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}
