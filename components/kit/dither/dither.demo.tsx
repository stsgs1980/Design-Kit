import { DemoFrame } from "@/components/kit/_shared/demo-frame";
import { LazyDither } from "@/components/kit/dither/lazy-dither";
import type { ReactElement } from "react";

/**
 * Демо-сцена: единственная сцена на WebGL, и это видно.
 *
 * Сцена показывает, что внутри ленивый чанк: подпись в углу и границы кадра,
 * иначе «дизеринг» выглядел как ещё один CSS-паттерн.
 */
export function DitherDemo(): ReactElement {
  return (
    <DemoFrame data-scene="dither" className="p-0">
      <div className="relative h-full w-full">
        <LazyDither enableMouseInteraction={false} pixelSize={3} />
        <span className="absolute bottom-2 left-2.5 rounded-full bg-background/80 px-2 py-0.5 font-mono text-[9.5px] tracking-[0.12em] text-foreground/70 uppercase">
          WebGL · ленивый чанк
        </span>
      </div>
    </DemoFrame>
  );
}
