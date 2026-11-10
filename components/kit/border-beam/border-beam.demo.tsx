import { DemoFrame } from "@/components/kit/_shared/demo-frame";
import { BorderBeam } from "@/components/kit/border-beam/border-beam";
import type { ReactElement } from "react";

/**
 * Демо-сцена: два режима одной карточки, подписи по-русски.
 *
 * `beam` и `shine` — не два компонента, а два состояния одной задачи; латиница
 * внутри сцены ломала правило «интерфейс на русском».
 */
export function BorderBeamDemo(): ReactElement {
  return (
    <DemoFrame data-scene="beam" className="flex flex-wrap gap-3">
      <BorderBeam className="flex h-20 w-[120px] flex-col justify-center gap-0.5 px-2.5">
        <span className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase">бегущий</span>
        <span className="text-[11px] whitespace-nowrap text-foreground">блик по рамке</span>
      </BorderBeam>
      <BorderBeam tone="warm" className="flex h-20 w-[120px] flex-col justify-center gap-0.5 px-2.5">
        <span className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase">warm</span>
        <span className="text-[11px] whitespace-nowrap text-foreground">оранжевый блик</span>
      </BorderBeam>
      <BorderBeam mode="shine" className="flex h-20 w-[120px] flex-col justify-center gap-0.5 px-2.5">
        <span className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase">статичный</span>
        <span className="text-[11px] whitespace-nowrap text-foreground">градиент рамки</span>
      </BorderBeam>
      <BorderBeam mode="shine" tone="warm" className="flex h-20 w-[120px] flex-col justify-center gap-0.5 px-2.5">
        <span className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase">warm</span>
        <span className="text-[11px] whitespace-nowrap text-foreground">градиент warm</span>
      </BorderBeam>
    </DemoFrame>
  );
}
