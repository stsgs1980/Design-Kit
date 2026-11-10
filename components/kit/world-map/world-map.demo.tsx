import { DemoFrame } from "@/components/kit/_shared/demo-frame";
import { WorldMap } from "@/components/kit/world-map/world-map";
import type { ReactElement } from "react";

const CITY = [
  { lat: 52.23, lng: 21.01, label: "Варшава" },
  { lat: 48.85, lng: 2.35, label: "Париж" },
  { lat: 35.68, lng: 139.69, label: "Токио" },
];

/**
 * Демо-сцена: карта читается на 190 px.
 *
 * 3800 точек в такой плите превращались в шум: радиус 0.32 не спасал. 2200 точек
 * с радиусом 0.45 дают узнаваемые контуры, три метки — города.
 */
export function WorldMapDemo(): ReactElement {
  return (
    <DemoFrame data-scene="map" className="p-4">
      <WorldMap markers={CITY} samples={2200} dotRadius={0.45} className="text-foreground/40" />
    </DemoFrame>
  );
}
