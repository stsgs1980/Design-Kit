import { DemoFrame } from "@/components/kit/_shared/demo-frame";
import { FlickeringGrid } from "@/components/kit/flickering-grid/flickering-grid";
import type { ReactElement } from "react";

/**
 * Демо-сцена: редкие вспышки с хвостом вместо сплошного мерцания.
 *
 * flickerChance 0.3 при затухании до 8% в секунду держит около десятой части
 * квадратов подсвеченными: текстура живая, но не превращается в голубой шум,
 * как при 0.15 на плотной сетке.
 */
export function FlickeringGridDemo(): ReactElement {
  return (
    <DemoFrame data-scene="flicker">
      <FlickeringGrid
        className="absolute inset-0 size-full"
        squareSize={3}
        gridGap={8}
        color="#00a5ef"
        maxOpacity={0.5}
        flickerChance={0.3}
      />
    </DemoFrame>
  );
}
