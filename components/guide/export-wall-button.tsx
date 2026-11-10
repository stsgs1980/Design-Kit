"use client";

import { useCallback } from "react";

import { buildExportMd } from "@/lib/export/build-md";

/**
 * Кнопка выгрузки стены: скачивает MD из переданных id.
 */
export function ExportWallButton({
  kitIds,
  patternIds,
  label,
}: {
  kitIds?: string[];
  patternIds?: string[];
  label: string;
}): React.ReactElement {
  const onClick = useCallback(() => {
    const md = buildExportMd({ kit: kitIds ?? [], patterns: patternIds ?? [] });
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const isSandboxed = window.top !== window.self;
    if (isSandboxed) {
      const opened = window.open(url, "_blank", "noopener");
      if (!opened) {
        void navigator.clipboard?.writeText(md).catch(() => undefined);
        window.alert(
          "Скачивание заблокировано песочницей превью. Открой превью в новой вкладке (иконка внешней ссылки) и нажми снова, или «Копировать MD».",
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
  }, [kitIds, patternIds]);

  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-border bg-card px-3 py-1.5 font-mono text-[11px] text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
    >
      {label}
    </button>
  );
}
