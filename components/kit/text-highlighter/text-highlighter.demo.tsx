import { DemoFrame } from "@/components/kit/_shared/demo-frame";
import { TextHighlighter } from "@/components/kit/text-highlighter/text-highlighter";
import type { ReactElement } from "react";

/**
 * Демо-сцена: маркер внутри одной строки.
 *
 * Фраза специально короткая и с `whitespace-nowrap`: в узкой плитке прежний
 * вариант ломался на три строки, и вместо маркера было видно три центрированных
 * обрывка.
 */
export function TextHighlighterDemo(): ReactElement {
  return (
    <DemoFrame data-scene="highlight">
      <p className="px-4 text-center text-base leading-relaxed whitespace-nowrap text-foreground">
        Один <TextHighlighter>акцент</TextHighlighter> на экран
      </p>
    </DemoFrame>
  );
}
