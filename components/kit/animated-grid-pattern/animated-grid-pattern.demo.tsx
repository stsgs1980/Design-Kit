import { DemoFrame } from "@/components/kit/_shared/demo-frame";
import { AnimatedGridPattern } from "@/components/kit/animated-grid-pattern/animated-grid-pattern";
import type { ReactElement } from "react";

/**
 * Демо-сцена: живые ячейки без пояснительной подписи.
 *
 * Подпись «сетка на CSS» внутри сцены объясняла то, что должно быть видно
 * глазами; вместо неё — маска, чтобы ячейки гаснут к краям.
 */
export function AnimatedGridPatternDemo(): ReactElement {
  return (
    <DemoFrame data-scene="grid">
      <AnimatedGridPattern
        cell={24}
        squares={16}
        className="[mask-image:radial-gradient(ellipse_at_40%_40%,black,transparent_75%)]"
      />
    </DemoFrame>
  );
}
