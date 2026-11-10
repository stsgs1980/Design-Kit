// Сгенерировано scripts/build-kit-registry.mjs. Не редактировать руками:
// список демо берётся из папок components/kit/<id>/<id>.demo.tsx.
import type { ReactElement } from "react";

import { AnimatedGridPatternDemo } from "@/components/kit/animated-grid-pattern/animated-grid-pattern.demo";
import { BorderBeamDemo } from "@/components/kit/border-beam/border-beam.demo";
import { DitherDemo } from "@/components/kit/dither/dither.demo";
import { DotPatternDemo } from "@/components/kit/dot-pattern/dot-pattern.demo";
import { FlickeringGridDemo } from "@/components/kit/flickering-grid/flickering-grid.demo";
import { GlareHoverDemo } from "@/components/kit/glare-hover/glare-hover.demo";
import { GlyphMatrixDemo } from "@/components/kit/glyph-matrix/glyph-matrix.demo";
import { LightRaysDemo } from "@/components/kit/light-rays/light-rays.demo";
import { MagicCardDemo } from "@/components/kit/magic-card/magic-card.demo";
import { MarqueeDemo } from "@/components/kit/marquee/marquee.demo";
import { NoiseTextureDemo } from "@/components/kit/noise-texture/noise-texture.demo";
import { NumberTickerDemo } from "@/components/kit/number-ticker/number-ticker.demo";
import { OrbitingCirclesDemo } from "@/components/kit/orbiting-circles/orbiting-circles.demo";
import { ProgressiveBlurDemo } from "@/components/kit/progressive-blur/progressive-blur.demo";
import { RadialOrbitDemo } from "@/components/kit/radial-orbit/radial-orbit.demo";
import { ScrollVelocityDemo } from "@/components/kit/scroll-velocity/scroll-velocity.demo";
import { ShinyTextDemo } from "@/components/kit/shiny-text/shiny-text.demo";
import { StripedPatternDemo } from "@/components/kit/striped-pattern/striped-pattern.demo";
import { TextHighlighterDemo } from "@/components/kit/text-highlighter/text-highlighter.demo";
import { TypingAnimationDemo } from "@/components/kit/typing-animation/typing-animation.demo";
import { WordRotateDemo } from "@/components/kit/word-rotate/word-rotate.demo";
import { WorldMapDemo } from "@/components/kit/world-map/world-map.demo";

/** Демо-сцены по id компонента. */
export const kitDemos: Record<string, () => ReactElement> = {
  "animated-grid-pattern": AnimatedGridPatternDemo,
  "border-beam": BorderBeamDemo,
  dither: DitherDemo,
  "dot-pattern": DotPatternDemo,
  "flickering-grid": FlickeringGridDemo,
  "glare-hover": GlareHoverDemo,
  "glyph-matrix": GlyphMatrixDemo,
  "light-rays": LightRaysDemo,
  "magic-card": MagicCardDemo,
  marquee: MarqueeDemo,
  "noise-texture": NoiseTextureDemo,
  "number-ticker": NumberTickerDemo,
  "orbiting-circles": OrbitingCirclesDemo,
  "progressive-blur": ProgressiveBlurDemo,
  "radial-orbit": RadialOrbitDemo,
  "scroll-velocity": ScrollVelocityDemo,
  "shiny-text": ShinyTextDemo,
  "striped-pattern": StripedPatternDemo,
  "text-highlighter": TextHighlighterDemo,
  "typing-animation": TypingAnimationDemo,
  "word-rotate": WordRotateDemo,
  "world-map": WorldMapDemo,
};
