import { cn } from "@/lib/utils";
import worldGeo from "@/lib/world-geo.json";
import { buildDottedMap, projectPoint, type Feature } from "@/lib/world-map";
import type { ReactElement } from "react";

const features = (worldGeo as { features: Feature[] }).features;

/**
 * WorldMap — карта из точек. Ноль JS на клиенте: точки считаются один раз
 * на сервере (Web Mercator + point-in-polygon) и рендерятся как <circle>.
 *
 * В оригинальном Codeforge так же: 1854 <circle> в разметке hero-секции.
 */
export function WorldMap({
  width = 150,
  height = 75,
  samples = 4200,
  dotRadius = 0.22,
  markers = [],
  markerColor = "#FF6900",
  className,
}: {
  width?: number;
  height?: number;
  samples?: number;
  dotRadius?: number;
  markers?: { lat: number; lng: number; label?: string }[];
  markerColor?: string;
  className?: string;
}): ReactElement {
  const { dots } = buildDottedMap(features, { width, height, samples });

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn("h-full w-full text-muted-foreground", className)}
      aria-label="Карта покрытия"
      role="img"
    >
      {dots.map((dot) => (
        <circle key={`${dot.row}-${dot.x}`} cx={dot.x} cy={dot.y} r={dotRadius} fill="currentColor" />
      ))}

      {markers.map((marker, index) => {
        const { x, y } = projectPoint(marker.lng, marker.lat, features, width, height);
        return (
          <g key={marker.label ?? index}>
            <circle cx={x} cy={y} r={dotRadius * 5} fill={markerColor} opacity={0.16} />
            <circle cx={x} cy={y} r={dotRadius * 1.6} fill={markerColor} />
          </g>
        );
      })}
    </svg>
  );
}
