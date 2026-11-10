import { DemoFrame } from "@/components/kit/_shared/demo-frame";
import { NumberTicker } from "@/components/kit/number-ticker/number-ticker";
import type { ReactElement } from "react";

/**
 * Демо-сцена: число с подписью, которую можно проверить.
 *
 * 1400 — это точек на карте мира на первом экране, а не «компонентов в ките»:
 * в ките 22, и подпись «1400 компонентов» противоречила манифесту.
 */
export function NumberTickerDemo(): ReactElement {
  return (
    <DemoFrame data-scene="ticker">
      <div className="flex flex-col items-center gap-2">
        <span className="text-4xl font-semibold tracking-[-0.035em]">
          <NumberTicker value={1400} />
        </span>
        <span className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
          точек на карте мира
        </span>
      </div>
    </DemoFrame>
  );
}
