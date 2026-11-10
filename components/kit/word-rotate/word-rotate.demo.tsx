import { DemoFrame } from "@/components/kit/_shared/demo-frame";
import { WordRotate } from "@/components/kit/word-rotate/word-rotate";
import type { ReactElement } from "react";

const WORDS = ["каталога", "справочника", "кита", "набора"];

/**
 * Демо-сцена: слово меняется по кругу, ширина не прыгает.
 *
 * Слова — из словаря страницы: прежний набор («агент делает ревью») остался от
 * вымышленного продукта, которого в справочнике нет.
 */
export function WordRotateDemo(): ReactElement {
  return (
    <DemoFrame data-scene="rotate">
      <span className="flex flex-wrap items-baseline justify-center gap-2 text-lg font-semibold tracking-tight">
        интерфейс для
        <WordRotate words={WORDS} interval={1600} align="center" className="text-primary-text" />
      </span>
    </DemoFrame>
  );
}
