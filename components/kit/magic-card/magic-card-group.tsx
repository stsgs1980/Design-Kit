"use client";

import type { PointerEvent, ReactElement, ReactNode } from "react";
import { useRef } from "react";

/** Пропсы группы карточек с общим прожектором. */
export type MagicCardGroupProps = {
  className?: string;
  children: ReactNode;
};

/**
 * Сетка карточек с общим прожектором.
 *
 * Референс (Cruip, Spotlight Card Hover) считает позицию курсора один раз на
 * контейнер и раздаёт её всем карточкам: поэтому при наведении подсвечиваются
 * рамки соседей, а не только той карточки, где стоит курсор. Карточка без группы
 * работает сама, но такой картина не даст.
 *
 * Карточки с `always` группа пропускает: их пятно стоит на своей стартовой
 * позиции и не гаснет, когда курсор ушёл на соседа. Иначе демо-сцена в каталоге
 * после первого же движения мыши теряла вторую половину приёма — кольцо.
 */
export function MagicCardGroup({ className, children }: MagicCardGroupProps): ReactElement {
  const ref = useRef<HTMLDivElement>(null);

  const onPointerMove = (event: PointerEvent<HTMLDivElement>): void => {
    const box = ref.current;

    if (!box || event.pointerType === "touch") {
      return;
    }

    for (const card of box.querySelectorAll<HTMLElement>("[data-magic]:not([data-magic-always])")) {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      card.style.setProperty("--my", `${event.clientY - rect.top}px`);
    }
  };

  return (
    <div ref={ref} onPointerMove={onPointerMove} className={className}>
      {children}
    </div>
  );
}
