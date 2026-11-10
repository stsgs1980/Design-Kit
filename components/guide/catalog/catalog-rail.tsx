"use client";

import type { ReactElement } from "react";

/** Пункт сайдбара: id для выбора, подпись, короткий бейдж и его тон. */
export type RailItem = { id: string; label: string; badge?: string; tone?: "warm" };

/** Группа сайдбара: заголовок крупнее подписей, пункты под ним. */
export type RailGroup = { key: string; label: string; items: RailItem[] };

/** Один пункт списка: имя и бейдж цены или вердикта. */
function RailButton({
  item,
  active,
  onSelect,
  exportChecked,
  onToggleExport,
}: {
  item: RailItem;
  active: boolean;
  onSelect: () => void;
  exportChecked?: boolean;
  onToggleExport?: (id: string) => void;
}): ReactElement {
  return (
    <div className="flex items-center gap-1.5">
      {onToggleExport ? (
        <input
          type="checkbox"
          aria-label={`Выгрузить ${item.label}`}
          checked={exportChecked ?? false}
          onChange={() => onToggleExport(item.id)}
          onClick={(event) => event.stopPropagation()}
          className="size-3.5 shrink-0 rounded border-border bg-card accent-foreground"
        />
      ) : null}
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={active}
        data-item={item.id}
        className={
          active
            ? "flex w-full items-baseline justify-between gap-2 rounded-md bg-foreground/[0.07] px-2.5 py-1.5 text-left text-[13px] font-medium text-foreground"
            : "flex w-full items-baseline justify-between gap-2 rounded-md px-2.5 py-1.5 text-left text-[13px] text-muted-foreground transition-colors hover:bg-foreground/[0.04] hover:text-foreground"
        }
      >
        <span className="truncate">{item.label}</span>
        {item.badge ? (
          <span
            className={
              item.tone === "warm"
                ? "shrink-0 font-mono text-[10px] text-warm"
                : "shrink-0 font-mono text-[10px] text-muted-foreground"
            }
          >
            {item.badge}
          </span>
        ) : null}
      </button>
    </div>
  );
}

/**
 * Сайдбар каталога: один и тот же список работает для кита и для паттернов.
 *
 * До `lg` вертикальный список из 22 строк отодвигал бы паспорт на два
 * экрана вниз, поэтому на узком экране он сжимается в прокручиваемую ленту чипов.
 */
export function CatalogRail({
  groups,
  activeId,
  onSelect,
  exportSelected,
  onToggleExport,
}: {
  groups: RailGroup[];
  activeId: string;
  onSelect: (id: string) => void;
  exportSelected?: Set<string>;
  onToggleExport?: (id: string) => void;
}): ReactElement {
  const items = groups.flatMap((group) => group.items);

  return (
    <>
      <div className="-mx-6 flex [scrollbar-width:none] gap-1.5 overflow-x-auto px-6 pb-1 lg:hidden">
        {items.map((item) => {
          const active = item.id === activeId;

          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={active}
              data-item={item.id}
              onClick={() => onSelect(item.id)}
              className={
                active
                  ? "shrink-0 rounded-full bg-foreground px-3 py-1.5 text-[12px] font-medium whitespace-nowrap text-background"
                  : "shrink-0 rounded-full border border-border px-3 py-1.5 text-[12px] whitespace-nowrap text-muted-foreground"
              }
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <aside className="hidden lg:sticky lg:top-6 lg:block lg:self-start">
        <nav
          aria-label="Список каталога"
          className="flex max-h-none [scrollbar-width:thin] [scrollbar-color:var(--border)_transparent] [scrollbar-gutter:stable] flex-col gap-4 overflow-y-auto pr-1 lg:max-h-[calc(100vh-4rem)] [&::-webkit-scrollbar]:w-[2px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-transparent"
        >
          {groups.map((group) => (
            <div key={group.key} className="flex flex-col gap-0.5">
              <p className="flex items-baseline gap-1.5 px-2.5 pt-3 pb-2 text-[15px] font-semibold tracking-tight text-foreground">
                {group.label}
                <span className="font-mono text-[10px] font-normal text-muted-foreground">{group.items.length}</span>
              </p>
              {group.items.map((item) => (
                <RailButton
                  key={item.id}
                  item={item}
                  active={item.id === activeId}
                  onSelect={() => onSelect(item.id)}
                  exportChecked={exportSelected?.has(item.id)}
                  onToggleExport={onToggleExport}
                />
              ))}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
