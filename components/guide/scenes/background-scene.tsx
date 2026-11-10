"use client";

import { AnimatedGridPattern } from "@/components/kit/animated-grid-pattern/animated-grid-pattern";
import { DotPattern } from "@/components/kit/dot-pattern/dot-pattern";
import { FlickeringGrid } from "@/components/kit/flickering-grid/flickering-grid";
import { NoiseTexture } from "@/components/kit/noise-texture/noise-texture";
import { StripedPattern } from "@/components/kit/striped-pattern/striped-pattern";
import type { ReactElement } from "react";

import { SceneShell } from "./scene-shell";

/** Подписи слоёв: что включено и с какой прозрачностью. */
const LAYERS = [
  { id: "grid", label: "живая сетка · 0.18" },
  { id: "dots", label: "точки · 0.30" },
  { id: "stripes", label: "полосы · 0.10" },
  { id: "flicker", label: "мерцание · 0.20" },
  { id: "noise", label: "зерно · 0.12" },
];

/**
 * Сцена «фон»: пять слоёв под одним абзацем текста.
 *
 * Правило места — маска и прозрачность до 0.4. Поэтому каждый слой занимает свою
 * зону и гаснет к краям: сетка слева, точки справа, полосы сверху, мерцание
 * пятном в центре, зерно поверх всего. Текст остаётся читаемым, и это видно
 * на самой сцене, а не в подписи под ней.
 */
export function BackgroundScene(): ReactElement {
  return (
    <SceneShell place="background">
      <AnimatedGridPattern
        cell={40}
        squares={8}
        className="[mask-image:radial-gradient(ellipse_55%_80%_at_15%_50%,black,transparent)] text-foreground/25"
      />
      <DotPattern
        width={16}
        height={16}
        className="[mask-image:radial-gradient(ellipse_50%_70%_at_88%_45%,black,transparent)] text-primary/40"
      />
      <StripedPattern className="[mask-image:linear-gradient(to_bottom,black,transparent_45%)] text-foreground/15" />
      <div className="absolute inset-0 [mask-image:radial-gradient(circle_at_50%_60%,black,transparent_55%)]">
        <FlickeringGrid squareSize={4} gridGap={7} maxOpacity={0.25} flickerChance={0.05} />
      </div>
      <NoiseTexture opacity={0.12} />

      <div className="relative flex min-h-[340px] flex-col justify-between gap-8 p-7 md:p-11">
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {LAYERS.map((layer) => (
            <span key={layer.id} className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
              {layer.label}
            </span>
          ))}
        </div>

        <div className="max-w-lg">
          <h4 className="text-[24px] leading-tight font-semibold tracking-tight md:text-[28px]">
            Фон никогда не спорит с текстом
          </h4>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
            Пять слоёв держатся на двух правилах: у каждого своя маска и прозрачность не выше 0.4. Без маски точки и
            полосы лезут под буквы, и тогда текст приходится делать жирнее — это и есть «дёшево».
          </p>
        </div>
      </div>
    </SceneShell>
  );
}
