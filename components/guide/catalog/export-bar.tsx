"use client";

import { useCallback, useState } from "react";

import type { ExportSelection } from "@/components/guide/catalog/use-export-selection";
import { copyText } from "@/lib/clipboard";
import { buildExportMd } from "@/lib/export/build-md";

/**
 * Липкая панель выгрузки: показывает число выбранного и даёт MD.
 */
export function ExportBar({ selection }: { selection: ExportSelection }): React.ReactElement | null {
  const [copied, setCopied] = useState(false);
  const count = selection.selected.length;

  const md = buildExportMd({ kit: selection.kit, patterns: selection.patterns });

  const onCopy = useCallback(async () => {
    await copyText(md);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }, [md]);

  const onDownload = useCallback(() => {
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const isSandboxed = window.top !== window.self;
    // В песочнице E2B iframe без allow-downloads клик по a[download] молча режется —
    // открываем Blob в новой вкладке как fallback, там уже Ctrl+S сработает.
    if (isSandboxed) {
      const opened = window.open(url, "_blank", "noopener");
      if (!opened) {
        // если popup заблокирован — хотя бы копируем в буфер и подсказываем
        void navigator.clipboard?.writeText(md).catch(() => undefined);
        window.alert(
          "Скачивание заблокировано песочницей превью. Открой превью в новой вкладке (иконка внешней ссылки над превью) и нажми Скачать снова, или используй «Копировать MD».",
        );
      }
      window.setTimeout(() => URL.revokeObjectURL(url), 4000);
      return;
    }
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "kit-export.md";
    anchor.style.display = "none";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, [md]);

  if (count === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-6 z-40 flex justify-center px-4">
      <div className="flex w-full max-w-[920px] items-center justify-between gap-4 rounded-2xl border border-border bg-card px-4 py-3 shadow-[0_12px_32px_rgb(0_0_0/.5)]">
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-foreground">
            Выбрано {count} <span className="font-normal text-muted-foreground">· {selection.selected.join(", ")}</span>
          </p>
          <p className="font-mono text-[11px] text-muted-foreground">
            ссылка шарится: ?export={selection.selected.join(",")}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={selection.clear}
            className="rounded-full px-3 py-1.5 font-mono text-[11px] text-muted-foreground transition-colors hover:text-foreground"
          >
            очистить
          </button>
          <button
            type="button"
            onClick={onCopy}
            className="rounded-full border border-border bg-card px-3.5 py-1.5 text-[13px] font-medium text-foreground transition-colors hover:border-foreground/30"
          >
            {copied ? "скопировано" : "Копировать MD"}
          </button>
          <button
            type="button"
            onClick={onDownload}
            className="rounded-full bg-foreground px-3.5 py-1.5 text-[13px] font-medium text-background"
          >
            Скачать kit-export.md
          </button>
        </div>
      </div>
    </div>
  );
}
