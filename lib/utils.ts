import { mergeClasses } from "@/lib/tailwind-merge";

/**
 * cn: склейка классов с разрешением конфликтов Tailwind (clsx + tailwind-merge,
 * без зависимости — своя узкая таблица семейств в `lib/tailwind-merge.ts`).
 *
 * Последний класс побеждает: потребитель может переопределить базовую раскладку
 * компонента. Раньше побеждал порядок правил в собранном CSS — то есть случай.
 */
export type ClassValue =
  string | number | null | undefined | false | Record<string, boolean | undefined | null> | ClassValue[];

/** Склейка классов с разрешением конфликтов Tailwind. */
export function cn(...inputs: ClassValue[]): string {
  const out: string[] = [];

  const walk = (value: ClassValue): void => {
    if (!value) return;
    if (typeof value === "string" || typeof value === "number") {
      out.push(String(value));
      return;
    }
    if (Array.isArray(value)) {
      value.forEach(walk);
      return;
    }
    if (typeof value === "object") {
      for (const [key, enabled] of Object.entries(value)) {
        if (enabled) out.push(key);
      }
    }
  };

  inputs.forEach(walk);
  return mergeClasses(out.join(" "));
}

/** Ожидание в миллисекундах. */
export const sleep = (ms: number): Promise<void> => new Promise<void>((resolve) => setTimeout(resolve, ms));
