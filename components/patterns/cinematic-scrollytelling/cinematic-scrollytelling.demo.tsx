import { PatternFrame } from "@/components/patterns/_shared/pattern-frame";
import type { ReactElement } from "react";

const FRAMES = [
  { ru: "первый кадр", note: "заголовок въезжает и проявляется" },
  { ru: "второй кадр", note: "подпись догоняет на ходу" },
  { ru: "третий кадр", note: "полоса прогресса доехала до конца" },
];

/**
 * Сцена паттерна «кино на прокрутке».
 *
 * Внутри рамки — своя прокрутка: сцена прокручивается колесом и показывает
 * приём, не заставляя листать всю страницу. Всё делает CSS scroll-timeline,
 * ноль JS; там, где его нет, анимации просто не запускаются (`@supports`).
 */
export function CinematicScrollytellingDemo(): ReactElement {
  return (
    <PatternFrame data-pattern="scrolly" className="p-0">
      <div
        aria-label="Демонстрация: кадры на прокрутке"
        className="scrolly-scene h-full w-full overflow-y-auto"
        role="region"
        tabIndex={0}
      >
        <div className="scrolly-track flex flex-col gap-14 px-5 py-6">
          <div>
            <p className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">прокрутите сцену</p>
            <p className="scrolly-title mt-2 text-[30px] leading-[0.9] font-medium tracking-[-0.04em]">
              Кадр держит прокрутка, а не скрипт
            </p>
          </div>

          {FRAMES.map((frame) => (
            <div key={frame.ru} className="scrolly-frame">
              <p className="text-sm font-medium">{frame.ru}</p>
              <p className="mt-1 text-[12px] text-muted-foreground">{frame.note}</p>
            </div>
          ))}
        </div>
      </div>

      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-foreground/10">
        <span className="scrolly-progress block h-full origin-left bg-primary" />
      </div>

      <span className="pointer-events-none absolute right-3 bottom-2 rounded-full bg-background/85 px-2 py-0.5 font-mono text-[9.5px] tracking-[0.12em] text-muted-foreground uppercase">
        scroll-timeline
      </span>
    </PatternFrame>
  );
}
