import { BorderBeam } from "@/components/kit/border-beam/border-beam";
import { DotPattern } from "@/components/kit/dot-pattern/dot-pattern";
import { LightRays } from "@/components/kit/light-rays/light-rays";
import { NoiseTexture } from "@/components/kit/noise-texture/noise-texture";
import { NumberTicker } from "@/components/kit/number-ticker/number-ticker";
import { ShinyText } from "@/components/kit/shiny-text/shiny-text";
import { PatternFrame } from "@/components/patterns/_shared/pattern-frame";
import type { ReactElement } from "react";

/**
 * Сцена набора «первый экран».
 *
 * Порядок слоёв виден в кадре: подложка из точек с маской → один источник света
 * → зерно → заголовок с бегущим бликом → доказательство справа. Больше одного
 * громкого элемента здесь нет — это и есть правило набора.
 */
export function HeroRecipeDemo(): ReactElement {
  return (
    <PatternFrame data-pattern="hero-recipe" className="p-0">
      <DotPattern
        width={20}
        height={20}
        cx={1}
        cy={1}
        cr={1.2}
        className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_42%_20%,black_10%,transparent_72%)] text-foreground/45"
      />
      <LightRays rays={9} color="rgb(44 213 255 / 0.22)" className="absolute inset-0" />
      <NoiseTexture opacity={0.07} />

      <div className="relative flex h-full w-full flex-col justify-center gap-3 px-5">
        <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
          <ShinyText duration={5}>design kit · стартовый экран</ShinyText>
        </p>

        <p className="max-w-full text-[26px] leading-[0.94] font-medium tracking-[-0.04em] text-balance sm:max-w-[62%]">
          Один акцент на экран, остальное — воздух
        </p>

        <div className="flex items-center gap-4">
          <span className="font-mono text-lg font-medium">
            <NumberTicker value={1400} />
          </span>
          <span className="font-mono text-[10px] text-muted-foreground">точек на карте</span>
          <span className="font-mono text-lg font-medium">
            <NumberTicker value={20} />
          </span>
          <span className="font-mono text-[10px] text-muted-foreground">компонентов</span>
        </div>
      </div>

      <div className="absolute top-4 right-4 hidden w-[132px] sm:block">
        <BorderBeam className="rounded-xl bg-card/85 p-3 backdrop-blur-sm">
          <p className="text-[11px] font-medium">доказательство</p>
          <p className="mt-1 font-mono text-[9.5px] leading-relaxed text-muted-foreground">
            блик по рамке — один на секцию
          </p>
        </BorderBeam>
      </div>
    </PatternFrame>
  );
}
