import { GlareHover } from "@/components/kit/glare-hover/glare-hover";
import { Marquee } from "@/components/kit/marquee/marquee";
import { NoiseTexture } from "@/components/kit/noise-texture/noise-texture";
import { ProgressiveBlur } from "@/components/kit/progressive-blur/progressive-blur";
import { PatternFrame } from "@/components/patterns/_shared/pattern-frame";
import type { ReactElement } from "react";

/** Отзыв в ленте: имя и одна фраза. */
const QUOTES = [
  ["Аня", "Каталог читается как справочник, а не как лендинг"],
  ["Марк", "Ноль лишних килобайт — и это видно по скорости"],
  ["Лиза", "Демо на месте, не надо никуда идти"],
];

/**
 * Сцена набора «лента отзывов».
 *
 * Две встречные полосы, карточки фиксированной ширины, зерно поверх и мягкое
 * гашение краёв: без маски лента обрывается линией и читается как бегущая строка.
 */
export function SocialStripDemo(): ReactElement {
  return (
    <PatternFrame data-pattern="social-strip" className="flex-col justify-center gap-2 p-0">
      <NoiseTexture opacity={0.1} />

      {[false, true].map((reverse) => (
        <Marquee
          key={String(reverse)}
          reverse={reverse}
          duration={reverse ? 46 : 38}
          repeat={2}
          fade={false}
          className="w-full"
        >
          {QUOTES.map(([name, quote]) => (
            <GlareHover
              key={`${name}-${String(reverse)}`}
              auto={reverse}
              className="mx-1.5 w-[188px] rounded-xl border border-border bg-card p-3"
            >
              <p className="text-[11px] leading-snug">{quote}</p>
              <p className="mt-1.5 font-mono text-[9.5px] text-muted-foreground">{name}</p>
            </GlareHover>
          ))}
        </Marquee>
      ))}

      <ProgressiveBlur direction="bottom" blur={6} className="pointer-events-none absolute inset-x-0 bottom-0" />
    </PatternFrame>
  );
}
