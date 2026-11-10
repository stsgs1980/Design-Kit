import { cn } from "@/lib/utils";
import Link from "next/link";
import type { ReactElement } from "react";

/** Один шаг маршрута: куда ведёт и как подписан. */
export type Crumb = {
  href: string;
  label: string;
};

/** Пропсы навигационной цепочки. */
export type CrumbNavProps = {
  /** Шаги маршрута по порядку: от общего к текущему. */
  items: Crumb[];
  /** Подпись текущей страницы: не ссылка, а состояние «вы здесь». */
  current?: string;
  /**
   * Главный выход со страницы: куда вернуться, а не «где я».
   *
   * Ставится первым и читается как кнопка: со вторичных страниц (стены кита и
   * паттернов) человеку нужен именно возврат в каталог, а не цепочка разделов.
   */
  back?: Crumb;
  className?: string;
};

/**
 * Цепочка маршрута в шапке внутренних страниц.
 *
 * Слева — выход назад (акцентный, с ASCII-стрелкой), дальше сам маршрут и чип
 * текущей страницы. Раньше здесь были серые ссылки вразнобой: по цвету они не
 * отличались от подписей и не читались как навигация.
 */
export function CrumbNav({ items, current, back, className }: CrumbNavProps): ReactElement {
  return (
    <nav aria-label="Маршрут" className={cn("flex flex-wrap items-center gap-x-3 gap-y-2", className)}>
      {back ? (
        <Link
          href={back.href}
          className="inline-flex items-center gap-1.5 rounded-md border border-primary/40 bg-primary/10 px-2.5 py-1 font-mono text-[11px] font-medium text-primary-text transition-colors hover:border-primary hover:bg-primary/15"
        >
          <span aria-hidden>&lt;-</span>
          {back.label}
        </Link>
      ) : null}

      <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">маршрут</span>

        {items.map((item, index) => (
          <span key={item.href} className="flex items-center gap-2">
            {index > 0 ? (
              <span aria-hidden className="font-mono text-[10px] text-border">
                /
              </span>
            ) : null}
            <Link
              href={item.href}
              className="rounded px-1.5 py-0.5 font-mono text-[11px] tracking-[0.04em] text-primary-text underline-offset-4 transition-colors hover:bg-primary/10 hover:underline"
            >
              {item.label}
            </Link>
          </span>
        ))}

        {current ? (
          <span className="flex items-center gap-2">
            <span aria-hidden className="font-mono text-[10px] text-border">
              /
            </span>
            <span
              aria-current="page"
              className="rounded border border-border px-1.5 py-0.5 font-mono text-[11px] tracking-[0.04em] text-foreground"
            >
              {current}
            </span>
          </span>
        ) : null}
      </span>
    </nav>
  );
}
