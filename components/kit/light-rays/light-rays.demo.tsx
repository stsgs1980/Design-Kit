import { DemoFrame } from "@/components/kit/_shared/demo-frame";
import { LightRays } from "@/components/kit/light-rays/light-rays";
import type { ReactElement } from "react";

/** Демо-сцена: пучок полос из верхней точки на тёмной подложке. */
export function LightRaysDemo(): ReactElement {
  return (
    <DemoFrame data-scene="rays" tone="dark">
      <LightRays rays={9} color="rgb(44 213 255 / 0.8)" />
    </DemoFrame>
  );
}
