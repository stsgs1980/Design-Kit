import { DemoFrame } from "@/components/kit/_shared/demo-frame";
import { StripedPattern } from "@/components/kit/striped-pattern/striped-pattern";
import type { ReactElement } from "react";

/**
 * Демо-сцена: полосы под маской, а не на всю плитку.
 *
 * Правило места — «фон только с маской и прозрачностью до 0.4». Сцена без маски
 * нарушала бы то же правило, которое проповедует страница.
 */
export function StripedPatternDemo(): ReactElement {
  return (
    <DemoFrame data-scene="stripes">
      <StripedPattern
        width={9}
        height={9}
        className="[mask-image:radial-gradient(ellipse_at_35%_25%,black,transparent_72%)] text-foreground/45"
      />
    </DemoFrame>
  );
}
