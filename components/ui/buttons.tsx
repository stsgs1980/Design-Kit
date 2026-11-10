import { cn } from "@/lib/utils";
import type { ReactElement, ReactNode } from "react";

/**
 * «Объёмная» кнопка из шаблона: градиент + inset-тени + ring.
 * Все градиенты инлайновые, чтобы не зависеть от версии Tailwind.
 */
export function PrimaryButton({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}): ReactElement {
  return (
    <a
      href={href}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full px-8 py-3 text-base font-medium text-white",
        "ring-2 ring-sky-600 transition-[filter] duration-200 hover:brightness-110",
        "shadow-[0_1px_2px_0_#00000016,0_2px_4px_0_#00000006,inset_0_0_1.5px_#0084D1,inset_0_2.5px_0_#ffffff16,inset_0_0_2.5px_#ffffff08]",
        className,
      )}
      style={{ backgroundImage: "linear-gradient(to bottom, #0ea5e9, #0284c7)" }}
    >
      {children}
    </a>
  );
}

/** Вторичная кнопка: secondary-фон + hairline-бордер. */
export function SecondaryButton({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}): ReactElement {
  return (
    <a
      href={href}
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-full border border-border bg-secondary px-5 text-sm font-medium",
        "text-secondary-foreground transition-colors hover:bg-secondary/70",
        className,
      )}
    >
      {children}
    </a>
  );
}
