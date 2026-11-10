import { KitDemo } from "@/components/kit/_shared/kit-demo";
import { kitTechLabels, type KitEntry } from "@/lib/kit/manifest";
import Link from "next/link";
import type { ReactElement } from "react";

/** Карточка компонента в индексе кита. */
export function KitCard({ entry }: { entry: KitEntry }): ReactElement {
  return (
    <Link
      href={`/kit/${entry.id}`}
      className="group flex min-w-0 flex-col gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:border-foreground/20"
    >
      <div className="min-w-0 overflow-hidden rounded-lg">
        <KitDemo id={entry.id} />
      </div>

      <div className="flex items-baseline justify-between gap-3 px-1">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{entry.ru}</p>
          <p className="truncate font-mono text-[11px] text-muted-foreground">{entry.name}</p>
        </div>
        <span className="shrink-0 rounded-full border border-border px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
          {kitTechLabels[entry.tech]}
        </span>
      </div>

      <p className="px-1 text-xs text-muted-foreground">
        {entry.cost.js === "0" ? "ноль JS" : `${entry.cost.js} JS`} · движение: {entry.cost.motion}
      </p>
    </Link>
  );
}
