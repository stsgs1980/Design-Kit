import { DemoFrame } from "@/components/kit/_shared/demo-frame";
import { GlyphMatrix } from "@/components/kit/glyph-matrix/glyph-matrix";
import type { ReactElement } from "react";

/**
 * Демо-сцена: падающие колонки на тёмной подложке.
 *
 * Светлые глифы на светлом фоне читались как «текстовая сетка»; на тёмной
 * подложке видно именно падение и хвост.
 */
export function GlyphMatrixDemo(): ReactElement {
  return (
    <DemoFrame data-scene="glyph" tone="dark">
      <GlyphMatrix glyphs="01+*/<>=" cellSize={12} mutationRate={0.05} color="#2cd5ff" />
    </DemoFrame>
  );
}
