import { cn } from "@/lib/utils";
import type { ReactElement, ReactNode } from "react";

/**
 * Атом «градиентный текст».
 * В шаблоне: bg-radial from-gradient-primary to-gradient-secondary/40 bg-clip-text.
 * Здесь — тем же эффектом, но инлайново (радиальный градиент из двух токенов).
 */
export function GradientText({
  children,
  className,
  animated = false,
}: {
  children: ReactNode;
  className?: string;
  /** Гонять градиент по буквам: тот же ключевой кадр, что у ShinyText. */
  animated?: boolean;
}): ReactElement {
  return (
    <span
      className={cn("inline-block", animated && "kit-gradient-animated", className)}
      style={{
        backgroundImage:
          "radial-gradient(circle at 50% 50%, var(--gradient-primary) 0%, color-mix(in oklab, var(--gradient-secondary) 40%, transparent) 100%)",
        backgroundSize: animated ? "220% 100%" : undefined,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
      }}
    >
      {children}
    </span>
  );
}
