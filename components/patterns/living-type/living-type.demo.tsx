import { Marquee } from "@/components/kit/marquee/marquee";
import { WordRotate } from "@/components/kit/word-rotate/word-rotate";
import { PatternFrame } from "@/components/patterns/_shared/pattern-frame";
import { kitStats } from "@/lib/kit/manifest";
import type { ReactElement } from "react";

const WORDS = ["каталоге", "паспорте", "матрице", "рецептах"];
const BAND = ["ноль JS", "одна палитра", `${kitStats().total} компонента`, `${kitStats().noJs} без JS`];

/**
 * Сцена паттерна «живой текст».
 *
 * Два разных движения в одном кадре: слово подменяется на месте, а лента едет
 * непрерывно. Текст остаётся читаемым — меняется только то, что должно
 * привлекать внимание.
 */
export function LivingTypeDemo(): ReactElement {
  return (
    <PatternFrame data-pattern="living-type" className="flex-col justify-center gap-4 p-5">
      <p className="w-full text-[26px] leading-[1.05] font-medium tracking-[-0.03em]">
        Текст оживает в <WordRotate words={WORDS} interval={2600} align="start" className="text-primary-text" />
      </p>

      <Marquee duration={24} fade repeat={2} className="w-full">
        {BAND.map((item) => (
          <span
            key={item}
            className="font-mono text-[11px] tracking-[0.14em] whitespace-nowrap text-muted-foreground uppercase"
          >
            {item} <span className="mx-3 text-foreground/25">/</span>
          </span>
        ))}
      </Marquee>

      <p className="w-full font-mono text-[10px] text-muted-foreground">
        слово меняется на месте · лента едет непрерывно
      </p>
    </PatternFrame>
  );
}
