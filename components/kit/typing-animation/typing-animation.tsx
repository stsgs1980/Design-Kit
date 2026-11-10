"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { ReactElement } from "react";
import { useEffect, useRef, useState } from "react";

/** Пропсы печатающегося текста. */
export type TypingAnimationProps = {
  /** Строка, которую нужно «напечатать». */
  text: string;
  /** Задержка между символами в миллисекундах. */
  speed?: number;
  /** Начать после появления в вьюпорте, а не сразу. */
  startOnView?: boolean;
  className?: string;
};

/**
 * TypingAnimation — текст печатается по символу с мигающей кареткой.
 *
 * Каретка — отдельный элемент с CSS-анимацией, поэтому перерисовывается только
 * строка. При reduced-motion текст появляется целиком: анимация декоративная.
 */
export function TypingAnimation({
  text,
  speed = 45,
  startOnView = true,
  className,
}: TypingAnimationProps): ReactElement {
  const ref = useRef<HTMLSpanElement>(null);
  const [typed, setTyped] = useState(startOnView ? "" : text);
  const [done, setDone] = useState(!startOnView);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setTyped(text);
      setDone(true);
      return;
    }

    let index = 0;
    let timer = 0;

    const type = (): void => {
      index += 1;
      setTyped(text.slice(0, index));
      if (index >= text.length) {
        setDone(true);
        return;
      }
      timer = window.setTimeout(type, speed);
    };

    const start = (): void => {
      timer = window.setTimeout(type, 120);
    };

    if (!startOnView) {
      start();
      return () => window.clearTimeout(timer);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          start();
        }
      },
      { threshold: 0.4 },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, [speed, startOnView, text]);

  return (
    <span ref={ref} className={cn("inline-flex items-baseline", className)}>
      <span>{typed}</span>
      {done ? null : (
        <motion.span
          aria-hidden
          className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[0.1em] bg-current"
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      )}
    </span>
  );
}
