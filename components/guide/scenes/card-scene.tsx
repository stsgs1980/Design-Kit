"use client";

import { Plus } from "@/components/icons";
import { BorderBeam } from "@/components/kit/border-beam/border-beam";
import { FlickeringGrid } from "@/components/kit/flickering-grid/flickering-grid";
import { GlareHover } from "@/components/kit/glare-hover/glare-hover";
import { GlyphMatrix } from "@/components/kit/glyph-matrix/glyph-matrix";
import { MagicCard } from "@/components/kit/magic-card/magic-card";
import { NoiseTexture } from "@/components/kit/noise-texture/noise-texture";
import { NumberTicker } from "@/components/kit/number-ticker/number-ticker";
import { RadialOrbit } from "@/components/kit/radial-orbit/radial-orbit";
import { ShinyText } from "@/components/kit/shiny-text/shiny-text";
import { TextHighlighter } from "@/components/kit/text-highlighter/text-highlighter";
import { TypingAnimation } from "@/components/kit/typing-animation/typing-animation";
import type { ReactElement } from "react";

import { SceneShell } from "./scene-shell";

const ORBIT = [
  { id: 1, rayIndex: 3, distance: 30, icon: <Plus className="size-2.5 text-foreground/70" /> },
  { id: 2, rayIndex: 10, distance: 24, icon: <Plus className="size-2.5 text-foreground/70" /> },
];

/**
 * Сцена «карточка»: три карточки в одном ряду, каждая со своей поверхностью.
 *
 * Первая — прожектор под курсором и матрица символов вместо картинки, вторая —
 * блик при наведении с бегущей рамкой, третья — та же поверхность без картинки:
 * счётчик и орбита. Фон — мерцающая сетка, поверх всего — зерно, которое
 * выравнивает цифровую гладкость карточек.
 */
export function CardScene(): ReactElement {
  return (
    <SceneShell place="card">
      <div className="absolute inset-0">
        <FlickeringGrid squareSize={3} gridGap={5} maxOpacity={0.22} flickerChance={0.06} />
      </div>

      <div className="relative grid gap-4 p-6 md:grid-cols-3 md:p-8">
        <MagicCard radius={110} gradient="rgb(44 213 255 / 0.55)" className="flex flex-col justify-between gap-3 p-3">
          <div className="relative h-20 overflow-hidden rounded-lg border border-border">
            <GlyphMatrix glyphs="01+*/<>=" cellSize={11} className="text-primary/70" />
          </div>
          <div className="flex flex-col gap-1 px-1 pb-1">
            <ShinyText duration={5} className="font-mono text-[10px] tracking-[0.16em] uppercase">
              прожектор
            </ShinyText>
            <h5 className="text-[15px] font-medium">Пятно идёт за курсором</h5>
            <p className="text-[12px] leading-relaxed text-muted-foreground">
              Подсветка на composer-слое: hover не двигает layout и не роняет кадры.
            </p>
          </div>
        </MagicCard>

        <GlareHover className="flex flex-col justify-between gap-3 p-4">
          <BorderBeam mode="beam" duration={6000} className="flex flex-col gap-2 p-3">
            <span className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
              блик и рамка
            </span>
            <h5 className="text-[15px] font-medium">
              Одна <TextHighlighter>важная</TextHighlighter> карточка
            </h5>
          </BorderBeam>
          <ul className="flex flex-col gap-1 px-1 font-mono text-[11px] text-muted-foreground">
            {["пятно 240 px", "рамка 1 px", "hover 700 ms"].map((row) => (
              <li key={row} className="flex items-center gap-2">
                <span aria-hidden className="h-1 w-1 rounded-full bg-primary" />
                {row}
              </li>
            ))}
          </ul>
          <p className="px-1 font-mono text-[11px] text-foreground/70">
            <TypingAnimation text="beam 6s · glare 700ms" speed={70} startOnView />
          </p>
        </GlareHover>

        <div className="flex flex-col justify-between gap-3 rounded-xl border border-border bg-card p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col">
              <span className="text-2xl font-semibold tracking-tight">
                <NumberTicker value={42} />
              </span>
              <span className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
                строк в карточке
              </span>
            </div>
            <RadialOrbit items={ORBIT} lineCount={12} className="h-16 w-16 shrink-0" inView />
          </div>
          <p className="text-[12px] leading-relaxed text-muted-foreground">
            Орбита — метка состояния: три иконки, никакой подписи «статус» рядом.
          </p>
        </div>
      </div>

      <NoiseTexture opacity={0.22} />
    </SceneShell>
  );
}
