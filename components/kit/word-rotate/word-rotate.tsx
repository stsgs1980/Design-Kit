"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { ReactElement } from "react";
import { useEffect, useState } from "react";

/** Пропсы ротации слов. */
export type WordRotateProps = {
  /** Слова по кругу: первое видно сразу. */
  words: string[];
  /** Пауза между сменами в миллисекундах. */
  interval?: number;
  /**
   * Выравнивание слова внутри слота. По умолчанию `center`: слот шириной в
   * самое длинное слово, и центрирование делит запас пополам — в предложении
   * это читается как обычные пробелы, а не как дыра после слова.
   */
  align?: "start" | "center";
  className?: string;
};

/**
 * WordRotate — слово в строке меняется по кругу без скачка высоты.
 *
 * Контейнер держит `inline-grid`: самое длинное слово задаёт ширину, поэтому
 * соседний текст не прыгает. При reduced-motion остаётся первое слово —
 * подмена контента без спроса дезориентирует.
 */
export function WordRotate({ words, interval = 2400, align = "center", className }: WordRotateProps): ReactElement {
  const [index, setIndex] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion || words.length < 2) return;
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % words.length), interval);
    return () => window.clearInterval(timer);
  }, [interval, reduceMotion, words.length]);

  return (
    <span
      className={cn(
        "relative inline-grid overflow-hidden align-bottom",
        align === "center" ? "justify-items-center" : "justify-items-start",
        className,
      )}
    >
      {/* невидимые копии держат ширину по самому длинному слову */}
      {words.map((word) => (
        <span key={word} aria-hidden className="invisible col-start-1 row-start-1">
          {word}
        </span>
      ))}

      <AnimatePresence initial={false}>
        <motion.span
          key={words[index]}
          initial={{ y: "1em", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-1em", opacity: 0 }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.26, ease: "easeOut" }}
          className="col-start-1 row-start-1"
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
