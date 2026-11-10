import { DemoFrame } from "@/components/kit/_shared/demo-frame";
import { DotPattern } from "@/components/kit/dot-pattern/dot-pattern";
import type { ReactElement } from "react";

/**
 * Демо-сцена: крупные точки дугой, гаснут к краям.
 *
 * Шаг 16 px на плите 190 px давал почти невидимую сетку; 22 px с радиусом 1.4 —
 * читается как подложка, но не спорит с содержимым секции.
 */
export function DotPatternDemo(): ReactElement {
  return (
    <DemoFrame data-scene="dots">
      <DotPattern
        width={22}
        height={22}
        cx={1}
        cy={1}
        cr={1.4}
        className="[mask-image:radial-gradient(ellipse_at_50%_120%,black_35%,transparent_78%)] text-foreground/60"
      />
    </DemoFrame>
  );
}
