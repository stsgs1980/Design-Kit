import { DemoFrame } from "@/components/kit/_shared/demo-frame";
import { NoiseTexture } from "@/components/kit/noise-texture/noise-texture";
import type { ReactElement } from "react";

/**
 * Демо-сцена: сравнение в одном кадре.
 *
 * Слева тот же градиент без зерна, справа — с зерном. Подпись «убирает пластик»
 * проверяется глазами: без второй половины утверждение ничего не доказывало.
 */
export function NoiseTextureDemo(): ReactElement {
  return (
    <DemoFrame data-scene="noise" className="bg-muted p-0">
      <div className="grid h-full w-full grid-cols-2">
        <div className="relative overflow-hidden bg-[linear-gradient(135deg,#e9edf5,#cbd6e8)] dark:bg-[linear-gradient(135deg,#17202e,#0d131c)]">
          <span className="absolute bottom-2.5 left-3 font-mono text-[10px] tracking-[0.14em] text-foreground/60 uppercase">
            без зерна
          </span>
        </div>
        <div className="relative overflow-hidden border-l border-border bg-[linear-gradient(135deg,#e9edf5,#cbd6e8)] dark:bg-[linear-gradient(135deg,#17202e,#0d131c)]">
          <NoiseTexture opacity={0.55} />
          <span className="absolute bottom-2.5 left-3 font-mono text-[10px] tracking-[0.14em] text-foreground/70 uppercase">
            зерно 0.55
          </span>
        </div>
      </div>
    </DemoFrame>
  );
}
