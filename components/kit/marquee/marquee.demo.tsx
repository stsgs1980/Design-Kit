import { DemoFrame } from "@/components/kit/_shared/demo-frame";
import { Marquee } from "@/components/kit/marquee/marquee";
import type { ReactElement } from "react";

const ROWS = ["ноль JS", "одна палитра", "без библиотек", "12 без JS"];
const TECHS = ["CSS", "SVG", "Canvas 2D", "WebGL"];

/** Чип ленты: точка плюс слово, размер как у подписи в паспорте. */
function Chip({ label }: { label: string }): ReactElement {
  return (
    <span className="flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-2 text-[13px] whitespace-nowrap text-foreground/85">
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-primary" />
      {label}
    </span>
  );
}

/**
 * Демо-сцена: две ленты в разные стороны.
 *
 * Одна полоса в пустой плите читалась как «анимация ради анимации». Две
 * встречные ленты показывают приём: движение несинхронно, а пауза по наведению
 * останавливает обе — это и есть смысл подписи.
 */
export function MarqueeDemo(): ReactElement {
  return (
    <DemoFrame data-scene="marquee" className="flex-col justify-center gap-3">
      <Marquee duration={22} className="w-full">
        {ROWS.map((row) => (
          <Chip key={row} label={row} />
        ))}
      </Marquee>
      <Marquee duration={31} reverse className="w-full">
        {TECHS.map((tech) => (
          <Chip key={tech} label={tech} />
        ))}
      </Marquee>
      <span className="font-mono text-[9.5px] tracking-[0.12em] text-muted-foreground uppercase">
        наведение останавливает обе
      </span>
    </DemoFrame>
  );
}
