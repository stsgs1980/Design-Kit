"use client";

import { ListIcon } from "@/components/icons";
import { AnimatedGridPattern } from "@/components/kit/animated-grid-pattern/animated-grid-pattern";
import { DotPattern } from "@/components/kit/dot-pattern/dot-pattern";
import type { ReactElement } from "react";

import { SceneShell } from "./scene-shell";

/**
 * Сцена «пустое состояние»: два фона и одна кнопка.
 *
 * Здесь важна тишина: сетка с маской к центру и точки по краям, медленный цикл
 * и прозрачность ниже обычной. Пустое состояние не должно притягивать взгляд —
 * оно объясняет, что делать дальше, и уступает дорогу контенту.
 */
export function EmptyScene(): ReactElement {
  return (
    <SceneShell place="empty" className="flex items-center justify-center">
      <AnimatedGridPattern
        cell={44}
        squares={6}
        duration={9000}
        className="[mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black,transparent)] text-foreground/20"
      />
      <DotPattern
        width={20}
        height={20}
        className="[mask-image:linear-gradient(to_bottom,black,transparent_75%)] text-primary/35"
      />

      <div className="relative flex min-h-[280px] max-w-sm flex-col items-center justify-center gap-3 px-6 py-10 text-center">
        <span className="flex size-11 items-center justify-center rounded-full border border-border bg-background/80 text-muted-foreground">
          <ListIcon className="size-5" />
        </span>
        <h4 className="text-[15px] font-medium">Здесь пока ничего нет</h4>
        <p className="text-[13px] leading-relaxed text-muted-foreground">
          Выберите компонент из каталога или сбросьте фильтр — фон останется на месте, текст не дёрнется.
        </p>
        <span className="rounded-full border border-border bg-background/80 px-3 py-1 font-mono text-[10px] tracking-[0.14em] uppercase">
          сбросить фильтр
        </span>
      </div>
    </SceneShell>
  );
}
