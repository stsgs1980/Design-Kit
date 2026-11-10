import { DemoFrame } from "@/components/kit/_shared/demo-frame";
import { ScrollVelocity } from "@/components/kit/scroll-velocity/scroll-velocity";
import type { ReactElement } from "react";

/** Фраза ленты: короткие слова не превращают цикл в трижды повторённую строку. */
const PHRASE = ["кит", "паттерны", "движение", "плотность", "ритм"];
const TECH = ["CSS", "SVG", "Canvas 2D", "WebGL", "framer-motion"];

/** Класс маски: края гасятся, иначе строка обрывается посреди слова. */
const FADE = "w-full [mask-image:linear-gradient(to_right,transparent,black_14%,black_86%,transparent)]";

/**
 * Демо-сцена: лента, которая реагирует на прокрутку страницы.
 *
 * Верхняя строка — крупная фраза вперёд, нижняя — мелкие чипы назад: два
 * направления показывают, что скорость и знак задаёт прокрутка, а не таймер.
 * Слева подпись «прокрути страницу» — без неё приём читается как карусель.
 */
export function ScrollVelocityDemo(): ReactElement {
  return (
    <DemoFrame data-scene="velocity" className="h-52 flex-col items-stretch justify-center gap-5 py-6">
      <div className="flex items-baseline justify-between px-5 font-mono text-[9.5px] tracking-[0.16em] text-muted-foreground uppercase">
        <span>прокрути страницу</span>
        <span className="text-warm">скорость = скролл</span>
      </div>

      <ScrollVelocity baseVelocity={120} className={FADE}>
        {PHRASE.map((word) => (
          <span key={word} className="flex items-baseline">
            <span className="mx-4 text-[26px] leading-none font-medium tracking-tight whitespace-nowrap">{word}</span>
            <span aria-hidden className="text-[26px] leading-none text-primary-text">
              /
            </span>
          </span>
        ))}
      </ScrollVelocity>

      <ScrollVelocity baseVelocity={-80} className={FADE}>
        {TECH.map((tech) => (
          <span
            key={tech}
            className="mx-1.5 rounded-full border border-border px-3 py-1 font-mono text-[10px] tracking-[0.12em] text-muted-foreground uppercase"
          >
            {tech}
          </span>
        ))}
      </ScrollVelocity>
    </DemoFrame>
  );
}
