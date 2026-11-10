import { cn } from "@/lib/utils";
import type { ReactElement, ReactNode } from "react";

/** Пропсы подсветки фрагмента текста. */
export type TextHighlighterProps = {
  children: ReactNode;
  /** Цвет заливки: по умолчанию акцент из палитры. */
  color?: string;
  className?: string;
};

/**
 * TextHighlighter — маркер, который «проводится» под словом сам.
 *
 * Ноль JS: заливка — слой под текстом, который «проводится» по ключевым кадрам.
 * Так подсветка не ломает перенос строк, в отличие от плашки во всю строку.
 *
 * `isolate` на обёртке обязателен: без него `-z-10` у заливки отправляет её за
 * фон родителя, и на любой карточке с фоном маркер просто исчезает.
 */
export function TextHighlighter({ children, color, className }: TextHighlighterProps): ReactElement {
  return (
    <span className={cn("kit-highlight relative isolate inline-block", className)}>
      <span
        aria-hidden
        className="absolute inset-x-0 bottom-[0.08em] -z-10 h-[0.55em] rounded-[2px]"
        style={{ backgroundColor: color ?? "color-mix(in oklab, var(--primary) 22%, transparent)" }}
      />
      {children}
    </span>
  );
}
