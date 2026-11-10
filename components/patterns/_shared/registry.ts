import { AccentCardDemo } from "@/components/patterns/accent-card/accent-card.demo";
import { AuroraBackgroundDemo } from "@/components/patterns/aurora-background/aurora-background.demo";
import { CinematicScrollytellingDemo } from "@/components/patterns/cinematic-scrollytelling/cinematic-scrollytelling.demo";
import { CleanDesign2Demo } from "@/components/patterns/clean-design-2/clean-design-2.demo";
import { DarkGlowDemo } from "@/components/patterns/dark-glow/dark-glow.demo";
import { EditorialDemo } from "@/components/patterns/editorial/editorial.demo";
import { FourLayersDemo } from "@/components/patterns/four-layers/four-layers.demo";
import { GlassClayDemo } from "@/components/patterns/glass-clay/glass-clay.demo";
import { GlassmorphismDemo } from "@/components/patterns/glassmorphism/glassmorphism.demo";
import { HeroRecipeDemo } from "@/components/patterns/hero-recipe/hero-recipe.demo";
import { LivingTypeDemo } from "@/components/patterns/living-type/living-type.demo";
import { MacroTypographyDemo } from "@/components/patterns/macro-typography/macro-typography.demo";
import { NeoBrutalismDemo } from "@/components/patterns/neo-brutalism/neo-brutalism.demo";
import { SocialStripDemo } from "@/components/patterns/social-strip/social-strip.demo";
import { SpotlightHoverDemo } from "@/components/patterns/spotlight-hover/spotlight-hover.demo";
import { SustainableWebDemo } from "@/components/patterns/sustainable-web/sustainable-web.demo";
import { TactileMinimalismDemo } from "@/components/patterns/tactile-minimalism/tactile-minimalism.demo";
import type { ComponentType } from "react";

/**
 * Реестр сцен паттернов: `components/patterns/<id>/<id>.demo.tsx`.
 *
 * Ручной список: сцен паттернов мало, а генератор ради них дороже поддержки.
 * Папка без записи здесь просто не попадёт на страницу. Хранится компонент, а
 * не функция-обёртка: `demo()` ломается на клиентских сценах вроде песочницы
 * слоёв — вызывать клиентский компонент из серверного кода нельзя.
 */
export const patternDemos: Record<string, ComponentType<{ compact?: boolean }>> = {
  "macro-typography": MacroTypographyDemo,
  editorial: EditorialDemo,
  glassmorphism: GlassmorphismDemo,
  "tactile-minimalism": TactileMinimalismDemo,
  "aurora-background": AuroraBackgroundDemo,
  "dark-glow": DarkGlowDemo,
  "spotlight-hover": SpotlightHoverDemo,
  "sustainable-web": SustainableWebDemo,
  "cinematic-scrollytelling": CinematicScrollytellingDemo,
  "living-type": LivingTypeDemo,
  "four-layers": FourLayersDemo,
  "glass-clay": GlassClayDemo,
  "clean-design-2": CleanDesign2Demo,
  "neo-brutalism": NeoBrutalismDemo,
  "hero-recipe": HeroRecipeDemo,
  "social-strip": SocialStripDemo,
  "accent-card": AccentCardDemo,
};
