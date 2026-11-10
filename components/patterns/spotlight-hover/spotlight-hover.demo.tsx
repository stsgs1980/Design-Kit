import { MagicCard } from "@/components/kit/magic-card/magic-card";
import { MagicCardGroup } from "@/components/kit/magic-card/magic-card-group";
import { PatternFrame } from "@/components/patterns/_shared/pattern-frame";
import { kitStats } from "@/lib/kit/manifest";
import { patternStats } from "@/lib/patterns/manifest";
import type { ReactElement } from "react";

const CARDS = [
  { id: "kit", ru: "Кит", note: `${kitStats().total} компонента`, spot: true },
  { id: "patterns", ru: "Паттерны", note: `${patternStats().total} приёмов`, spot: false },
  { id: "rules", ru: "Правила", note: "12 строк", spot: false },
];

/**
 * Сцена паттерна «прожектор».
 *
 * Три карточки в общей группе: координаты курсора считает контейнер и раздаёт
 * всем, поэтому вместе с пятном загораются рамки соседей — как в референсе
 * Cruip. Первая карточка показывает оба слоя сразу (`always`), иначе в статике
 * сцена неотличима от обычной рамки.
 *
 * Фона-сетки здесь нет намеренно: клетка конкурирует со светом и превращает
 * прожектор в подсветку сетки. Приём показывает себя на пустом фоне.
 */
export function SpotlightHoverDemo(): ReactElement {
  return (
    <PatternFrame data-pattern="spotlight" tone="dark" align="center" className="justify-center p-5">
      <MagicCardGroup className="relative grid w-full grid-cols-3 gap-2.5">
        {CARDS.map((card) => (
          <MagicCard
            key={card.id}
            always={card.spot}
            radius={84}
            gradient="rgb(44 213 255 / 0.65)"
            style={{ "--mx": "50%", "--my": "40%" } as React.CSSProperties}
            className="flex h-28 flex-col justify-end gap-0.5 border-white/15 bg-white/[0.07] p-3"
          >
            <span className="relative text-[13px] font-medium text-white">{card.ru}</span>
            <span className="relative font-mono text-[10px] text-white/55">{card.note}</span>
          </MagicCard>
        ))}
      </MagicCardGroup>
    </PatternFrame>
  );
}
