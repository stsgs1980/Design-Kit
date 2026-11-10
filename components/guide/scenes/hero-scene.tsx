"use client";

import { AnimatedGridPattern } from "@/components/kit/animated-grid-pattern/animated-grid-pattern";
import { BorderBeam } from "@/components/kit/border-beam/border-beam";
import { LazyDither } from "@/components/kit/dither/lazy-dither";
import { DotPattern } from "@/components/kit/dot-pattern/dot-pattern";
import { LightRays } from "@/components/kit/light-rays/light-rays";
import { MagicCard } from "@/components/kit/magic-card/magic-card";
import { ProgressiveBlur } from "@/components/kit/progressive-blur/progressive-blur";
import { ShinyText } from "@/components/kit/shiny-text/shiny-text";
import { TypingAnimation } from "@/components/kit/typing-animation/typing-animation";
import { WordRotate } from "@/components/kit/word-rotate/word-rotate";
import type { ReactElement } from "react";

import { kitStats } from "@/lib/kit/manifest";

import { SceneShell } from "./scene-shell";

const WORDS = ["каталога", "справочника", "кита"];

/* Числа берутся из манифеста: сцена не расходится с каталогом после новой записи */
const STATS = kitStats();

/**
 * Сцена «первый экран»: 10 компонентов в одной композиции.
 *
 * Слева — обещание: бейдж с бликом по периметру, заголовок с ротацией слова,
 * строка с бегущим бликом и печать по символу. Справа — доказательство:
 * карточка с прожектором, внутри дизеринг под постепенным размытием. Фон —
 * живая сетка с маской, точки и лучи, каждый со своей долей прозрачности.
 */
export function HeroScene(): ReactElement {
  return (
    <SceneShell place="hero">
      <AnimatedGridPattern
        cell={34}
        squares={9}
        className="[mask-image:radial-gradient(ellipse_60%_70%_at_22%_12%,black,transparent)] text-primary/30"
      />
      <LightRays rays={7} animated={false} color="rgb(0 165 239 / 0.25)" />
      <DotPattern
        width={18}
        height={18}
        className="[mask-image:radial-gradient(ellipse_at_bottom_right,black,transparent_68%)] text-primary/45"
      />

      <div className="relative grid min-h-[320px] items-center gap-8 p-7 md:min-h-[360px] md:grid-cols-[1.15fr_0.85fr] md:p-11">
        <div className="flex flex-col justify-center gap-5">
          <BorderBeam mode="shine" className="w-fit px-3 py-1">
            <span className="font-mono text-[10px] tracking-[0.2em] text-foreground/70 uppercase">
              кит · {STATS.total} компонента
            </span>
          </BorderBeam>

          <h4 className="text-[26px] leading-[1.15] font-semibold tracking-tight text-balance md:text-[32px]">
            Дорогой интерфейс для <WordRotate words={WORDS} align="start" />
          </h4>

          <p className="text-sm text-muted-foreground">
            <ShinyText duration={6}>Один акцент, одна палитра, ноль лишних библиотек</ShinyText>
          </p>

          <p className="font-mono text-[11px] text-foreground/70">
            <TypingAnimation
              text={`${STATS.total} компонента · ${STATS.noJs} работают без JS`}
              speed={55}
              startOnView
            />
          </p>
        </div>

        <MagicCard className="p-3">
          <div className="relative h-36 overflow-hidden rounded-lg border border-border">
            <LazyDither pixelSize={5} enableMouseInteraction={false} />
            <ProgressiveBlur direction="bottom" blur={5} className="h-full" />
          </div>
          <div className="flex items-baseline justify-between px-1 pt-3">
            <span className="text-[13px] font-medium text-foreground">Доказательство справа</span>
            <span className="font-mono text-[10px] text-muted-foreground">dither · ленивый чанк</span>
          </div>
        </MagicCard>
      </div>
    </SceneShell>
  );
}
