import { DemoFrame } from "@/components/kit/_shared/demo-frame";
import { ProgressiveBlur } from "@/components/kit/progressive-blur/progressive-blur";
import type { ReactElement } from "react";

const ROWS = [
  "terminal-demo.tsx",
  "diff-demo.tsx",
  "actions.ts",
  "review.tsx",
  "telemetry.ts",
  "index.ts",
  "registry.ts",
  "manifest.ts",
];

/**
 * Демо-сцена: список продолжается под размытием.
 *
 * Восемь строк, а не шесть: при четырёх видимых строках переход читается как
 * «список кончился», а смысл эффекта — показать, что контента больше.
 */
export function ProgressiveBlurDemo(): ReactElement {
  return (
    <DemoFrame data-scene="blur" className="items-stretch justify-start">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,var(--gradient-primary),transparent_70%)] opacity-20"
      />
      <ol className="relative flex w-full flex-col gap-0 px-6 py-3 font-mono text-[11px] leading-[1.8] text-muted-foreground">
        {ROWS.map((row) => (
          <li key={row} className="flex items-center gap-2">
            <span aria-hidden className="h-1 w-1 rounded-full bg-current" />
            {row}
          </li>
        ))}
      </ol>
      <ProgressiveBlur direction="bottom" className="h-28" blur={8} />
    </DemoFrame>
  );
}
