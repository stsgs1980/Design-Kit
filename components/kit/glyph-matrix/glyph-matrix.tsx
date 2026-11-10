"use client";

import type { ReactElement } from "react";

import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

/**
 * GlyphMatrix — символы падают колонками, как в старом терминале.
 *
 * Тот же класс стоимости, что FlickeringGrid (Canvas2D), но с текстом:
 *   • каждая колонка — своя «капля»: она движется вниз по одной ячейке за тик,
 *     поэтому движение читается как падение, а не как мерцание сетки;
 *   • след живёт в Float32Array яркостей: каждый тик он гаснет, поэтому за
 *     головой капли тянется хвост;
 *   • mutationRate — доля колонок, в которых одновременно идёт падение;
 *   • fadeBottom и маска гасят низ, чтобы блок стыковался с фоном страницы;
 *   • IntersectionObserver выключает таймер, когда блок ушёл из вьюпорта.
 */
export function GlyphMatrix({
  glyphs = "01·•+*/<>=",
  cellSize = 14,
  mutationRate = 0.04,
  interval = 90,
  fadeBottom = 0.6,
  color = "currentColor",
  className,
  fontSize,
}: {
  glyphs?: string;
  cellSize?: number;
  mutationRate?: number;
  interval?: number;
  fadeBottom?: number;
  color?: string;
  className?: string;
  fontSize?: number;
}): ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const glyphList = Array.from(glyphs);
    const fontPx = fontSize ?? cellSize;
    let dpr = 1;
    let cols = 0;
    let rows = 0;
    let trail = new Float32Array(0);
    let chars = new Uint16Array(0);
    let drops: number[] = [];

    const setup = (): void => {
      const cssWidth = container.clientWidth || 1;
      const cssHeight = container.clientHeight || 1;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.round(cssWidth * dpr);
      canvas.height = Math.round(cssHeight * dpr);
      canvas.style.width = `${cssWidth}px`;
      canvas.style.height = `${cssHeight}px`;

      cols = Math.max(1, Math.floor(cssWidth / cellSize));
      rows = Math.max(1, Math.floor(cssHeight / cellSize));
      trail = new Float32Array(cols * rows);
      chars = new Uint16Array(cols * rows);
      for (let i = 0; i < chars.length; i++) {
        chars[i] = Math.floor(Math.random() * glyphList.length);
      }

      // стартовая раскладка: часть капель уже в пути, иначе первый кадр пустой
      const active = Math.max(2, Math.round(cols * mutationRate * 8));
      drops = Array.from({ length: cols }, () => -1);
      for (let i = 0; i < active; i++) {
        const column = Math.floor(Math.random() * cols);
        drops[column] = Math.floor(Math.random() * rows);
      }
    };

    const draw = (): void => {
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;
      const resolvedColor = color === "currentColor" ? getComputedStyle(canvas).color : color;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.font = `${fontPx}px ui-monospace, SFMono-Regular, Menlo, monospace`;
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";
      ctx.fillStyle = resolvedColor;

      for (let row = 0; row < rows; row++) {
        const fade = fadeBottom > 0 ? Math.max(0, 1 - (row / rows) * fadeBottom) : 1;
        for (let col = 0; col < cols; col++) {
          const index = row * cols + col;
          const brightness = trail[index] * fade;
          if (brightness < 0.04) continue;
          ctx.globalAlpha = brightness;
          ctx.fillText(glyphList[chars[index]], col * cellSize + cellSize / 2, row * cellSize + cellSize / 2);
        }
      }
      ctx.globalAlpha = 1;
    };

    const tick = (): void => {
      for (let i = 0; i < trail.length; i++) trail[i] *= 0.86;

      const active = Math.max(2, Math.round(cols * mutationRate * 8));
      for (let col = 0; col < cols; col++) {
        const head = drops[col];
        if (head < 0) continue;

        if (head < rows) {
          const index = head * cols + col;
          trail[index] = 1;
          chars[index] = Math.floor(Math.random() * glyphList.length);
          drops[col] = head + 1;
        } else if (Math.random() < 0.08) {
          // капля дошла до низа: у части колонок падение начинается заново
          drops[col] = -Math.floor(Math.random() * 6);
        } else {
          drops[col] = head + 1;
        }
      }

      // поддерживаем число активных колонок: капли не должны вымереть все сразу
      const running = drops.filter((drop) => drop >= 0 && drop < rows).length;
      for (let i = running; i < active; i++) {
        const column = Math.floor(Math.random() * cols);
        if (drops[column] < 0 || drops[column] >= rows) drops[column] = 0;
      }

      draw();
    };

    setup();
    draw();

    let timer: ReturnType<typeof setInterval> | null = null;
    let visible = false;

    const io = new IntersectionObserver(([entry]) => {
      const next = entry.isIntersecting;
      if (next === visible) return;
      visible = next;
      if (!visible || reduceMotion) {
        if (timer) {
          clearInterval(timer);
          timer = null;
        }
        return;
      }
      timer = setInterval(tick, interval);
    });

    io.observe(container);

    const ro = new ResizeObserver(() => {
      setup();
      draw();
    });
    ro.observe(container);

    return () => {
      if (timer) clearInterval(timer);
      io.disconnect();
      ro.disconnect();
    };
  }, [glyphs, cellSize, mutationRate, interval, fadeBottom, color, fontSize]);

  return (
    <div ref={containerRef} className={cn("relative h-full w-full", className)}>
      <canvas ref={canvasRef} className="pointer-events-none block" aria-hidden />
    </div>
  );
}
