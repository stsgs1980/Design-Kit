"use client";

import { Plus } from "@/components/icons";
import { LazyDither } from "@/components/kit/dither/lazy-dither";
import { Marquee } from "@/components/kit/marquee/marquee";
import { NumberTicker } from "@/components/kit/number-ticker/number-ticker";
import { RadialOrbit } from "@/components/kit/radial-orbit/radial-orbit";
import { ShinyText } from "@/components/kit/shiny-text/shiny-text";
import { StripedPattern } from "@/components/kit/striped-pattern/striped-pattern";
import { TextHighlighter } from "@/components/kit/text-highlighter/text-highlighter";
import { WordRotate } from "@/components/kit/word-rotate/word-rotate";
import { WorldMap } from "@/components/kit/world-map/world-map";
import type { ReactElement } from "react";

import { SceneShell } from "./scene-shell";

const STATS = [
  { value: 20, label: "компонентов" },
  { value: 12, label: "без JS" },
  { value: 0, label: "зависимостей" },
];

const TAGS = ["паттерны", "поверхности", "движение", "текст", "данные", "без библиотек"];

const ORBIT = [
  { id: 1, rayIndex: 2, distance: 26, icon: <Plus className="size-2.5 text-foreground/70" /> },
  { id: 2, rayIndex: 8, distance: 20, icon: <Plus className="size-2.5 text-foreground/70" /> },
  { id: 3, rayIndex: 15, distance: 30, icon: <Plus className="size-2.5 text-foreground/70" /> },
];

/**
 * Сцена «секция»: заголовок с маркером, счётчики, карта, лента.
 *
 * Фон — диагональные полосы с маской сверху вниз. Справа карта мира и полоса
 * дизеринга как разделитель, слева — текст с подсветкой слова и ротацией.
 * Низ секции закрывает лента тегов: она не даёт блоку «повиснуть» в воздухе.
 */
export function SectionScene(): ReactElement {
  return (
    <SceneShell place="section">
      <StripedPattern className="[mask-image:linear-gradient(to_bottom,black,transparent_70%)] text-foreground/[0.08]" />

      <div className="relative flex min-h-[340px] flex-col gap-7 p-7 md:p-10">
        <div className="flex flex-wrap items-start justify-between gap-8">
          <div className="flex max-w-md flex-col gap-4">
            <ShinyText duration={7} className="font-mono text-[10px] tracking-[0.2em] uppercase">
              раздел · разбор
            </ShinyText>

            <h4 className="text-[24px] leading-tight font-semibold tracking-tight md:text-[28px]">
              Как устроен <TextHighlighter>каталог</TextHighlighter> и что в нём{" "}
              <WordRotate words={["главное", "дорогое", "дешёвое"]} align="start" />
            </h4>

            <dl className="flex flex-wrap gap-x-8 gap-y-2 pt-1">
              {STATS.map((stat) => (
                <div key={stat.label} className="flex flex-col-reverse gap-0.5">
                  <dt className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
                    {stat.label}
                  </dt>
                  <dd className="text-2xl font-semibold tracking-tight">
                    <NumberTicker value={stat.value} />
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="flex flex-col gap-3">
            <div className="h-28 w-52 overflow-hidden rounded-lg border border-border bg-background/60">
              <WorldMap
                samples={1800}
                dotRadius={0.3}
                markers={[
                  { lat: 52.23, lng: 21.01 },
                  { lat: 48.85, lng: 2.35 },
                  { lat: 35.68, lng: 139.69 },
                ]}
              />
            </div>
            <div className="flex items-stretch gap-3">
              <div className="relative h-20 w-36 overflow-hidden rounded-lg border border-border">
                <LazyDither pixelSize={4} enableMouseInteraction={false} />
              </div>
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-lg border border-border">
                <RadialOrbit items={ORBIT} lineCount={14} className="h-20 w-20" inView />
              </div>
            </div>
          </div>
        </div>

        <Marquee duration={34} className="relative">
          {TAGS.map((tag) => (
            <span
              key={tag}
              className="mx-1.5 rounded-full border border-border bg-background/70 px-3 py-1 text-[11px] text-foreground/80"
            >
              {tag}
            </span>
          ))}
        </Marquee>
      </div>
    </SceneShell>
  );
}
