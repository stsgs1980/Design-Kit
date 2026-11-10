import { DemoFrame } from "@/components/kit/_shared/demo-frame";
import { TypingAnimation } from "@/components/kit/typing-animation/typing-animation";
import { kitStats } from "@/lib/kit/manifest";
import type { ReactElement } from "react";

const STATS = kitStats();
const LINE = `${STATS.total} компонента · ${STATS.noJs} без JS`;

/**
 * Демо-сцена: строка печатается по символу с кареткой.
 *
 * Печатается факт из манифеста, а не команда установки вымышленного пакета.
 */
export function TypingAnimationDemo(): ReactElement {
  return (
    <DemoFrame data-scene="typing">
      <span className="font-mono text-xs text-foreground">
        <span className="text-muted-foreground">&gt; </span>
        <TypingAnimation text={LINE} speed={55} />
      </span>
    </DemoFrame>
  );
}
