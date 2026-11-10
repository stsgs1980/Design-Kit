"use client";

import { KitDemo } from "@/components/kit/_shared/kit-demo";
import { getKitEntry, kitSurfaceLabels, kitTechLabels } from "@/lib/kit/manifest";
import type { ReactElement } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/** Где стоит превью: считается от чипа при открытии. */
type Placement = { left: number; top: number; above: boolean };

const WIDTH = 300;
const GAP = 8;
const EDGE = 12;
const ESTIMATE = 320;

/** Считает позицию карточки так, чтобы она не вылезала за экран. */
function placeNear(rect: DOMRect): Placement {
  const left = Math.min(Math.max(EDGE, rect.left), window.innerWidth - WIDTH - EDGE);
  const below = rect.bottom + GAP;
  const above = below + ESTIMATE > window.innerHeight - EDGE;

  return above ? { left, top: Math.max(EDGE, rect.top - GAP), above: true } : { left, top: below, above: false };
}

/**
 * Чип «с чем сочетать»: открывает превью компонента рядом с собой.
 *
 * Раньше такой чип уводил на отдельную страницу — вернуться можно было только
 * кнопкой браузера. Теперь он показывает карточку: живое демо, цена, поверхности
 * и осознанный переход в паспорт. Страница под курсором остаётся на месте.
 */
export function KitPreviewChip({ id, onOpen }: { id: string; onOpen: (id: string) => void }): ReactElement {
  const entry = getKitEntry(id);
  const [placement, setPlacement] = useState<Placement | null>(null);
  const chipRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);

  const close = useCallback((refocus: boolean) => {
    setPlacement(null);
    if (refocus) chipRef.current?.focus();
  }, []);

  const toggle = useCallback(() => {
    const chip = chipRef.current;
    if (!chip) return;
    setPlacement((current) => (current ? null : placeNear(chip.getBoundingClientRect())));
  }, []);

  useEffect(() => {
    if (!placement) return;

    const onKey = (event: KeyboardEvent): void => {
      if (event.key === "Escape") close(true);
    };
    const onPointer = (event: PointerEvent): void => {
      const target = event.target as Node;
      if (popRef.current?.contains(target) || chipRef.current?.contains(target)) return;
      close(false);
    };
    // Прокрутка не закрывает превью, а переставляет: закрытие на первом же
    // scroll-событии ловило собственный скролл браузера к чипу и карточка мигала.
    const follow = (): void => {
      const chip = chipRef.current;
      if (!chip) return;

      const rect = chip.getBoundingClientRect();
      const away = rect.bottom < 0 || rect.top > window.innerHeight;

      setPlacement((current) => (current && !away ? placeNear(rect) : null));
    };

    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    window.addEventListener("scroll", follow, { passive: true, capture: true });
    window.addEventListener("resize", follow);

    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("scroll", follow, true);
      window.removeEventListener("resize", follow);
    };
  }, [placement, close]);

  if (!entry) return <span className="font-mono text-[11px] text-muted-foreground">{id}</span>;

  const open = placement !== null;

  return (
    <>
      <button
        ref={chipRef}
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-haspopup="dialog"
        className={
          open
            ? "inline-flex items-center gap-1 rounded-full border border-primary bg-primary/10 px-2.5 py-0.5 font-mono text-[11px] text-primary-text"
            : "inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-0.5 font-mono text-[11px] text-foreground/85 transition-colors hover:border-primary/50 hover:text-primary-text"
        }
      >
        {entry.id}
        <span aria-hidden className="text-[9px] opacity-60">
          +
        </span>
      </button>

      {placement
        ? createPortal(
            <div
              ref={popRef}
              role="dialog"
              aria-label={`Превью: ${entry.ru}`}
              style={{
                left: placement.left,
                top: placement.top,
                width: WIDTH,
                transform: placement.above ? "translateY(-100%)" : undefined,
              }}
              className="fixed z-50 flex flex-col gap-2 rounded-xl border border-border bg-card p-3 shadow-2xl"
            >
              <div className="flex items-baseline gap-2">
                <span className="text-[13px] font-semibold">{entry.ru}</span>
                <span className="font-mono text-[11px] text-muted-foreground">{entry.name}</span>
              </div>

              <div className="pointer-events-none h-24 overflow-hidden rounded-lg border border-border">
                <KitDemo id={entry.id} />
              </div>

              <p className="text-xs leading-relaxed text-muted-foreground">{entry.what}</p>

              <p className="font-mono text-[10px] leading-relaxed text-muted-foreground">
                {kitTechLabels[entry.tech]} · {entry.cost.js === "0" ? "0 JS" : `${entry.cost.js} JS`}
                <br />
                {entry.surfaces.map((surface) => kitSurfaceLabels[surface] ?? surface).join(" · ")}
              </p>

              <div className="flex items-center justify-between gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => {
                    onOpen(entry.id);
                    close(true);
                  }}
                  className="rounded-md bg-foreground px-2.5 py-1 text-[11px] font-medium text-background"
                >
                  открыть паспорт <span aria-hidden>-&gt;</span>
                </button>
                <span className="font-mono text-[10px] text-muted-foreground">Esc — закрыть</span>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
