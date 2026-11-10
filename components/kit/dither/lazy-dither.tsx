"use client";

import type { ReactElement } from "react";

import { cn } from "@/lib/utils";
import { useInView } from "framer-motion";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

/**
 * Тяжёлое демо не должно попадать в первый бандл:
 *   dynamic({ ssr: false })  → отдельный чанк, который не рендерится на сервере
 *   useInView(rootMargin)    → чанк грузится только у подъезда к вьюпорту
 *   rAF + opacity transition → мягкое появление вместо «мигания» canvas
 */
const Dither = dynamic(() => import("./dither").then((m) => m.Dither), {
  ssr: false,
  loading: () => null,
});

type LazyDitherProps = React.ComponentProps<typeof Dither> & {
  className?: string;
};

/** Клиентская обёртка: Dither грузится только при появлении в вьюпорте. */
export function LazyDither({ className, ...props }: LazyDitherProps): ReactElement {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "200px", once: true });
  const [faded, setFaded] = useState(false);

  useEffect(() => {
    if (!inView) return;
    const id = requestAnimationFrame(() => setFaded(true));
    return () => cancelAnimationFrame(id);
  }, [inView]);

  return (
    <div ref={ref} className={cn("relative h-full w-full", className)}>
      {/* CSS-подложка: показывается до монтирования WebGL и если WebGL недоступен */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, color-mix(in oklab, var(--muted) 10%, transparent), color-mix(in oklab, var(--muted) 35%, transparent), color-mix(in oklab, var(--muted) 10%, transparent))",
        }}
      />

      {inView && (
        <div className={cn("absolute inset-0 transition-opacity duration-500", faded ? "opacity-100" : "opacity-0")}>
          <Dither {...props} />
        </div>
      )}
    </div>
  );
}
