import { DemoFrame } from "@/components/kit/_shared/demo-frame";
import { OrbitingCircles } from "@/components/kit/orbiting-circles/orbiting-circles";
import type { ReactElement } from "react";

/** Спутник: буква технологии на круге. Цвет — только у акцентной метки. */
function Satellite({ label, accent = false }: { label: string; accent?: boolean }): ReactElement {
  return (
    <span
      className={
        accent
          ? "flex size-6 items-center justify-center rounded-full border border-primary/50 bg-card font-mono text-[9px] font-medium text-primary-text"
          : "flex size-6 items-center justify-center rounded-full border border-border bg-card font-mono text-[9px] font-medium text-muted-foreground"
      }
    >
      {label}
    </span>
  );
}

/** Легенда: без неё вращение читается как карусель, а не как две орбиты. */
const LEGEND = [
  { id: "inner", text: "внутренняя · 14 с · по часовой" },
  { id: "outer", text: "внешняя · 22 с · против часовой" },
];

/**
 * Демо-сцена: две встречные орбиты вокруг центрального ядра.
 *
 * Встречное движение — главное в приёме: одинаковые направления читаются как
 * карусель, а два потока в разные стороны — как система. Сцена ограничена
 * квадратом: на всю ширину карточки орбиты казались двумя случайными точками
 * в пустом поле.
 */
export function OrbitingCirclesDemo(): ReactElement {
  return (
    <DemoFrame data-scene="orbit-circles" className="gap-8 px-6">
      <div className="relative size-44 shrink-0">
        <span className="absolute top-1/2 left-1/2 flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card font-mono text-[10px]">
          DK
        </span>

        <OrbitingCircles radius={40} duration={14} iconSize={24}>
          <Satellite label="CSS" accent />
        </OrbitingCircles>
        <OrbitingCircles radius={40} duration={14} delay={-7} iconSize={24}>
          <Satellite label="SVG" />
        </OrbitingCircles>
        <OrbitingCircles radius={64} duration={22} delay={-3} reverse iconSize={24}>
          <Satellite label="2D" />
        </OrbitingCircles>
        <OrbitingCircles radius={64} duration={22} delay={-14} reverse iconSize={24}>
          <Satellite label="GL" />
        </OrbitingCircles>
      </div>

      <ul className="hidden shrink-0 flex-col gap-2 sm:flex">
        {LEGEND.map((row) => (
          <li key={row.id} className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
            <span aria-hidden className="size-1 rounded-full bg-border" />
            {row.text}
          </li>
        ))}
      </ul>
    </DemoFrame>
  );
}
