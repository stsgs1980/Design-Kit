"use client";

import { KitPreviewChip } from "@/components/guide/catalog/kit-preview";
import { PatternDemo } from "@/components/patterns/_shared/pattern-demo";
import { copyText } from "@/lib/clipboard";
import { buildExportMd } from "@/lib/export/build-md";
import { getKitEntry } from "@/lib/kit/manifest";
import { patternCategoryLabels, patternVerdictLabels, patternYears, type PatternEntry } from "@/lib/patterns/manifest";
import type { ReactElement } from "react";
import { useCallback, useState } from "react";

/** Заголовок раздела паспорта. */
function Label({ children }: { children: React.ReactNode }): ReactElement {
  return <h3 className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase">{children}</h3>;
}

/** Правила и грабли: два списка, где грабли помечены цветом ошибки. */
function RuleList({ title, items, pitfall }: { title: string; items: string[]; pitfall?: boolean }): ReactElement {
  return (
    <section className="flex flex-col gap-2">
      <Label>{title}</Label>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2.5 text-sm leading-relaxed">
            <span
              aria-hidden
              className={`mt-[7px] size-1 shrink-0 rounded-full ${pitfall ? "bg-destructive/60" : "bg-foreground/40"}`}
            />
            <span className={pitfall ? "text-muted-foreground" : undefined}>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * Паспорт паттерна: пример, когда брать, из чего собран, правила и грабли.
 *
 * Состав ведёт в компоненты кита через превью: правило «паттерн собирается из
 * компонентов» должно проверяться на месте, а не переходом на другую вкладку.
 */
export function PatternPassport({
  entry,
  onOpenKit,
}: {
  entry: PatternEntry;
  onOpenKit: (id: string) => void;
}): ReactElement {
  const [copied, setCopied] = useState(false);
  const onCopy = useCallback(async () => {
    const md = buildExportMd({ kit: [], patterns: [entry.id] });
    await copyText(md);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }, [entry.id]);

  return (
    <article id={`c-${entry.id}`} className="flex min-w-0 scroll-mt-24 flex-col gap-6">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">{entry.name}</h2>
        <span className="font-mono text-sm text-muted-foreground">{entry.latin}</span>
        <span className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={onCopy}
            className="rounded-full border border-border bg-card px-2.5 py-1 font-mono text-[10px] text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
          >
            {copied ? "скопировано" : "Копировать MD"}
          </button>
          <span
            className={
              entry.verdict === "rising"
                ? "rounded-full border border-warm/40 bg-warm/10 px-2 py-0.5 font-mono text-[10px] text-warm"
                : "rounded-full border border-border px-2 py-0.5 font-mono text-[10px] text-muted-foreground"
            }
          >
            {patternVerdictLabels[entry.verdict]}
          </span>
        </span>
      </div>

      <p className="max-w-2xl text-base leading-relaxed text-foreground/85">{entry.summary}</p>

      <p className="font-mono text-[11px] text-muted-foreground">
        {patternCategoryLabels[entry.category]} · {patternYears(entry)} · состав: {entry.composition.length} ·{" "}
        {entry.cost}
      </p>

      <div className="min-w-0 overflow-hidden rounded-xl border border-border">
        <PatternDemo id={entry.id} />
      </div>

      <section className="flex flex-col gap-1">
        <Label>когда брать</Label>
        <p className="max-w-2xl text-sm leading-relaxed text-pretty text-foreground/85">{entry.when}</p>
      </section>

      <section className="flex flex-col gap-2">
        <Label>из чего состоит</Label>
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
          {entry.composition.map((part) => {
            const kitEntry = getKitEntry(part.kit);

            return (
              <li key={part.kit} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5">
                <KitPreviewChip id={part.kit} onOpen={onOpenKit} />
                <span className="text-sm">{kitEntry ? kitEntry.ru : part.kit}</span>
                <span className="ml-auto text-xs text-muted-foreground">{part.role}</span>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="grid gap-6 sm:grid-cols-2">
        <RuleList title="правила" items={entry.rules} />
        <RuleList title="грабли" items={entry.pitfalls} pitfall />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <section className="rounded-xl border border-border bg-card p-4">
          <Label>где уже есть</Label>
          <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
            {entry.where.map((place) => (
              <li key={place}>{place}</li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-border bg-card p-4">
          <Label>оригинал</Label>
          {entry.source ? (
            <a
              href={entry.source}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-2 inline-flex items-baseline gap-1 text-xs text-primary-text underline decoration-primary/35 underline-offset-4 transition-colors hover:decoration-primary"
            >
              {entry.source.replace("https://", "")}
              <span aria-hidden className="font-mono text-[10px]">
                -&gt;
              </span>
            </a>
          ) : (
            <p className="mt-2 text-xs text-muted-foreground">
              {entry.notes ?? "Собственный разбор кита: ссылки на оригинал нет."}
            </p>
          )}
        </section>
      </div>
    </article>
  );
}
