import { patternDemos } from "@/components/patterns/_shared/registry";
import type { ReactElement } from "react";

/**
 * Сцена паттерна по его id; `null`, если сцены нет.
 *
 * Компонент рендерится как компонент, а не вызывается функцией: часть сцен
 * клиентские (песочница слоёв держит состояние), а клиентский компонент нельзя
 * вызвать из серверного кода напрямую.
 */
export function PatternDemo({ id, compact = false }: { id: string; compact?: boolean }): ReactElement | null {
  const Demo = patternDemos[id];

  return Demo ? <Demo compact={compact} /> : null;
}
