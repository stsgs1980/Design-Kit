import { kitCostLabel } from "@/components/kit/_shared/kit-cost";
import { kitEntries, type KitEntry } from "@/lib/kit/manifest";
import Link from "next/link";
import type { ReactElement } from "react";

/** Пропсы подписи «из кита». */
export type KitStampProps = {
  /** id компонентов, из которых собрана секция: порядок сохраняется. */
  ids: string[];
  /** Подпись слева от чипов. */
  label?: string;
  className?: string;
};

const byId = new Map(kitEntries.map((entry) => [entry.id, entry]));

/** Чип компонента: русское имя и цена в JS, ведёт на страницу демо. */
function StampChip({ entry }: { entry: KitEntry }): ReactElement {
  return (
    <Link
      href={`/kit/${entry.id}`}
      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/70 px-2.5 py-1 text-[11px] text-foreground/80 transition-colors hover:border-foreground/25 hover:text-foreground"
    >
      {entry.ru}
      <span className="font-mono text-[10px] text-muted-foreground">{kitCostLabel(entry)}</span>
    </Link>
  );
}

/**
 * Подпись секции: из каких компонентов кита она собрана.
 *
 * Заменяет ручные подписи «имя · цена»: данные берутся из манифеста, поэтому
 * новый чип не требует правок разметки, а ссылка ведёт на живое демо.
 */
export function KitStamp({ ids, label = "из кита", className }: KitStampProps): ReactElement | null {
  const entries = ids.map((id) => byId.get(id)).filter((entry): entry is KitEntry => Boolean(entry));
  if (entries.length === 0) return null;

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className ?? ""}`}>
      <span className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">{label}</span>
      {entries.map((entry) => (
        <StampChip key={entry.id} entry={entry} />
      ))}
    </div>
  );
}
