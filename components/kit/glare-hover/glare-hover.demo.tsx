import { DemoFrame } from "@/components/kit/_shared/demo-frame";
import { GlareHover } from "@/components/kit/glare-hover/glare-hover";
import type { ReactElement } from "react";

/**
 * Демо-сцена: блик проходит сам, наведение ускоряет проход.
 *
 * Раньше блик жил только на hover — в плитке каталога карточка выглядела пустой.
 * `auto` делает то же движение, но по кругу: видно и без курсора.
 */
export function GlareHoverDemo(): ReactElement {
  return (
    <DemoFrame data-scene="glare">
      <GlareHover
        auto
        duration={600}
        className="flex h-full w-44 items-center justify-center text-xs text-muted-foreground"
      >
        <span
          aria-hidden
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage: "linear-gradient(135deg, transparent 30%, var(--gradient-secondary) 50%, transparent 70%)",
          }}
        />
        <span className="relative">блик идёт сам</span>
      </GlareHover>
    </DemoFrame>
  );
}
