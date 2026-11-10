import { DemoFrame } from "@/components/kit/_shared/demo-frame";
import { MagicCard } from "@/components/kit/magic-card/magic-card";
import type { ReactElement } from "react";

/**
 * Демо-сцена: пятно стоит в карточке и уезжает за курсором.
 *
 * Пока курсор не пришёл, пятно видно в верхней трети: иначе в каталоге плитка
 * неотличима от обычной карточки с рамкой.
 */
export function MagicCardDemo(): ReactElement {
  return (
    <DemoFrame data-scene="magic" className="gap-3">
      <MagicCard
        always
        className="flex h-20 w-[120px] items-center justify-center text-center text-[11px] text-muted-foreground"
        style={{ "--mx": "50%", "--my": "28%" } as React.CSSProperties}
      >
        <span className="relative">пятно cold</span>
      </MagicCard>
      <MagicCard
        always
        tone="warm"
        className="flex h-20 w-[120px] items-center justify-center text-center text-[11px] text-muted-foreground"
        style={{ "--mx": "50%", "--my": "28%" } as React.CSSProperties}
      >
        <span className="relative">пятно warm</span>
      </MagicCard>
    </DemoFrame>
  );
}
