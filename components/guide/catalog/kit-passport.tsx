"use client";

import { KitPreviewChip } from "@/components/guide/catalog/kit-preview";
import { KitDemo } from "@/components/kit/_shared/kit-demo";
import { copyText } from "@/lib/clipboard";
import { buildExportMd } from "@/lib/export/build-md";
import {
  kitCategoryLabels,
  kitSurfaceLabels,
  kitTechLabels,
  kitVerdictLabels,
  type KitEntry,
} from "@/lib/kit/manifest";
import type { ReactElement } from "react";
import { useCallback, useState } from "react";

/** Подпись раздела паспорта: мелкий моно-капс, как в остальном справочнике. */
function SectionLabel({ children }: { children: React.ReactNode }): ReactElement {
  return <h3 className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase">{children}</h3>;
}

/** Строка фактов: подпись и значение через волосяную линию. */
function Fact({ label, children }: { label: string; children: React.ReactNode }): ReactElement {
  return (
    <div className="flex flex-col gap-1 border-t border-border py-3">
      <dt className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase">{label}</dt>
      <dd className="text-sm text-foreground/85">{children}</dd>
    </div>
  );
}

/** Список строк в карточке: состояния, доступность, места. */
function CardList({ title, items, mono }: { title: string; items: string[]; mono?: boolean }): ReactElement {
  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <SectionLabel>{title}</SectionLabel>
      <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
        {items.map((item) => (
          <li key={item} className={mono ? "font-mono" : undefined}>
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * Паспорт компонента кита: что это, живое демо, факты, пропсы, код и контекст.
 *
 * Пропсы стоят сразу за фактами, а не на отдельной странице «демо и пропсы»:
 * читателю нужен один экран на компонент, а не маршрут из двух переходов.
 */
export function KitPassport({ entry, onOpen }: { entry: KitEntry; onOpen: (id: string) => void }): ReactElement {
  const [copied, setCopied] = useState(false);
  const onCopy = useCallback(async () => {
    const md = buildExportMd({ kit: [entry.id], patterns: [] });
    await copyText(md);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }, [entry.id]);

  return (
    <article id={`c-${entry.id}`} className="flex min-w-0 scroll-mt-24 flex-col gap-6">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">{entry.ru}</h2>
        <span className="font-mono text-sm text-muted-foreground">{entry.name}</span>
        <span className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={onCopy}
            className="rounded-full border border-border bg-card px-2.5 py-1 font-mono text-[10px] text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
          >
            {copied ? "скопировано" : "Копировать MD"}
          </button>
          <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
            {kitVerdictLabels[entry.verdict]}
          </span>
        </span>
      </div>

      <p className="max-w-2xl text-base leading-relaxed text-foreground/85">{entry.what}</p>

      <p className="font-mono text-[11px] text-muted-foreground">
        {kitCategoryLabels[entry.category]} · {kitTechLabels[entry.tech]} ·{" "}
        {entry.cost.js === "0" ? "0 JS" : `${entry.cost.js} JS`} · движение: {entry.cost.motion} ·{" "}
        <code>{entry.file}</code>
      </p>

      <div className="overflow-hidden rounded-xl border border-border">
        <KitDemo id={entry.id} />
      </div>

      <dl className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
        <Fact label="куда ставить">
          {entry.surfaces.map((surface) => kitSurfaceLabels[surface] ?? surface).join(" · ")}
        </Fact>
        <Fact label="с чем сочетать">
          {entry.uses.length === 0 ? (
            <span className="text-muted-foreground">самодостаточен</span>
          ) : (
            <span className="flex flex-wrap gap-1.5">
              {entry.uses.map((id) => (
                <KitPreviewChip key={id} id={id} onOpen={onOpen} />
              ))}
            </span>
          )}
        </Fact>
        <Fact label="цена">
          {kitTechLabels[entry.tech]} · {entry.cost.js === "0" ? "0 JS" : `${entry.cost.js} JS`} · движение:{" "}
          {entry.cost.motion}
        </Fact>
        <Fact label="источник">
          {entry.source ? (
            <a
              href={entry.source}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex max-w-full items-baseline gap-1 break-all text-primary-text underline decoration-primary/35 underline-offset-4 transition-colors hover:decoration-primary"
            >
              {entry.source.replace("https://", "")}
              <span aria-hidden className="font-mono text-[10px]">
                -&gt;
              </span>
            </a>
          ) : (
            <span className="text-muted-foreground">собственная реализация, оригинала нет</span>
          )}
        </Fact>
      </dl>

      <section className="flex flex-col gap-2">
        <SectionLabel>пропсы</SectionLabel>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="bg-muted text-[10px] tracking-[0.1em] text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-2.5 font-medium">пропс</th>
                <th className="px-4 py-2.5 font-medium">тип</th>
                <th className="px-4 py-2.5 font-medium">по умолчанию</th>
                <th className="px-4 py-2.5 font-medium">смысл</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {entry.props.map((prop) => (
                <tr key={prop.name}>
                  <td className="px-4 py-2 font-mono text-xs">{prop.name}</td>
                  <td className="px-4 py-2 font-mono text-[11px] text-muted-foreground">{prop.type}</td>
                  <td className="px-4 py-2 font-mono text-[11px] text-muted-foreground">{prop.defaultValue ?? "—"}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">{prop.note ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <SectionLabel>код</SectionLabel>
        <code className="block rounded-lg bg-foreground/[0.05] px-3 py-2 font-mono text-xs [overflow-wrap:anywhere] whitespace-pre-wrap">
          {entry.usage}
        </code>
      </section>

      <div className="grid gap-3 sm:grid-cols-2">
        <CardList title="состояния" items={entry.states} mono />
        <CardList title="доступность" items={entry.a11y} />
        <CardList title="где живёт" items={entry.where} />
        <CardList title="поверхности" items={entry.surfaces.map((surface) => kitSurfaceLabels[surface] ?? surface)} />
      </div>
    </article>
  );
}
